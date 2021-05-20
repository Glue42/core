import {
    isWindowInSwimlaneResultDecoder,
    frameSummaryDecoder,
    workspaceSnapshotResultDecoder,
    frameSummariesResultDecoder,
    workspaceCreateConfigDecoder,
    getFrameSummaryConfigDecoder,
    layoutSummariesDecoder,
    openWorkspaceConfigDecoder,
    workspaceSummariesResultDecoder,
    voidResultDecoder,
    exportedLayoutsResultDecoder,
    workspaceLayoutDecoder,
    deleteLayoutConfigDecoder,
    simpleItemConfigDecoder,
    resizeItemConfigDecoder,
    moveFrameConfigDecoder,
    frameSnapshotResultDecoder,
    simpleWindowOperationSuccessResultDecoder,
    setItemTitleConfigDecoder,
    moveWindowConfigDecoder,
    addWindowConfigDecoder,
    addContainerConfigDecoder,
    addItemResultDecoder,
    bundleConfigDecoder,
    workspaceStreamDataDecoder,
    frameStreamDataDecoder,
    containerStreamDataDecoder,
    windowStreamDataDecoder,
    workspaceLayoutSaveConfigDecoder,
    pingResultDecoder,
    frameStateConfigDecoder,
    frameStateResultDecoder,
    workspacesImportLayoutDecoder,
    workspaceSelectorDecoder,
    lockWorkspaceDecoder,
    lockWindowDecoder,
    lockContainerDecoder,
    frameBoundsResultDecoder
} from "../shared/decoders";
import { ControlOperation, StreamOperation } from "../types/protocol";
import { WorkspaceEventType } from "../types/subscription";

type OperationsTypes = "isWindowInWorkspace" |
    "createWorkspace" |
    "getAllFramesSummaries" |
    "getFrameSummary" |
    "getAllWorkspacesSummaries" |
    "getWorkspaceSnapshot" |
    "getAllLayoutsSummaries" |
    "openWorkspace" |
    "deleteLayout" |
    "saveLayout" |
    "importLayout" |
    "exportAllLayouts" |
    "restoreItem" |
    "maximizeItem" |
    "focusItem" |
    "closeItem" |
    "resizeItem" |
    "moveFrame" |
    "getFrameSnapshot" |
    "forceLoadWindow" |
    "ejectWindow" |
    "setItemTitle" |
    "moveWindowTo" |
    "addWindow" |
    "addContainer" |
    "bundleWorkspace" |
    "ping" |
    "changeFrameState" |
    "getFrameState" |
    "getFrameBounds" |
    "hibernateWorkspace" |
    "resumeWorkspace" |
    "lockWorkspace" |
    "lockWindow" |
    "lockContainer";
type MethodsTypes = "control" | "frameStream" | "workspaceStream" | "containerStream" | "windowStream";

export const webPlatformMethodName = "T42.Web.Platform.Control";
export const webPlatformWspStreamName = "T42.Web.Platform.WSP.Stream";

export const METHODS: { [key in MethodsTypes]: { name: string; isStream: boolean } } = {
    control: { name: "T42.Workspaces.Control", isStream: false },
    frameStream: { name: "T42.Workspaces.Stream.Frame", isStream: true },
    workspaceStream: { name: "T42.Workspaces.Stream.Workspace", isStream: true },
    containerStream: { name: "T42.Workspaces.Stream.Container", isStream: true },
    windowStream: { name: "T42.Workspaces.Stream.Window", isStream: true }
};

export const STREAMS: { [key in WorkspaceEventType]: StreamOperation } = {
    frame: { name: "T42.Workspaces.Stream.Frame", payloadDecoder: frameStreamDataDecoder },
    workspace: { name: "T42.Workspaces.Stream.Workspace", payloadDecoder: workspaceStreamDataDecoder },
    container: { name: "T42.Workspaces.Stream.Container", payloadDecoder: containerStreamDataDecoder },
    window: { name: "T42.Workspaces.Stream.Window", payloadDecoder: windowStreamDataDecoder }
};

export const OPERATIONS: { [key in OperationsTypes]: ControlOperation } = {
    ping: { name: "ping", resultDecoder: pingResultDecoder },
    isWindowInWorkspace: { name: "isWindowInWorkspace", argsDecoder: simpleItemConfigDecoder, resultDecoder: isWindowInSwimlaneResultDecoder },
    createWorkspace: { name: "createWorkspace", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: workspaceCreateConfigDecoder },
    getAllFramesSummaries: { name: "getAllFramesSummaries", resultDecoder: frameSummariesResultDecoder },
    getFrameSummary: { name: "getFrameSummary", resultDecoder: frameSummaryDecoder, argsDecoder: getFrameSummaryConfigDecoder },
    getAllWorkspacesSummaries: { name: "getAllWorkspacesSummaries", resultDecoder: workspaceSummariesResultDecoder },
    getWorkspaceSnapshot: { name: "getWorkspaceSnapshot", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: simpleItemConfigDecoder },
    getAllLayoutsSummaries: { name: "getAllLayoutsSummaries", resultDecoder: layoutSummariesDecoder },
    openWorkspace: { name: "openWorkspace", argsDecoder: openWorkspaceConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder },
    deleteLayout: { name: "deleteLayout", resultDecoder: voidResultDecoder, argsDecoder: deleteLayoutConfigDecoder },
    saveLayout: { name: "saveLayout", resultDecoder: workspaceLayoutDecoder, argsDecoder: workspaceLayoutSaveConfigDecoder },
    importLayout: { name: "importLayout", resultDecoder: voidResultDecoder, argsDecoder: workspacesImportLayoutDecoder },
    exportAllLayouts: { name: "exportAllLayouts", resultDecoder: exportedLayoutsResultDecoder },
    restoreItem: { name: "restoreItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    maximizeItem: { name: "maximizeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    focusItem: { name: "focusItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    closeItem: { name: "closeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    resizeItem: { name: "resizeItem", argsDecoder: resizeItemConfigDecoder, resultDecoder: voidResultDecoder },
    changeFrameState: { name: "changeFrameState", argsDecoder: frameStateConfigDecoder, resultDecoder: voidResultDecoder },
    getFrameState: { name: "getFrameState", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameStateResultDecoder },
    getFrameBounds: { name: "getFrameBounds", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameBoundsResultDecoder },
    moveFrame: { name: "moveFrame", argsDecoder: moveFrameConfigDecoder, resultDecoder: voidResultDecoder },
    getFrameSnapshot: { name: "getFrameSnapshot", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameSnapshotResultDecoder },
    forceLoadWindow: { name: "forceLoadWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
    ejectWindow: { name: "ejectWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
    setItemTitle: { name: "setItemTitle", argsDecoder: setItemTitleConfigDecoder, resultDecoder: voidResultDecoder },
    moveWindowTo: { name: "moveWindowTo", argsDecoder: moveWindowConfigDecoder, resultDecoder: voidResultDecoder },
    addWindow: { name: "addWindow", argsDecoder: addWindowConfigDecoder, resultDecoder: addItemResultDecoder },
    addContainer: { name: "addContainer", argsDecoder: addContainerConfigDecoder, resultDecoder: addItemResultDecoder },
    bundleWorkspace: { name: "bundleWorkspace", argsDecoder: bundleConfigDecoder, resultDecoder: voidResultDecoder },
    hibernateWorkspace: { name: "hibernateWorkspace", argsDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder },
    resumeWorkspace: { name: "resumeWorkspace", argsDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder },
    lockWorkspace: { name: "lockWorkspace", argsDecoder: lockWorkspaceDecoder, resultDecoder: voidResultDecoder },
    lockWindow: { name: "lockWindow", argsDecoder: lockWindowDecoder, resultDecoder: voidResultDecoder },
    lockContainer: { name: "lockContainer", argsDecoder: lockContainerDecoder, resultDecoder: voidResultDecoder }
};
