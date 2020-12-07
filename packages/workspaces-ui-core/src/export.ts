
import manager from "./manager";
import facade from "./interop/facade";
import jquery from "jquery";
import { Glue42Web } from "@glue42/web";
import startupReader from "./config/startupReader";
import { ComponentFactory } from "./types/internal";
import { WorkspacesManager } from "../workspaces";

declare const window: Window & { glue: Glue42Web.API; $: JQueryStatic };

window.$ = jquery;
let done: () => void;

window.addEventListener("beforeunload", () => {
    facade.dispose();
    if (done) {
        done();
    }
});

const init = (glue: Glue42Web.API, componentFactory?: ComponentFactory) => {
    const isInitialized = manager.initialized;
    if (isInitialized) {
        manager.init(glue, glue.agm.instance.windowId, componentFactory);
        return;
    }
    facade.subscribeForWorkspaceEvents();

    const result = manager.init(glue, glue.agm.instance.windowId, componentFactory);

    done = result.cleanUp;
    facade.init(glue, glue.agm.instance.windowId).then(() => {
        if (!startupReader.config.emptyFrame) {
            manager.workspacesEventEmitter.raiseFrameEvent({ action: "opened", payload: { frameSummary: { id: glue.agm.instance.windowId } } });
        }
    }).catch(console.warn);

    return manager;
};


const workspacesManagerAPI: WorkspacesManager = {
    init,
    getFrameId: () => {
        return manager.frameId;
    },
    notifyMoveAreaChanged: () => {
        return;
    },
    getComponentBounds: () => {
        return manager.getComponentBounds();
    },
    registerPopup: (element: HTMLElement) => {
        return "";
    },
    removePopup: (element: HTMLElement) => {
        return;
    },
    removePopupById: (element: string) => {
        return;
    },
    unmount: () => {
        return;
    },
    subscribeForWindowFocused: (callback: () => void) => {
        return manager.subscribeForWindowClicked(callback);
    },
    notifyWorkspacePopupChanged: (element: HTMLElement) => {
        return;
    }
}

export default workspacesManagerAPI;
