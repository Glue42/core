import { WindowStreamData, WorkspaceConfigResult, WorkspaceEventPayload, WorkspaceSnapshotResult, WorkspaceStreamData } from "./types";
import { WorkspacesController } from "./controller";
import { generate } from "shortid";
import { Glue42WebPlatform } from "../../../platform";
import logger from "../../shared/logger";
import { Glue42Web } from "@glue42/web";
import { SessionStorageController } from "../../controllers/session";

export class WorkspaceHibernationWatcher {
    private workspacesController!: WorkspacesController;
    private settings: Glue42WebPlatform.Workspaces.HibernationConfig | undefined;
    private maximumAmountCheckInProgress = false;

    constructor(private readonly session: SessionStorageController) { }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("workspaces.hibernation");
    }

    public start(workspacesController: WorkspacesController, settings: Glue42WebPlatform.Workspaces.HibernationConfig): void {

        this.logger?.trace(`starting the hibernation watcher with following settings: ${JSON.stringify(this.settings)}`);

        this.workspacesController = workspacesController;
        this.settings = settings;

        const allTimeoutData = this.session.exportClearTimeouts();

        if (this.settings?.idleWorkspaces?.idleMSThreshold) {
            allTimeoutData.forEach((timeoutData) => this.buildTimer(timeoutData.workspaceId));
        }

        this.logger?.trace("The hibernation watcher has started successfully");
    }

    public notifyEvent(event: WorkspaceEventPayload): void {

        if (event.type === "window") {
            this.handleWorkspaceWindowEvent(event);
        }

        if (event.type === "workspace") {
            this.handleWorkspaceEvent(event);
        }
    }

    private handleWorkspaceWindowEvent(event: WorkspaceEventPayload): void {
        // listens for new windows, in case an empty workspace is no longer empty, therefore adding it to the standard hibernation logic
        const isWindowOpened = event.action === "opened" || event.action === "added";

        if (!isWindowOpened) {
            return;
        }

        this.checkMaximumAmount();
        this.addTimersForWorkspacesInFrame((event.payload as WindowStreamData).windowSummary.config.frameId);
    }

    private handleWorkspaceEvent(event: WorkspaceEventPayload): void {
        const isWorkspaceSelected = event.action === "selected";
        const workspaceData = event.payload as WorkspaceStreamData;

        if (event.action !== "selected" && event.action !== "opened") {
            return;
        }

        this.checkMaximumAmount();

        if (isWorkspaceSelected) {
            const timeout = this.session.getTimeout(workspaceData.workspaceSummary.id);

            if (timeout) {
                clearTimeout(timeout);
                this.session.removeTimeout(workspaceData.workspaceSummary.id);
            }

            this.addTimersForWorkspacesInFrame(workspaceData.frameSummary.id);
        }
    }

    private compare(ws1: WorkspaceSnapshotResult, ws2: WorkspaceSnapshotResult): number {
        if (ws1.config.lastActive > ws2.config.lastActive) {
            return 1;
        }
        if (ws1.config.lastActive < ws2.config.lastActive) {
            return -1;
        }
        return 0;
    }

    private async checkMaximumAmount(): Promise<void> {
        if (this.maximumAmountCheckInProgress) {
            return;
        }
        if (!this.settings?.maximumActiveWorkspaces?.threshold) {
            return;
        }
        this.maximumAmountCheckInProgress = true;

        try {
            await this.checkMaximumAmountCore(this.settings.maximumActiveWorkspaces.threshold);
        } finally {
            this.maximumAmountCheckInProgress = false;
        }
    }

    private async checkMaximumAmountCore(threshold: number): Promise<void> {
        this.logger?.trace(`Checking for maximum active workspaces rule. The threshold is ${this.settings?.maximumActiveWorkspaces?.threshold}`);

        const commandId = generate();
        const result = await this.workspacesController.getAllWorkspacesSummaries({}, commandId);
        const snapshotsPromises = result.summaries.map(s => this.workspacesController.getWorkspaceSnapshot({ itemId: s.id }, commandId));
        const snapshots = await Promise.all(snapshotsPromises);

        const eligibleForHibernation = snapshots.reduce<WorkspaceSnapshotResult[]>((eligible, snapshot) => {

            if (!this.isWorkspaceHibernated(snapshot.config) && !this.isWorkspaceEmpty(snapshot)) {
                eligible.push(snapshot);
            }

            return eligible;

        }, [] as WorkspaceSnapshotResult[]);

        if (eligibleForHibernation.length <= threshold) {
            return;
        }

        this.logger?.trace(`Found ${eligibleForHibernation.length} eligible for hibernation workspaces`);

        const hibernationPromises = eligibleForHibernation
            .sort(this.compare)
            .slice(0, eligibleForHibernation.length - threshold)
            .map((w) => this.tryHibernateWorkspace(w.id));

        await Promise.all(hibernationPromises);
    }

    private async tryHibernateWorkspace(workspaceId: string): Promise<void> {
        try {
            const snapshot = await this.workspacesController.getWorkspaceSnapshot({ itemId: workspaceId }, generate());

            if (!this.canBeHibernated(snapshot)) {
                return;
            }

            this.logger?.trace(`trying to hibernate workspace ${workspaceId}`);

            await this.workspacesController.hibernateWorkspace({ workspaceId }, generate());

            this.logger?.trace(`workspace ${workspaceId} was hibernated successfully`);
        } catch (error) {
            this.logger?.trace(error);
        }
    }

    private canBeHibernated(snapshot: WorkspaceSnapshotResult): boolean {
        const isWorkspaceHibernated = this.isWorkspaceHibernated(snapshot.config);
        const isWorkspaceSelected = this.isWorkspaceSelected(snapshot.config);
        const isWorkspaceEmpty = this.isWorkspaceEmpty(snapshot);

        return !isWorkspaceHibernated && !isWorkspaceSelected && !isWorkspaceEmpty;
    }

    private isWorkspaceHibernated(workspaceSnapshot: WorkspaceConfigResult): boolean {
        return workspaceSnapshot.isHibernated;
    }

    private isWorkspaceSelected(workspaceSnapshot: WorkspaceConfigResult): boolean {
        return workspaceSnapshot.isSelected;
    }

    private isWorkspaceEmpty(workspaceSnapshot: WorkspaceSnapshotResult): boolean {
        return !workspaceSnapshot.children.length;
    }

    private async getWorkspacesInFrame(frameId: string): Promise<WorkspaceSnapshotResult[]> {
        const result = await this.workspacesController.getAllWorkspacesSummaries({}, generate());

        const snapshotPromises = result.summaries.reduce((promises, summary) => {
            if (summary.config.frameId === frameId) {
                promises.push(this.workspacesController.getWorkspaceSnapshot({ itemId: summary.id }, generate()));
            }

            return promises;
        }, [] as Array<Promise<WorkspaceSnapshotResult>>);

        return await Promise.all(snapshotPromises);
    }

    private async addTimersForWorkspacesInFrame(frameId: string): Promise<void> {
        if (!this.settings?.idleWorkspaces?.idleMSThreshold) {
            return;
        }

        const workspacesInFrame = await this.getWorkspacesInFrame(frameId);

        workspacesInFrame.map((w) => {

            if (!this.canBeHibernated(w) || this.session.getTimeout(w.id)) {
                return;
            }

            this.buildTimer(w.id);

            this.logger?.trace(`Starting workspace idle timer ( ${this.settings?.idleWorkspaces?.idleMSThreshold}ms ) for workspace ${w.id}`);
        });
    }

    private buildTimer(workspaceId: string): void {
        const timeout = setTimeout(() => {
            this.logger?.trace(`Timer triggered will try to hibernated ${workspaceId}`);
            this.tryHibernateWorkspace(workspaceId);
            this.session.removeTimeout(workspaceId);
        }, this.settings?.idleWorkspaces?.idleMSThreshold);

        this.session.saveTimeout(workspaceId, timeout);
    }
}
