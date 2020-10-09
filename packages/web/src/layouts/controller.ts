/* tslint:disable:no-console no-empty */
import { Glue42Web } from "../../web";
import { LayoutStorage } from "./storage";
import { Windows } from "../windows/main";
import { LocalWebWindow } from "../windows/my";
import { LayoutEventMethodName, SaveContextMethodName } from "./constants";
import { Control } from "../control/control";
import { RemoteCommand, LayoutRemoteCommand, SaveAutoLayoutCommandArgs } from "../control/commands";
import { CallbackRegistry, default as CallbackRegistryFactory, UnsubscribeFunction } from "callback-registry";
import { LayoutEvent } from "./types";

export class LayoutsController {

    private autoSaveContext: boolean;
    private _registry: CallbackRegistry = CallbackRegistryFactory();
    private readyPromise: Promise<void>;

    constructor(
        private readonly storage: LayoutStorage,
        private readonly windows: Windows,
        private readonly control: Control,
        private readonly interop: Glue42Web.Interop.API,
        config?: Glue42Web.Config
    ) {
        this.autoSaveContext = config?.layouts?.autoSaveWindowContext ?? false;
        this.control.subscribe("layouts", this.handleControlMessage.bind(this));
        this.readyPromise = Promise.all([
            this.registerRequestMethods(),
            this.registerEventsMethod()
        ]).then(() => {
            console.log("methods are live");
            return;
        });
    }

    public ready(): Promise<void> {
        return this.readyPromise;
    }

    public async export(layoutType?: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        if (layoutType) {
            return this.storage.getAll(layoutType);
        }

        const [globalLayouts, workspaceLayouts] = await Promise.all([
            this.storage.getAll("Global"),
            this.storage.getAll("Workspace")
        ]);

        return globalLayouts.concat(workspaceLayouts);
    }

    public async import(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        await Promise.all(layouts.map(async (layout) => {
            const layoutEvent = (await this.get(layout.name, layout.type)) ? "layoutChanged" : "layoutAdded";

            await this.storage.store(layout, layout.type);

            this.emitLayoutEvent(layoutEvent, layout);
        }));
    }

    public async save(layoutOptions: Glue42Web.Layouts.NewLayoutOptions, autoSave = false): Promise<Glue42Web.Layouts.Layout> {
        const openedWindows = this.windows.getChildWindows().map((w) => w.id);

        const components = await this.getRemoteWindowsInfo(openedWindows);
        components.push(this.getLocalLayoutComponent(layoutOptions.context, true));

        const layout: Glue42Web.Layouts.Layout = {
            type: "Global",
            name: layoutOptions.name,
            components,
            context: layoutOptions.context || {},
            metadata: layoutOptions.metadata || {}
        };

        const layoutEvent = (await this.get(layoutOptions.name, "Global")) ? "layoutChanged" : "layoutAdded";

        if (autoSave) {
            this.storage.storeAutoLayout(layout);
        } else {
            await this.storage.store(layout, "Global");
        }

        this.emitLayoutEvent(layoutEvent, layout);

        return layout;
    }

    public async autoSave(layoutOptions: Glue42Web.Layouts.NewLayoutOptions): Promise<Glue42Web.Layouts.Layout> {
        return this.save(layoutOptions, true);
    }

    public async restore(options: Glue42Web.Layouts.RestoreOptions): Promise<void> {
        const layout = await this.storage.get(options.name, "Global");

        if (!layout) {
            throw new Error(`can not find layout with name ${options.name}`);
        }

        this.restoreComponents(layout);
    }

    public async restoreAutoSavedLayout(): Promise<void> {
        const layoutName = `_auto_${document.location.href}`;
        const layout = await this.storage.getAutoLayout(layoutName);

        if (!layout) {
            return Promise.resolve();
        }

        const my: LocalWebWindow = this.windows.my() as LocalWebWindow;
        if (my.parent) {
            // stop the restore at level 1
            return;
        }
        // set the context to our window
        const mainComponent = layout.components.find((c) => (c as Glue42Web.Layouts.WindowComponent).state.main) as Glue42Web.Layouts.WindowComponent;
        my.setContext(mainComponent?.state.context);

        try {
            this.restoreComponents(layout);
        } catch (e) {
            return;
        }
    }

    public async remove(type: Glue42Web.Layouts.LayoutType, name: string): Promise<void> {
        const layoutToRemove = await this.get(name, type);

        await this.storage.remove(name, type);

        if (layoutToRemove) {
            this.emitLayoutEvent("layoutRemoved", layoutToRemove);
        }
    }

    public async getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.LayoutSummary[]> {
        const allLayouts = await this.storage.getAll(type);
        return allLayouts.map((layout) => {
            return {
                name: layout.name,
                type: layout.type,
                context: layout.context,
                metadata: layout.metadata
            };
        });
    }

    public get(name: string, type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {
        return this.storage.get(name, type);
    }

    public getLocalLayoutComponent(context?: object, main = false): Glue42Web.Layouts.WindowComponent {
        let requestResult: Glue42Web.Layouts.SaveRequestResponse | undefined;
        const my = this.windows.my() as LocalWebWindow;

        try {
            if (this.autoSaveContext) {
                requestResult = {
                    windowContext: my.getContextSync()
                };
            }
        } catch (err) {
            // todo: log warn
            // console.warn(`onSaveRequested - error getting data from user function - ${err}`);
        }

        return {
            type: "window",
            componentType: "application",
            state: {
                name: my.name,
                context: requestResult?.windowContext || {},
                bounds: my.getBoundsSync(),
                url: window.document.location.href,
                id: my.id,
                parentId: my.parent,
                main
            }
        };
    }

    public onLayoutAdded(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        return this._registry.add("layoutAdded", callback);
    }

    public onLayoutChanged(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        return this._registry.add("layoutChanged", callback);
    }

    public onLayoutRemoved(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        return this._registry.add("layoutRemoved", callback);
    }

    private restoreComponents(layout: Glue42Web.Layouts.Layout): void {
        layout.components.forEach((c) => {
            if (c.type === "window") {
                const state = c.state;
                // do not restore the parent
                if (state.main) {
                    return;
                }
                const newWindowOptions: Glue42Web.Windows.CreateOptions = { ...state.bounds, context: state.context };
                this.windows.open(state.name, state.url, newWindowOptions);
            }
        });
    }

    private async getRemoteWindowsInfo(windows: string[]): Promise<Glue42Web.Layouts.WindowComponent[]> {
        const promises: Array<Promise<Glue42Web.Interop.InvocationResult<Glue42Web.Layouts.WindowComponent>>> = [];
        for (const id of windows) {
            const interopServer = this.interop.servers().find((s) => s.windowId === id);
            if (!interopServer || !interopServer.getMethods) {
                continue;
            }
            const methods = interopServer.getMethods();
            if (methods.find((m) => m.name === SaveContextMethodName)) {
                try {
                    promises.push(this.interop.invoke<Glue42Web.Layouts.WindowComponent>(SaveContextMethodName, {}, { windowId: id }));
                } catch {
                    // swallow
                }
            }
        }

        const responses = await Promise.all(promises);
        return responses.map((response) => response.returned);
    }

    private registerRequestMethods(): Promise<void> {
        return this.interop.register(SaveContextMethodName, (args) => {
            return this.getLocalLayoutComponent(args);
        });
    }

    private async handleControlMessage(command: RemoteCommand): Promise<void> {
        const layoutCommand = command as LayoutRemoteCommand;
        if (layoutCommand.command === "saveLayoutAndClose") {

            const args = layoutCommand.args as SaveAutoLayoutCommandArgs;

            const components = await this.getRemoteWindowsInfo(args.childWindows);

            components.push(args.parentInfo);

            await this.storage.storeAutoLayout({
                type: "Global",
                name: args.layoutName,
                components,
                context: args.context || {},
                metadata: args.metadata || {}
            });

            // now close everyone
            args.childWindows.forEach((cw) => {
                this.windows.findById(cw)?.close();
            });
        }
    }

    private registerEventsMethod(): Promise<void> {
        return this.interop.register(LayoutEventMethodName, (args) => {
            this._registry.execute(args.event, args.layout);
        });
    }

    private emitLayoutEvent(event: LayoutEvent, layout: Glue42Web.Layouts.Layout): void {

        const hasLayoutMethod = this.interop.methods().some((m) => m.name === LayoutEventMethodName);
        if (hasLayoutMethod) {
            // swallow notification error, because we can't handle it any better for now
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this.interop.invoke(LayoutEventMethodName, { event, layout }, "all").catch(() => { });
        }
    }
}
