import { Glue42Core } from "@glue42/core";
import { SessionNonGlueData, SessionWindowData, WorkspaceWindowSession } from "../common/types";
import { BaseApplicationData, BridgeInstanceData, InstanceData } from "../libs/applications/types";
import { LayoutsSnapshot } from "../libs/layouts/types";
import { FrameSessionData } from "../libs/workspaces/types";
import logger from "../shared/logger";

export class SessionStorageController {
    private readonly sessionStorage: Storage;
    private readonly windowsNamespace = "g42_core_windows";
    private readonly instancesNamespace = "g42_core_instances";
    private readonly bridgeInstancesNamespace = "g42_core_bridge";
    private readonly nonGlueNamespace = "g42_core_nonglue";
    private readonly workspaceWindowsNamespace = "g42_core_workspace_clients";
    private readonly workspaceFramesNamespace = "g42_core_workspace_frames";
    private readonly workspaceHibernationNamespace = "g42_core_workspace_hibernation";
    private readonly layoutNamespace = "g42_core_layouts";
    private readonly appDefsNamespace = "g42_core_app_definitions";
    private readonly appDefsInmemoryNamespace = "g42_core_app_definitions_inmemory";

    constructor() {
        this.sessionStorage = window.sessionStorage;

        [
            this.bridgeInstancesNamespace,
            this.windowsNamespace,
            this.instancesNamespace,
            this.nonGlueNamespace,
            this.workspaceWindowsNamespace,
            this.workspaceFramesNamespace,
            this.layoutNamespace,
            this.appDefsNamespace,
            this.workspaceHibernationNamespace,
            this.appDefsInmemoryNamespace
        ].forEach((namespace) => {
            const data = this.sessionStorage.getItem(namespace);

            if (!data) {
                this.sessionStorage.setItem(namespace, JSON.stringify([]));
            }
        });
    }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("session.storage");
    }

    public getTimeout(workspaceId: string): number | undefined {
        const timers: Array<{ workspaceId: string; timeout: number }> = JSON.parse(this.sessionStorage.getItem(this.workspaceHibernationNamespace) as string);

        return timers.find((timer) => timer.workspaceId === workspaceId)?.timeout;
    }

    public removeTimeout(workspaceId: string): void {
        const timers: Array<{ workspaceId: string; timeout: number }> = JSON.parse(this.sessionStorage.getItem(this.workspaceHibernationNamespace) as string);

        const timer = timers.find((timer) => timer.workspaceId === workspaceId);

        if (timer) {
            this.sessionStorage.setItem(this.workspaceHibernationNamespace, JSON.stringify(timers.filter((timer) => timer.workspaceId !== workspaceId)));
        }

    }

    public saveTimeout(workspaceId: string, timeout: number): void {
        const allData: Array<{ workspaceId: string; timeout: number }> = JSON.parse(this.sessionStorage.getItem(this.workspaceHibernationNamespace) as string);

        if (allData.some((data) => data.workspaceId === workspaceId)) {
            return;
        }

        allData.push({ workspaceId, timeout });

        this.sessionStorage.setItem(this.workspaceHibernationNamespace, JSON.stringify(allData));
    }

    public exportClearTimeouts(): Array<{ workspaceId: string; timeout: number }> {
        const timers: Array<{ workspaceId: string; timeout: number }> = JSON.parse(this.sessionStorage.getItem(this.workspaceHibernationNamespace) as string);

        this.sessionStorage.setItem(this.workspaceHibernationNamespace, JSON.stringify([]));

        return timers;
    }

    public getAllApps(type: "remote" | "inmemory"): BaseApplicationData[] {
        const namespace = type === "remote" ? this.appDefsNamespace : this.appDefsInmemoryNamespace;

        const appsString = JSON.parse(this.sessionStorage.getItem(namespace) as string);

        return appsString;
    }

    public overwriteApps(apps: BaseApplicationData[], type: "remote" | "inmemory"): void {
        const namespace = type === "remote" ? this.appDefsNamespace : this.appDefsInmemoryNamespace;

        this.sessionStorage.setItem(namespace, JSON.stringify(apps));
    }

    public removeApp(name: string, type: "remote" | "inmemory"): BaseApplicationData | undefined {
        const namespace = type === "remote" ? this.appDefsNamespace : this.appDefsInmemoryNamespace;

        const all = this.getAllApps(type);

        const app = all.find((app) => app.name === name);

        if (app) {
            this.sessionStorage.setItem(namespace, JSON.stringify(all.filter((a) => a.name !== name)));
        }

        return app;
    }

    public getLayoutSnapshot(): LayoutsSnapshot {
        const snapsString = JSON.parse(this.sessionStorage.getItem(this.layoutNamespace) as string);

        return { layouts: snapsString };
    }

    public saveLayoutSnapshot(snapshot: LayoutsSnapshot): void {
        this.sessionStorage.setItem(this.layoutNamespace, JSON.stringify(snapshot.layouts));
    }

    public saveFrameData(frameData: FrameSessionData): void {
        const allData: FrameSessionData[] = JSON.parse(this.sessionStorage.getItem(this.workspaceFramesNamespace) as string);

        if (allData.some((data) => data.windowId === frameData.windowId)) {
            return;
        }

        allData.push(frameData);

        this.sessionStorage.setItem(this.workspaceFramesNamespace, JSON.stringify(allData));
    }

    public getPlatformFrame(): FrameSessionData | undefined {
        return this.getAllFrames().find((frame) => frame.isPlatform);
    }

    public getAllFrames(): FrameSessionData[] {
        const allData: FrameSessionData[] = JSON.parse(this.sessionStorage.getItem(this.workspaceFramesNamespace) as string);
        return allData;
    }

    public getFrameData(windowId: string): FrameSessionData | undefined {
        const allData: FrameSessionData[] = JSON.parse(this.sessionStorage.getItem(this.workspaceFramesNamespace) as string);

        return allData.find((data) => data.windowId === windowId);
    }

    public setFrameActive(windowId: string): void {
        const allData: FrameSessionData[] = JSON.parse(this.sessionStorage.getItem(this.workspaceFramesNamespace) as string);

        const frameData = allData.find((data) => data.windowId === windowId);

        if (!frameData || frameData.active) {
            return;
        }

        frameData.active = true;

        this.sessionStorage.setItem(this.workspaceFramesNamespace, JSON.stringify(allData));
    }

    public removeFrameData(windowId: string): boolean {

        if (!windowId) {
            return false;
        }

        return this.doRemove<FrameSessionData>(windowId, this.workspaceFramesNamespace);
    }

    public saveWorkspaceClient(windowData: WorkspaceWindowSession): void {
        const allData: WorkspaceWindowSession[] = JSON.parse(this.sessionStorage.getItem(this.workspaceWindowsNamespace) as string);

        if (allData.some((data) => data.windowId === windowData.windowId)) {
            return;
        }

        allData.push(windowData);

        this.sessionStorage.setItem(this.workspaceWindowsNamespace, JSON.stringify(allData));
    }

    public getWorkspaceClientById(windowId: string): WorkspaceWindowSession | undefined {
        const allData: WorkspaceWindowSession[] = JSON.parse(this.sessionStorage.getItem(this.workspaceWindowsNamespace) as string);

        return allData.find((data) => data.windowId === windowId);
    }

    public pickWorkspaceClients(predicate: (client: WorkspaceWindowSession) => boolean): WorkspaceWindowSession[] {
        const allData: WorkspaceWindowSession[] = JSON.parse(this.sessionStorage.getItem(this.workspaceWindowsNamespace) as string);

        return allData.filter(predicate);
    }

    public removeWorkspaceClient(windowId: string): boolean {
        if (!windowId) {
            return false;
        }

        return this.doRemove<WorkspaceWindowSession>(windowId, this.workspaceWindowsNamespace);
    }

    public getAllNonGlue(): SessionNonGlueData[] {
        return JSON.parse(this.sessionStorage.getItem(this.nonGlueNamespace) as string);
    }

    public saveNonGlue(data: SessionNonGlueData): boolean {
        const allData: SessionNonGlueData[] = JSON.parse(this.sessionStorage.getItem(this.nonGlueNamespace) as string);

        if (allData.some((entry) => entry.windowId === data.windowId)) {
            this.logger?.trace(`did not save this data: ${JSON.stringify(data)}, because an entry with this id already exists`);
            return false;
        }

        this.logger?.trace(`saving non glue window with id: ${data.windowId}`);

        allData.push(data);

        this.sessionStorage.setItem(this.nonGlueNamespace, JSON.stringify(allData));

        return true;
    }

    public removeNonGlue(data: SessionNonGlueData): boolean {
        if (!data || !data.windowId) {
            return false;
        }

        this.logger?.trace(`removing non glue window with id: ${data.windowId}`);

        return this.doRemove<SessionNonGlueData>(data.windowId, this.nonGlueNamespace);
    }

    public saveBridgeInstanceData(data: BridgeInstanceData): void {
        const allData: BridgeInstanceData[] = JSON.parse(this.sessionStorage.getItem(this.bridgeInstancesNamespace) as string);

        if (allData.some((entry) => entry.windowId === data.windowId)) {
            this.logger?.trace(`did not save this data: ${JSON.stringify(data)}, because an entry with this id already exists`);
            return;
        }

        this.logger?.trace(`saving new instance with id: ${data.windowId} and app name: ${data.appName}`);

        allData.push(data);

        this.sessionStorage.setItem(this.bridgeInstancesNamespace, JSON.stringify(allData));
    }

    public getBridgeInstanceData(windowId: string): BridgeInstanceData | undefined {
        const all: BridgeInstanceData[] = JSON.parse(this.sessionStorage.getItem(this.bridgeInstancesNamespace) as string);

        return all.find((e) => e.windowId === windowId);
    }

    public removeBridgeInstanceData(windowId: string): void {
        const all: BridgeInstanceData[] = JSON.parse(this.sessionStorage.getItem(this.bridgeInstancesNamespace) as string);

        this.sessionStorage.setItem(this.bridgeInstancesNamespace, JSON.stringify(all.filter((e) => e.windowId !== windowId)));
    }

    public saveInstanceData(data: InstanceData): void {
        const allData: InstanceData[] = JSON.parse(this.sessionStorage.getItem(this.instancesNamespace) as string);

        if (allData.some((entry) => entry.id === data.id)) {
            this.logger?.trace(`did not save this data: ${JSON.stringify(data)}, because an entry with this id already exists`);
            return;
        }

        this.logger?.trace(`saving new instance with id: ${data.id} and app name: ${data.applicationName}`);

        allData.push(data);

        this.sessionStorage.setItem(this.instancesNamespace, JSON.stringify(allData));
    }

    public removeInstance(id: string): void {
        this.logger?.trace(`removing instance with id: ${id}`);

        const all = this.getAllInstancesData();

        this.sessionStorage.setItem(this.instancesNamespace, JSON.stringify(all.filter((e) => e.id !== id)));
        this.removeBridgeInstanceData(id);
    }

    public getInstanceData(id: string): InstanceData | undefined {
        const all = this.getAllInstancesData();

        return all.find((e) => e.id === id);
    }

    public getAllInstancesData(): InstanceData[] {
        return JSON.parse(this.sessionStorage.getItem(this.instancesNamespace) as string);
    }

    public saveWindowData(data: SessionWindowData): void {
        const allData: SessionWindowData[] = JSON.parse(this.sessionStorage.getItem(this.windowsNamespace) as string);

        if (allData.some((entry) => entry.name === data.name)) {
            this.logger?.trace(`did not save this data: ${JSON.stringify(data)}, because an entry with this name already exists`);
            return;
        }

        this.logger?.trace(`saving window with id: ${data.windowId} and name: ${window.name}`);

        allData.push(data);

        this.sessionStorage.setItem(this.windowsNamespace, JSON.stringify(allData));
    }

    public getAllWindowsData(): SessionWindowData[] {
        return JSON.parse(this.sessionStorage.getItem(this.windowsNamespace) as string);
    }

    public getWindowDataById(windowId: string): SessionWindowData | undefined {
        const all = this.getAllWindowsData();

        return all.find((entry) => entry.windowId === windowId);
    }

    public getWindowDataByName(name: string): SessionWindowData | undefined {
        const all = this.getAllWindowsData();

        return all.find((entry) => entry.name === name);
    }

    public removeWindowData(windowId: string): boolean {
        if (!windowId) {
            return false;
        }

        this.logger?.trace(`removing window with id: ${windowId}`);

        return this.doRemove<SessionWindowData>(windowId, this.windowsNamespace);
    }

    public fullWindowClean(windowId: string): boolean {
        const windowRemoved = this.removeWindowData(windowId);
        const nonGlueRemoved = this.removeNonGlue({ windowId });
        const workspaceClientRemoved = this.removeWorkspaceClient(windowId);

        return windowRemoved || nonGlueRemoved || workspaceClientRemoved;
    }

    private doRemove<T extends { windowId: string }>(id: string, namespace: string): boolean {
        const data: T[] = JSON.parse(this.sessionStorage.getItem(namespace) as string);

        const result = data.reduce<{ removed: boolean; newData: T[] }>((soFar, entry) => {

            if (entry.windowId === id) {
                soFar.removed = true;
            } else {
                soFar.newData.push(entry);
            }

            return soFar;
        }, { removed: false, newData: [] });

        this.sessionStorage.setItem(namespace, JSON.stringify(result.newData));

        return result.removed;
    }
}