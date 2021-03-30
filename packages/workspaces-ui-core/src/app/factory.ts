import GoldenLayout from "@glue42/golden-layout";
import { Glue42Web } from "@glue42/web";
import { generate } from "shortid";
import { WorkspacesManager } from "../manager";
import { EmptyVisibleWindowName, PlatformControlMethod } from "../constants";
import { IFrameController } from "../iframeController";
import { LayoutStateResolver } from "../layout/stateResolver";
import store from "../store";
import { getElementBounds, idAsString } from "../utils";
import createRegistry from "callback-registry";
import { Window, WindowSummary } from "../types/internal";

export class ApplicationFactory {
    private readonly registry = createRegistry();
    private readonly WAIT_FOR_WINDOWS_TIMEOUT = 30000;

    constructor(
        private readonly _glue: Glue42Web.API,
        private readonly _stateResolver: LayoutStateResolver,
        private readonly _frameController: IFrameController,
        private readonly _manager: WorkspacesManager,
    ) { }

    public async start(component: GoldenLayout.Component, workspaceId: string) {
        if (component.config.componentName === EmptyVisibleWindowName) {
            return;
        }
        const workspace = store.getById(workspaceId);
        const newWindowBounds = getElementBounds(component.element);
        const { componentState } = component.config;
        const { title, appName } = componentState;
        let { windowId } = componentState;
        const componentId = idAsString(component.config.id);
        const applicationTitle = this.getTitleByAppName(appName);
        const windowTitle = this.vaidateTitle(title) || this.vaidateTitle(applicationTitle) || this.vaidateTitle(appName) || "Glue";
        const windowContext = component?.config.componentState?.context;
        let url = this.getUrlByAppName(componentState.appName) || componentState.url;

        const isNewWindow = !store.getWindow(componentId);
        const isHibernatedWindow = workspace.hibernatedWindows.some(w => w.id === idAsString(component.config.id));

        store.addWindow({
            id: componentId,
            bounds: newWindowBounds,
            windowId,
            url,
            appName
        }, workspace.id);

        if (!url && windowId) {
            const win = this._glue.windows.list().find((w) => w.id === windowId);

            url = await win.getURL();
            const newlyAddedWindow = store.getWindow(componentId) as Window;

            newlyAddedWindow.url = url;
        }

        windowId = windowId || generate();

        if (component.config.componentState?.context) {
            delete component.config.componentState.context;
        }

        component.config.componentState.url = url;
        if (windowTitle) {
            component.setTitle(windowTitle);
        }
        if (isNewWindow && !isHibernatedWindow) {
            const windowSummary = this._stateResolver.getWindowSummarySync(componentId, component);
            this._manager.workspacesEventEmitter.raiseWindowEvent({
                action: "added",
                payload: {
                    windowSummary
                }
            });

            const glueWinOutsideOfWorkspace = this._glue.windows.findById(windowId);
            if (glueWinOutsideOfWorkspace) {
                try {
                    // Glue windows with the given id should be closed
                    await glueWinOutsideOfWorkspace.close();
                } catch (error) {
                    // because of chrome security policy this call can fail,
                    // however the opening of a new window should continue
                }
            }
        }

        try {
            await this.notifyFrameWillStart(windowId, appName, windowContext, windowTitle);
            await this._frameController.startFrame(componentId, url, undefined, windowId);
            const newlyAddedWindow = store.getWindow(componentId) as Window;

            component.config.componentState.windowId = windowId;
            newlyAddedWindow.windowId = windowId;

            const newlyOpenedWindow = this._glue.windows.findById(windowId);
            newlyOpenedWindow.getTitle().then((winTitle) => {
                if (this.vaidateTitle(windowTitle)) {
                    component.setTitle(winTitle);
                }
            }).catch((e) => {
                console.warn("Failed while setting the window title", e);
            });

            this._frameController.moveFrame(componentId, getElementBounds(component.element));

            if (isNewWindow && !isHibernatedWindow) {
                this._manager.workspacesEventEmitter.raiseWindowEvent({
                    action: "loaded",
                    payload: {
                        windowSummary: await this._stateResolver.getWindowSummary(componentId)
                    }
                });
            }

            if (!appName) {
                const appNameToUse = this.getAppNameByWindowId(windowId);
                if (!component.config.componentState) {
                    throw new Error(`Invalid state - the created component ${componentId} with windowId ${windowId} is missing its state object`);
                }
                component.config.componentState.appName = appNameToUse;


                newlyAddedWindow.appName = appNameToUse;
            }

        } catch (error) {
            this.raiseFailed(component, workspaceId);
            // If a frame doesn't initialize properly remove its windowId
            component.config.componentState.windowId = undefined;
            if (url) {
                this._frameController.moveFrame(componentId, getElementBounds(component.element));
            } else {
                this._manager.closeTab(component, false);
            }
            const wsp = store.getById(workspaceId);
            if (!wsp) {
                throw new Error(`Workspace ${workspaceId} failed ot initialize because none of the specified windows were able to load
                Internal error: ${error}`);
            }
        } finally {
            workspace.hibernatedWindows = workspace.hibernatedWindows.filter((hw) => hw.id !== idAsString(component.config.id));
        }
    }

    public notifyFrameWillClose(windowId: string, appName?: string) {
        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "unregisterWorkspaceApp" : "unregisterWorkspaceWindow",
            data: {
                windowId,
            }
        });
    }

    public onStarted(callback: (args: { summary: WindowSummary }) => void) {
        return this.registry.add("on-started", callback);
    }

    public onLoaded(callback: (args: { summary: WindowSummary }) => void) {
        return this.registry.add("on-loaded", callback);
    }

    public onFailed(callback: (args: { component: GoldenLayout.Component, workspaceId: string }) => void) {
        return this.registry.add("on-failed", callback);
    }

    public waitForWindows(workspaceId: string, windowComponentIds: string[]) {
        return new Promise<void>((res, rej) => {
            let loadedUnsub = () => { };
            let failedUnsub = () => { };
            let timeout: NodeJS.Timeout;


            const [ready, result] = this.waitFor(windowComponentIds.length, () => {
                res();
                loadedUnsub();
                failedUnsub();
                clearTimeout(timeout);
            });

            timeout = setTimeout(() => {
                rej(`Waiting for windows ${JSON.stringify(windowComponentIds)} in workspace ${workspaceId}, but only heard ${JSON.stringify(result())} in ${this.WAIT_FOR_WINDOWS_TIMEOUT} seconds`)
            }, this.WAIT_FOR_WINDOWS_TIMEOUT);

            loadedUnsub = this.onLoaded(({ summary }) => {
                if (summary.config.workspaceId === workspaceId && windowComponentIds.includes(summary.itemId)) {
                    ready(summary.itemId);
                }
            });

            failedUnsub = this.onFailed((args) => {
                if (args.workspaceId === workspaceId && windowComponentIds.includes(idAsString(args.component.config.id))) {
                    ready(args.component.config.id);
                }
            });
        });
    }

    public getUrlByAppName(appName: string): string {
        if (!appName) {
            return undefined;
        }
        return this._glue.appManager?.application(appName)?.userProperties?.details?.url;
    }

    private raiseStarted(summary: WindowSummary) {
        this.registry.execute("on-started", { summary });
    }

    private raiseLoaded(summary: WindowSummary) {
        this.registry.execute("on-loaded", { summary });
    }

    private raiseFailed(component: GoldenLayout.Component, workspaceId: string) {
        this.registry.execute("on-failed", { component, workspaceId });
    }

    private getTitleByAppName(appName: string): string {
        if (!appName) {
            return undefined;
        }
        return this._glue.appManager?.application(appName)?.title;
    }

    private getAppNameByWindowId(windowId: string): string {
        return this._glue.appManager?.instances()?.find(i => i.id === windowId)?.application?.name;
    }

    private notifyFrameWillStart(windowId: string, appName?: string, context?: any, title?: string) {
        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "registerWorkspaceApp" : "registerWorkspaceWindow",
            data: {
                name: `${appName || "window"}_${windowId}`,
                windowId,
                frameId: this._manager.frameId,
                appName,
                context,
                title
            }
        });
    }

    private waitFor(numberOfTriggers: number, callback: () => void): [(x: any) => void, () => void] {
        let triggersActivated = [] as any[];

        return [
            (x: any) => {
                triggersActivated.push(x);
                if (triggersActivated.length === numberOfTriggers) {
                    callback();
                }
            },
            () => triggersActivated
        ]
    }

    private vaidateTitle(title: string) {
        if (!title?.length) {
            return undefined;
        }

        return title;
    }
}