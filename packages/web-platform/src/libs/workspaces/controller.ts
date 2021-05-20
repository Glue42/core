/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { BridgeOperation, InternalPlatformConfig, LibController } from "../../common/types";
import { addContainerConfigDecoder, addItemResultDecoder, addWindowConfigDecoder, bundleConfigDecoder, deleteLayoutConfigDecoder, exportedLayoutsResultDecoder, frameBoundsResultDecoder, frameHelloDecoder, frameSnapshotResultDecoder, frameStateConfigDecoder, frameStateResultDecoder, frameSummariesResultDecoder, frameSummaryDecoder, getFrameSummaryConfigDecoder, isWindowInSwimlaneResultDecoder, layoutSummariesDecoder, lockContainerDecoder, lockWindowDecoder, lockWorkspaceDecoder, moveFrameConfigDecoder, moveWindowConfigDecoder, openWorkspaceConfigDecoder, resizeItemConfigDecoder, setItemTitleConfigDecoder, simpleItemConfigDecoder, simpleWindowOperationSuccessResultDecoder, voidResultDecoder, workspaceCreateConfigDecoder, workspaceLayoutDecoder, workspaceLayoutSaveConfigDecoder, workspaceSelectorDecoder, workspacesLayoutImportConfigDecoder, workspaceSnapshotResultDecoder, workspacesOperationDecoder, workspaceSummariesResultDecoder } from "./decoders";
import { FramesController } from "./frames";
import { AddContainerConfig, AddItemResult, AddWindowConfig, BundleConfig, DeleteLayoutConfig, ExportedLayoutsResult, FrameBoundsResult, FrameHello, FrameSnapshotResult, FrameStateConfig, FrameStateResult, FrameSummariesResult, FrameSummaryResult, GetFrameSummaryConfig, IsWindowInSwimlaneResult, LayoutSummariesResult, LayoutSummary, LockContainerConfig, LockWindowConfig, LockWorkspaceConfig, MoveFrameConfig, MoveWindowConfig, OpenWorkspaceConfig, ResizeItemConfig, SetItemTitleConfig, SimpleItemConfig, SimpleWindowOperationSuccessResult, WorkspaceCreateConfigProtocol, WorkspaceEventPayload, WorkspaceSelector, WorkspacesLayoutImportConfig, WorkspaceSnapshotResult, WorkspacesOperationsTypes, WorkspaceStreamData, WorkspaceSummariesResult, WorkspaceSummaryResult } from "./types";
import logger from "../../shared/logger";
import { Glue42WebPlatform } from "../../../platform";
import { GlueController } from "../../controllers/glue";
import { IoC } from "../../shared/ioc";
import { FrameWindowBoundsResult, SimpleWindowCommand, WindowMoveResizeConfig } from "../windows/types";
import { StateController } from "../../controllers/state";
import { WorkspaceHibernationWatcher } from "./hibernationWatcher";
import { workspacesConfigDecoder } from "../../shared/decoders";
import deepMerge from "deepmerge";
import { defaultLoadingConfig } from "./defaultConfig";

export class WorkspacesController implements LibController {
    private started = false;
    private settings!: Glue42WebPlatform.Workspaces.Config;

    private operations: { [key in WorkspacesOperationsTypes]: BridgeOperation } = {
        frameHello: { name: "frameHello", dataDecoder: frameHelloDecoder, execute: this.handleFrameHello.bind(this) },
        isWindowInWorkspace: { name: "isWindowInWorkspace", dataDecoder: simpleItemConfigDecoder, resultDecoder: isWindowInSwimlaneResultDecoder, execute: this.isWindowInWorkspace.bind(this) },
        createWorkspace: { name: "createWorkspace", dataDecoder: workspaceCreateConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder, execute: this.createWorkspace.bind(this) },
        getAllFramesSummaries: { name: "getAllFramesSummaries", resultDecoder: frameSummariesResultDecoder, execute: this.getAllFramesSummaries.bind(this) },
        getFrameSummary: { name: "getFrameSummary", dataDecoder: getFrameSummaryConfigDecoder, resultDecoder: frameSummaryDecoder, execute: this.getFrameSummary.bind(this) },
        getAllWorkspacesSummaries: { name: "getAllWorkspacesSummaries", resultDecoder: workspaceSummariesResultDecoder, execute: this.getAllWorkspacesSummaries.bind(this) },
        getWorkspaceSnapshot: { name: "getWorkspaceSnapshot", dataDecoder: simpleItemConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder, execute: this.getWorkspaceSnapshot.bind(this) },
        getAllLayoutsSummaries: { name: "getAllLayoutsSummaries", resultDecoder: layoutSummariesDecoder, execute: this.getAllLayoutsSummaries.bind(this) },
        openWorkspace: { name: "openWorkspace", dataDecoder: openWorkspaceConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder, execute: this.openWorkspace.bind(this) },
        deleteLayout: { name: "deleteLayout", dataDecoder: deleteLayoutConfigDecoder, resultDecoder: voidResultDecoder, execute: this.deleteLayout.bind(this) },
        saveLayout: { name: "saveLayout", dataDecoder: workspaceLayoutSaveConfigDecoder, resultDecoder: workspaceLayoutDecoder, execute: this.saveLayout.bind(this) },
        importLayout: { name: "importLayout", dataDecoder: workspacesLayoutImportConfigDecoder, resultDecoder: voidResultDecoder, execute: this.importLayout.bind(this) },
        exportAllLayouts: { name: "exportAllLayouts", resultDecoder: exportedLayoutsResultDecoder, execute: this.exportAllLayouts.bind(this) },
        restoreItem: { name: "restoreItem", dataDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder, execute: this.restoreItem.bind(this) },
        maximizeItem: { name: "maximizeItem", dataDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder, execute: this.maximizeItem.bind(this) },
        focusItem: { name: "focusItem", dataDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder, execute: this.focusItem.bind(this) },
        closeItem: { name: "closeItem", dataDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder, execute: this.closeItem.bind(this) },
        resizeItem: { name: "resizeItem", dataDecoder: resizeItemConfigDecoder, resultDecoder: voidResultDecoder, execute: this.resizeItem.bind(this) },
        changeFrameState: { name: "changeFrameState", dataDecoder: frameStateConfigDecoder, resultDecoder: voidResultDecoder, execute: this.changeFrameState.bind(this) },
        getFrameState: { name: "getFrameState", dataDecoder: simpleItemConfigDecoder, resultDecoder: frameStateResultDecoder, execute: this.getFrameState.bind(this) },
        getFrameBounds: { name: "getFrameBounds", dataDecoder: simpleItemConfigDecoder, resultDecoder: frameBoundsResultDecoder, execute: this.getFrameBounds.bind(this) },
        moveFrame: { name: "moveFrame", dataDecoder: moveFrameConfigDecoder, resultDecoder: voidResultDecoder, execute: this.moveFrame.bind(this) },
        getFrameSnapshot: { name: "getFrameSnapshot", dataDecoder: simpleItemConfigDecoder, resultDecoder: frameSnapshotResultDecoder, execute: this.getFrameSnapshot.bind(this) },
        forceLoadWindow: { name: "forceLoadWindow", dataDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder, execute: this.forceLoadWindow.bind(this) },
        ejectWindow: { name: "ejectWindow", dataDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder, execute: this.ejectWindow.bind(this) },
        setItemTitle: { name: "setItemTitle", dataDecoder: setItemTitleConfigDecoder, resultDecoder: voidResultDecoder, execute: this.setItemTitle.bind(this) },
        moveWindowTo: { name: "moveWindowTo", dataDecoder: moveWindowConfigDecoder, resultDecoder: voidResultDecoder, execute: this.moveWindowTo.bind(this) },
        addWindow: { name: "addWindow", dataDecoder: addWindowConfigDecoder, resultDecoder: addItemResultDecoder, execute: this.addWindow.bind(this) },
        addContainer: { name: "addContainer", dataDecoder: addContainerConfigDecoder, resultDecoder: addItemResultDecoder, execute: this.addContainer.bind(this) },
        bundleWorkspace: { name: "bundleWorkspace", dataDecoder: bundleConfigDecoder, resultDecoder: voidResultDecoder, execute: this.bundleWorkspace.bind(this) },
        hibernateWorkspace: { name: "hibernateWorkspace", dataDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder, execute: this.hibernateWorkspace.bind(this) },
        resumeWorkspace: { name: "resumeWorkspace", dataDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder, execute: this.resumeWorkspace.bind(this) },
        getWorkspacesConfig: { name: "getWorkspacesConfig", resultDecoder: workspacesConfigDecoder, execute: this.getWorkspacesConfiguration.bind(this) },
        lockWorkspace: { name: "lockWorkspace", dataDecoder: lockWorkspaceDecoder, resultDecoder: voidResultDecoder, execute: this.lockWorkspace.bind(this) },
        lockWindow: { name: "lockWindow", dataDecoder: lockWindowDecoder, resultDecoder: voidResultDecoder, execute: this.lockWindow.bind(this) },
        lockContainer: { name: "lockContainer", dataDecoder: lockContainerDecoder, resultDecoder: voidResultDecoder, execute: this.lockContainer.bind(this) }
    }

    constructor(
        private readonly framesController: FramesController,
        private readonly glueController: GlueController,
        private readonly stateController: StateController,
        private readonly hibernationWatcher: WorkspaceHibernationWatcher,
        private readonly ioc: IoC
    ) { }

    public async start(config: InternalPlatformConfig): Promise<void> {
        if (!config.workspaces) {
            this.started = false;
            return;
        }

        this.settings = this.applyDefaults(config.workspaces);

        if (this.settings.hibernation) {
            this.hibernationWatcher.start(this, this.settings.hibernation);
        }

        await Promise.all([
            this.glueController.createWorkspacesStream(),
            this.glueController.createWorkspacesEventsReceiver(this.handleWorkspaceEvent.bind(this))
        ]);

        await this.framesController.start(config.workspaces, config.windows.defaultWindowOpenBounds, this.operations.getFrameSummary);

        this.stateController.onWindowDisappeared((windowId) => this.framesController.handleFrameDisappeared(windowId));

        this.started = true;
    }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("workspaces.controller");
    }

    public async handleControl(args: any): Promise<any> {
        if (!this.started) {
            throw new Error("Cannot handle this workspaces control message, because the controller has not been started");
        }

        const workspacesData = args.data;

        const commandId = args.commandId;

        const operationValidation = workspacesOperationDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This workspace request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: WorkspacesOperationsTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(workspacesData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`Workspace request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(workspacesData)}`);

        const result = await this.operations[operationName].execute(workspacesData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`Workspace request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public handleClientUnloaded(windowId: string, win: Window): void {
        this.logger?.trace(`handling unloading of ${windowId}`);

        if (!win || win.closed) {
            this.logger?.trace(`${windowId} detected as closed, checking if frame and processing close`);
            this.framesController.handleFrameDisappeared(windowId);
        }
    }

    public handleWorkspaceEvent(data: WorkspaceEventPayload): void {
        this.glueController.pushWorkspacesMessage(data);

        if (this.settings.hibernation) {
            this.hibernationWatcher.notifyEvent(data);
        }

    }

    public async closeItem(config: SimpleItemConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling closeItem request with config ${JSON.stringify(config)}`);

        const frameToFocus = this.framesController.getAll().find((frame) => frame.windowId === config.itemId);

        if (frameToFocus) {
            this.logger?.trace(`[${commandId}] this is targeted at a frame, closing the frame`);

            window.open(undefined, frameToFocus.windowId)?.close();

            this.logger?.trace(`[${commandId}] the frame window is closed`);
            return;
        }

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<SimpleItemConfig, void>(this.operations.closeItem, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    public async setItemTitle(config: SetItemTitleConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling setItemTitle request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<SetItemTitleConfig, void>(this.operations.setItemTitle, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    public async hibernateWorkspace(config: WorkspaceSelector, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling hibernateWorkspace request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.workspaceId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<WorkspaceSelector, void>(this.operations.hibernateWorkspace, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    public async getWorkspacesConfiguration(config: unknown, commandId: string): Promise<Glue42WebPlatform.Workspaces.Config> {
        this.logger?.trace(`[${commandId}] handling getWorkspacesConfiguration request`);

        return this.settings;
    }

    private async handleFrameHello(config: FrameHello, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling handleFrameHello command with config: ${JSON.stringify(config)}`);

        if (config.windowId) {
            this.framesController.processNewHello(config.windowId);
        }
    }

    private async isWindowInWorkspace(config: SimpleItemConfig, commandId: string): Promise<IsWindowInSwimlaneResult> {
        this.logger?.trace(`[${commandId}] handling isWindowInWorkspace command with config: ${JSON.stringify(config)}`);

        const allFrames = this.framesController.getAll();

        this.logger?.trace(`[${commandId}] sending isWindowInWorkspace to all known frames: ${allFrames.join(", ")}`);

        const result = await Promise.all(allFrames.map((frame) => this.glueController.callFrame<SimpleItemConfig, IsWindowInSwimlaneResult>(
            this.operations.isWindowInWorkspace, config, frame.windowId
        )));

        const inWorkspace = result.some((res) => res.inWorkspace);

        this.logger?.trace(`[${commandId}] all frames responded, returning ${inWorkspace} to the caller`);

        return { inWorkspace };
    }

    private async createWorkspace(config: WorkspaceCreateConfigProtocol, commandId: string): Promise<WorkspaceSnapshotResult> {
        this.logger?.trace(`[${commandId}] handling createWorkspace command`);

        const frameInstanceConfig = {
            frameId: config.frame?.reuseFrameId,
            newFrame: config.frame?.newFrame,
            itemId: config.config?.reuseWorkspaceId
        };

        const frame = await this.framesController.getFrameInstance(frameInstanceConfig);

        this.logger?.trace(`[${commandId}] calling frame: ${frame.windowId}, based on selection config: ${JSON.stringify(frameInstanceConfig)}`);

        const result = await this.glueController.callFrame<WorkspaceCreateConfigProtocol, WorkspaceSnapshotResult>(this.operations.createWorkspace, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} responded with a valid snapshot, returning to caller`);

        return result;
    }

    private async getAllFramesSummaries(config: unknown, commandId: string): Promise<FrameSummariesResult> {
        this.logger?.trace(`[${commandId}] handling getAllFramesSummaries request`);

        const allFrames = await this.framesController.getAll();

        this.logger?.trace(`[${commandId}] sending getFrameSummary to all known frames: ${allFrames.join(", ")}`);

        const summaries = await Promise.all(allFrames.map((frame) => this.glueController.callFrame<GetFrameSummaryConfig, FrameSummaryResult>(
            this.operations.getFrameSummary, { itemId: frame.windowId }, frame.windowId
        )));

        const verifiedSummaries = summaries.filter((sum) => sum.id !== "none");

        this.logger?.trace(`[${commandId}] all frames responded, returning to caller`);

        return { summaries: verifiedSummaries };
    }

    private async getFrameSummary(config: GetFrameSummaryConfig, commandId: string): Promise<FrameSummaryResult> {
        this.logger?.trace(`[${commandId}] handling getFrameSummary request for config: ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] forwarding getFrameSummary to frame ${frame.windowId}`);

        const summary = await this.glueController.callFrame<GetFrameSummaryConfig, FrameSummaryResult>(this.operations.getFrameSummary, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} responded with a valid summary, returning to caller`);

        return summary;
    }

    public async getAllWorkspacesSummaries(config: unknown, commandId: string): Promise<WorkspaceSummariesResult> {
        this.logger?.trace(`[${commandId}] handling getAllWorkspacesSummaries request`);

        const allFrames = this.framesController.getAll();

        this.logger?.trace(`[${commandId}] sending getAllWorkspacesSummaries to all known frames: ${allFrames.join(", ")}`);

        const results = await Promise.all(allFrames.map((frame) => this.glueController.callFrame<object, WorkspaceSummariesResult>(
            this.operations.getAllWorkspacesSummaries, {}, frame.windowId
        )));

        const summaries = results.reduce<WorkspaceSummaryResult[]>((soFar, result) => {

            soFar.push(...result.summaries);

            return soFar;
        }, []);

        this.logger?.trace(`[${commandId}] all frames responded, results were aggregated, returning to caller`);

        return { summaries };
    }

    public async getWorkspaceSnapshot(config: SimpleItemConfig, commandId: string): Promise<WorkspaceSnapshotResult> {
        this.logger?.trace(`[${commandId}] handling getWorkspaceSnapshot for config: ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<SimpleItemConfig, WorkspaceSnapshotResult>(this.operations.getWorkspaceSnapshot, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} responded with a valid snapshot, retuning to caller`);

        return result;
    }

    private async getAllLayoutsSummaries(config: unknown, commandId: string): Promise<LayoutSummariesResult> {
        this.logger?.trace(`[${commandId}] handling getAllLayoutsSummaries command`);

        const all = await this.ioc.layoutsController.handleGetAll({ type: "Workspace" }, commandId);

        const summaries = all.summaries.map<LayoutSummary>((summary) => ({ name: summary.name }));

        this.logger?.trace(`[${commandId}] all layouts retrieved and mapped, returning to caller`);

        return { summaries };
    }

    private async openWorkspace(config: OpenWorkspaceConfig, commandId: string): Promise<WorkspaceSnapshotResult> {
        this.logger?.trace(`[${commandId}] handling openWorkspace command for name: ${config.name}`);

        const frameQueryConfig = {
            frameId: config.restoreOptions?.frameId,
            newFrame: config.restoreOptions?.newFrame,
            itemId: config.restoreOptions?.reuseWorkspaceId
        };

        const frame = await this.framesController.getFrameInstance(frameQueryConfig);

        const result = await this.glueController.callFrame<OpenWorkspaceConfig, WorkspaceSnapshotResult>(this.operations.openWorkspace, config, frame.windowId);

        return result;
    }

    private async deleteLayout(config: DeleteLayoutConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling deleteLayout request for name: ${config.name}`);

        await this.ioc.layoutsController.handleRemove({ name: config.name, type: "Workspace" }, commandId);

        this.logger?.trace(`[${commandId}] layouts reported this layout as deleted, responding to caller`);
    }

    private async saveLayout(config: Glue42Workspaces.WorkspaceLayoutSaveConfig, commandId: string): Promise<Glue42Workspaces.WorkspaceLayout> {
        this.logger?.trace(`[${commandId}] handling saveLayout request for workspace ${config.workspaceId} and name ${config.name}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.workspaceId });

        this.logger?.trace(`[${commandId}] forwarding request to frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<Glue42Workspaces.WorkspaceLayoutSaveConfig, Glue42Workspaces.WorkspaceLayout>(
            this.operations.saveLayout, config, frame.windowId
        );

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} responded with a valid layout, returning to caller`);

        return result;
    }

    private async importLayout(config: WorkspacesLayoutImportConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling importLayout command for layout ${config.layout.name}`);

        await this.ioc.layoutsController.handleImport({ layouts: [config.layout], mode: config.mode }, commandId);

        this.logger?.trace(`[${commandId}] the layouts controller successfully imported the layout, responding to caller`);
    }

    private async exportAllLayouts(config: unknown, commandId: string): Promise<ExportedLayoutsResult> {
        this.logger?.trace(`[${commandId}] handling exportAllLayouts request`);

        const result = await this.ioc.layoutsController.handleExport({ type: "Workspace" }, commandId);

        return result as ExportedLayoutsResult;
    }

    private async restoreItem(config: SimpleItemConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling restoreItem request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<SimpleItemConfig, void>(this.operations.restoreItem, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async maximizeItem(config: SimpleItemConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling maximizeItem request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<SimpleItemConfig, void>(this.operations.maximizeItem, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async focusItem(config: SimpleItemConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling focusItem request with config ${JSON.stringify(config)}`);

        const frameToFocus = this.framesController.getAll().find((frame) => frame.windowId === config.itemId);

        if (frameToFocus) {
            this.logger?.trace(`[${commandId}] this is targeted at a frame, focusing the frame`);
            window.open(undefined, frameToFocus.windowId);
            return;
        }

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<SimpleItemConfig, void>(this.operations.focusItem, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async resizeItem(config: ResizeItemConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling resizeItem request with config ${JSON.stringify(config)}`);

        const targetedFrame = this.framesController.getAll().find((fr) => fr.windowId === config.itemId);

        if (targetedFrame) {
            this.logger?.trace(`[${commandId}] detected targeted item is frame, building window resize config`);

            const resizeConfig: WindowMoveResizeConfig = {
                windowId: config.itemId,
                width: config.width,
                height: config.height,
                relative: config.relative
            };

            await this.glueController.callWindow<WindowMoveResizeConfig, void>(this.ioc.windowsController.moveResizeOperation, resizeConfig, targetedFrame.windowId);

            this.logger?.trace(`[${commandId}] window resize responded with success, returning to caller`);

            return;
        }

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeted item is not a frame, it is located in frame ${frame.windowId}`);

        await this.glueController.callFrame<ResizeItemConfig, void>(this.operations.resizeItem, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async getFrameSnapshot(config: SimpleItemConfig, commandId: string): Promise<FrameSnapshotResult> {
        this.logger?.trace(`[${commandId}] handling getFrameSnapshot request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<SimpleItemConfig, FrameSnapshotResult>(this.operations.getFrameSnapshot, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);

        return result;
    }

    private async forceLoadWindow(config: SimpleItemConfig, commandId: string): Promise<SimpleWindowOperationSuccessResult> {
        this.logger?.trace(`[${commandId}] handling forceLoadWindow request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<SimpleItemConfig, SimpleWindowOperationSuccessResult>(this.operations.forceLoadWindow, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);

        return result;
    }

    private async ejectWindow(config: SimpleItemConfig, commandId: string): Promise<SimpleWindowOperationSuccessResult> {
        this.logger?.trace(`[${commandId}] handling ejectWindow request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<SimpleItemConfig, SimpleWindowOperationSuccessResult>(this.operations.ejectWindow, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);

        return result;
    }

    private async moveWindowTo(config: MoveWindowConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling moveWindowTo request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance(config);

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<MoveWindowConfig, void>(this.operations.moveWindowTo, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async addWindow(config: AddWindowConfig, commandId: string): Promise<AddItemResult> {
        this.logger?.trace(`[${commandId}] handling addWindow request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.parentId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<AddWindowConfig, AddItemResult>(this.operations.addWindow, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal: ${JSON.stringify(result)}, responding to caller`);

        return result;
    }

    private async addContainer(config: AddContainerConfig, commandId: string): Promise<AddItemResult> {
        this.logger?.trace(`[${commandId}] handling addContainer request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.parentId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        const result = await this.glueController.callFrame<AddContainerConfig, AddItemResult>(this.operations.addContainer, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal: ${JSON.stringify(result)}, responding to caller`);

        return result;
    }

    private async bundleWorkspace(config: BundleConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling bundleWorkspace request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.workspaceId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<BundleConfig, void>(this.operations.bundleWorkspace, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async resumeWorkspace(config: WorkspaceSelector, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling resumeWorkspace request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.workspaceId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<WorkspaceSelector, void>(this.operations.resumeWorkspace, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async lockWorkspace(config: LockWorkspaceConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling lockWorkspace request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.workspaceId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<LockWorkspaceConfig, void>(this.operations.lockWorkspace, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async lockContainer(config: LockContainerConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling lockContainer request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.itemId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<LockContainerConfig, void>(this.operations.lockContainer, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async lockWindow(config: LockWindowConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling lockWindow request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ itemId: config.windowPlacementId });

        this.logger?.trace(`[${commandId}] targeting frame ${frame.windowId}`);

        await this.glueController.callFrame<LockWindowConfig, void>(this.operations.lockWindow, config, frame.windowId);

        this.logger?.trace(`[${commandId}] frame ${frame.windowId} gave a success signal, responding to caller`);
    }

    private async changeFrameState(config: FrameStateConfig, commandId: string): Promise<void> {
        throw new Error("Frame states are not supported in Glue42 Core");
    }

    private async getFrameState(config: SimpleItemConfig, commandId: string): Promise<FrameStateResult> {
        throw new Error("Frame states are not supported in Glue42 Core");
    }

    private async getFrameBounds(config: SimpleItemConfig, commandId: string): Promise<FrameBoundsResult> {
        this.logger?.trace(`[${commandId}] handling getFrameBounds request with config ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ frameId: config.itemId });

        const frameWindowBounds = await this.glueController.callWindow<SimpleWindowCommand, FrameWindowBoundsResult>(this.ioc.windowsController.getFrameBoundsOperation, { windowId: frame.windowId }, frame.windowId);

        this.logger?.trace(`[${commandId}] getFrameBounds completed`);

        return { bounds: frameWindowBounds.bounds };
    }

    private async moveFrame(config: MoveFrameConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling moveFrame command with config: ${JSON.stringify(config)}`);

        const frame = await this.framesController.getFrameInstance({ frameId: config.itemId });

        const moveConfig: WindowMoveResizeConfig = {
            windowId: config.itemId,
            top: config.top,
            left: config.left,
            relative: config.relative
        };

        await this.glueController.callWindow<WindowMoveResizeConfig, void>(this.ioc.windowsController.moveResizeOperation, moveConfig, frame.windowId);

        this.logger?.trace(`[${commandId}] frame with id ${frame.windowId} was successfully moved, responding to caller`);
    }

    private applyDefaults(config: Glue42WebPlatform.Workspaces.Config): Glue42WebPlatform.Workspaces.Config {
        const providedHibernationConfig = config?.hibernation || {};
        const providedLoadingConfig = config?.loadingStrategy || {};

        const loadingConfig = deepMerge<Glue42WebPlatform.Workspaces.LoadingConfig>(defaultLoadingConfig, providedLoadingConfig as Glue42WebPlatform.Workspaces.LoadingConfig);

        return {
            ...config,
            loadingStrategy: loadingConfig,
            hibernation: providedHibernationConfig
        };
    }
}
