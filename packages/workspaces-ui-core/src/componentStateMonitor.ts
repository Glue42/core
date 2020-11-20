import { ComponentFactory, DecoratedComponentFactory, VisibilityState } from "./types/internal";
import createRegistry from "callback-registry";

class ComponentStateMonitor {

    private readonly visibilityState: VisibilityState = {
        logo: undefined,
        addWorkspace: undefined,
        systemButtons: undefined,
        workspaceContents: []
    };

    private componentsFactory: ComponentFactory = {};
    private readonly _decoratedFactory: DecoratedComponentFactory = {};
    private readonly callbackRegistry = createRegistry();
    private readonly observer = new MutationObserver((mutations) => {
        Array.from(mutations).forEach((m) => {
            const targetDiv = m.target as HTMLDivElement;

            const workspaceId = this.getWorkspaceIdFromContents(targetDiv);
            const action = targetDiv.style.display === "none" ? "workspace-contents-hidden" : "workspace-contents-shown";
            this.callbackRegistry.execute(action, workspaceId);
        });
    });

    public get decoratedFactory() {
        return this._decoratedFactory;
    }

    public init(frameId: string, componentsFactory?: ComponentFactory) {
        this.componentsFactory = componentsFactory;
        if (componentsFactory?.createAddWorkspace) {
            this.decoratedFactory.createAddWorkspace = (...args) => {
                this.visibilityState.addWorkspace = [...args, frameId] as any;

                return this.componentsFactory.createAddWorkspace(...this.visibilityState.addWorkspace);
            };
        }

        if (componentsFactory?.createLogo) {
            this.decoratedFactory.createLogo = (...args) => {
                this.visibilityState.logo = [...args, frameId] as any;

                return this.componentsFactory.createLogo(...this.visibilityState.logo);
            };
        }

        if (componentsFactory?.createSystemButtons) {
            this.decoratedFactory.createSystemButtons = (...args) => {
                this.visibilityState.systemButtons = [...args, frameId];

                return componentsFactory.createSystemButtons(...this.visibilityState.systemButtons);
            };
        }

        if (componentsFactory?.createWorkspaceContents) {
            this.decoratedFactory.createWorkspaceContents = (...args) => {
                this.visibilityState.workspaceContents.push([...args]);

                this.subscribeForWorkspaceContentsVisibility(args[0]?.workspaceId);
                return componentsFactory.createWorkspaceContents(...args);
            };
        }
    }

    public reInitialize(incomingFactory?: ComponentFactory) {
        if (incomingFactory?.createAddWorkspace && this.visibilityState.addWorkspace) {
            incomingFactory.createAddWorkspace(...this.visibilityState.addWorkspace);
        }

        if (incomingFactory?.createLogo && this.visibilityState.logo) {
            incomingFactory.createLogo(...this.visibilityState.logo);
        }

        if (incomingFactory?.createSystemButtons && this.visibilityState.systemButtons) {
            incomingFactory.createSystemButtons(...this.visibilityState.systemButtons);
        }

        if (incomingFactory?.createWorkspaceContents) {
            this.visibilityState.workspaceContents.forEach((wc) => {
                incomingFactory.createWorkspaceContents(...wc);
            });
        }

        this.componentsFactory = incomingFactory;
    }

    public onWorkspaceContentsShown(callback: (workspaceId: string) => void) {
        this.callbackRegistry.add("workspace-contents-shown", callback);
    }

    public onWorkspaceContentsHidden(callback: (workspaceId: string) => void) {
        this.callbackRegistry.add("workspace-contents-hidden", callback);
    }

    private subscribeForWorkspaceContentsVisibility(workspaceId: string) {
        const contentsElement = document.getElementById(`nestHere${workspaceId}`);
        if (!contentsElement) {
            return;
        }
        this.observer.observe(contentsElement, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    private getWorkspaceIdFromContents(element: HTMLElement) {
        return element.id.split("nestHere")[1];
    }

}

export default new ComponentStateMonitor();
