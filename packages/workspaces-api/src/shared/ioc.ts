/*eslint indent: [2, 4, {"SwitchCase": 1}]*/
import CallbackFactory from "callback-registry";
import { EnterpriseController } from "../controllers/enterprise";
import { Bridge } from "../communication/bridge";
import { InteropTransport } from "../communication/interop-transport";
import { BaseBuilder } from "../builders/baseBuilder";
import { ParentBuilder } from "../builders/parentBuilder";
import { WorkspaceBuilder } from "../builders/workspaceBuilder";
import { ModelMaps, ModelTypes, FramePrivateData, WindowPrivateData, WorkspacePrivateData, ParentPrivateData } from "../types/privateData";
import { PrivateDataManager } from "./privateDataManager";
import { FrameCreateConfig, ModelCreateConfig, WindowCreateConfig, WorkspaceIoCCreateConfig, ParentCreateConfig } from "../types/ioc";
import { Frame } from "../models/frame";
import { Window } from "../models/window";
import { Workspace } from "../models/workspace";
import { ChildSnapshotResult, SwimlaneWindowSnapshotConfig, ParentSnapshotConfig } from "../types/protocol";
import { Child } from "../types/builders";
import { Row } from "../models/row";
import { Column } from "../models/column";
import { Group } from "../models/group";
import { Base } from "../models/base/base";
import { Glue42Workspaces } from "../../workspaces";
import { CoreController } from "../controllers/core";
import { WorkspacesController } from "../types/controller";
import { CoreFrameUtils } from "../communication/core-frame-utils";
import { InteropAPI, WindowsAPI, LayoutsAPI, ContextsAPI } from "../types/glue";
import { BaseController } from "../controllers/base";

export class IoC {

    private _controllerInstance: WorkspacesController;
    private _bridgeInstance: Bridge;
    private _transportInstance: InteropTransport;
    private _privateDataManagerInstance: PrivateDataManager;
    private _parentBaseInstance: Base;
    private _baseController: BaseController;

    constructor(
        private readonly agm: InteropAPI,
        private readonly windows: WindowsAPI,
        private readonly layouts: LayoutsAPI,
        private readonly contexts: ContextsAPI,
        private readonly assetsBaseLocation: string
    ) { }

    public get baseController(): BaseController {
        if (!this._baseController) {
            this._baseController = new BaseController(this, this.windows, this.contexts, this.layouts);
        }

        return this._baseController;
    }

    public get controller(): WorkspacesController {
        if (!this._controllerInstance) {
            this._controllerInstance = window.glue42gd ?
                new EnterpriseController(this.bridge, this.baseController) :
                new CoreController(this.bridge, new CoreFrameUtils(this.agm, this.windows, this.bridge, this.assetsBaseLocation), this.layouts, this.baseController);
        }
        return this._controllerInstance;
    }

    public get bridge(): Bridge {
        if (!this._bridgeInstance) {
            this._bridgeInstance = new Bridge(this.transport, CallbackFactory());
        }
        return this._bridgeInstance;
    }

    public get transport(): InteropTransport {

        if (!this._transportInstance) {
            this._transportInstance = new InteropTransport(this.agm);
        }

        return this._transportInstance;
    }

    public get privateDataManager(): PrivateDataManager {
        if (!this._privateDataManagerInstance) {
            this._privateDataManagerInstance = new PrivateDataManager();
        }
        return this._privateDataManagerInstance;
    }

    public get parentBase(): Base {
        if (!this._parentBaseInstance) {
            this._parentBaseInstance = new Base(this.privateDataManager);
        }
        return this._parentBaseInstance;
    }

    public async initiate(): Promise<void> {
        await this.transport.initiate();
    }

    public getModel<T extends ModelTypes>(type: ModelTypes, createConfig: ModelCreateConfig): ModelMaps[T] {
        switch (type) {
            case "frame": {
                const newFrame = new Frame(this.privateDataManager);

                const { summary } = createConfig as FrameCreateConfig;

                const frameData: FramePrivateData = { summary, controller: this.controller };

                this.privateDataManager.setFrameData(newFrame, frameData);

                return newFrame as ModelMaps[T];
            }
            case "window": {
                const { id, parent, frame, workspace, config } = createConfig as WindowCreateConfig;

                const windowPrivateData: WindowPrivateData = {
                    type: "window",
                    controller: this.controller,
                    config, id, parent, frame, workspace
                };

                const newWindow = new Window(this.privateDataManager);

                this.privateDataManager.setWindowData(newWindow, windowPrivateData);

                return newWindow as ModelMaps[T];
            }
            case "row":
            case "column":
            case "group": {
                const { id, children, parent, frame, workspace, config } = createConfig as ParentCreateConfig;

                const newParent = type === "column" ? new Column(this.parentBase) :
                    type === "row" ? new Row(this.parentBase) : new Group(this.parentBase);

                const builtChildren = this.buildChildren(children, frame, workspace, newParent);

                const parentPrivateData: ParentPrivateData = {
                    id, parent, frame, workspace, config, type,
                    controller: this.controller,
                    children: builtChildren,
                };

                this.privateDataManager.setParentData(newParent, parentPrivateData);

                return newParent as ModelMaps[T];
            }
            case "workspace": {
                const { snapshot, frame } = createConfig as WorkspaceIoCCreateConfig;

                const newWorkspace = new Workspace(this.privateDataManager);

                const children = this.buildChildren(snapshot.children, frame, newWorkspace, newWorkspace);

                const workspacePrivateData: WorkspacePrivateData = {
                    id: snapshot.id,
                    type: "workspace",
                    config: snapshot.config,
                    base: this.parentBase,
                    controller: this.controller,
                    children, frame, ioc: this
                };

                this.privateDataManager.setWorkspaceData(newWorkspace, workspacePrivateData);
                return newWorkspace as ModelMaps[T];
            }
            default: throw new Error(`Unrecognized type: ${type}`);
        }
    }

    public getBuilder(config: Glue42Workspaces.BuilderConfig): WorkspaceBuilder | ParentBuilder {
        config.definition = config.definition || {};

        if (!Array.isArray(config.definition.children)) {
            config.definition.children = [];
        }

        const baseBuilder = new BaseBuilder(this.getBuilder.bind(this));

        switch (config.type) {
            case "workspace": {
                return new WorkspaceBuilder(config.definition as Glue42Workspaces.WorkspaceDefinition, baseBuilder, this.controller);
            }
            case "row":
            case "column":
            case "group": {
                (config.definition as Glue42Workspaces.BoxDefinition).type = config.type;
                return new ParentBuilder(config.definition, baseBuilder);
            }
            default: throw new Error(`Unexpected Builder creation error, provided config: ${JSON.stringify(config)}`);
        }
    }

    private buildChildren(children: ChildSnapshotResult[], frame: Frame, workspace: Workspace, parent: Workspace | Row | Column | Group): Child[] {
        return children.map<Child>((child) => {
            switch (child.type) {
                case "window": return this.getModel<"window">("window", {
                    id: child.id,
                    config: child.config as SwimlaneWindowSnapshotConfig,
                    frame, workspace, parent
                });
                case "column": return this.getModel<"column">(child.type, {
                    id: child.id,
                    config: child.config as ParentSnapshotConfig,
                    children: child.children,
                    frame, workspace, parent
                });
                case "row": return this.getModel<"row">(child.type, {
                    id: child.id,
                    config: child.config as ParentSnapshotConfig,
                    children: child.children,
                    frame, workspace, parent
                });
                case "group": return this.getModel<"group">(child.type, {
                    id: child.id,
                    config: child.config as ParentSnapshotConfig,
                    children: child.children,
                    frame, workspace, parent
                });
                default: throw new Error(`Unsupported child type: ${child.type}`);
            }
        });
    }
}
