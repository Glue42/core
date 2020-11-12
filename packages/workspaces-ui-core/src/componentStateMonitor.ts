import { ComponentFactory, DecoratedComponentFactory, VisibilityState } from "./types/internal";

class ComponentStateMonitor {

    private readonly visibilityState: VisibilityState = {
        logo: undefined,
        addWorkspace: undefined,
        systemButtons: undefined
    };

    private componentsFactory: ComponentFactory = {};
    private readonly _decoratedFactory: DecoratedComponentFactory = {};

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

        this.componentsFactory = incomingFactory;
    }

}

export default new ComponentStateMonitor();
