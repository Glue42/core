"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class StartupReader {
    get config() {
        return this._config;
    }
    loadConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const emptyFrameParam = urlParams.get(constants_1.EmptyFrameQueryParam);
        const disableCustomButtons = urlParams.get(constants_1.DisableCustomButtonsQueryParam);
        const workspaceNameParam = urlParams.get(constants_1.WorkspaceNameQueryParam);
        const workspaceNamesParam = urlParams.get(constants_1.WorkspaceNamesQueryParam);
        const contextParam = urlParams.get(constants_1.ContextQueryParam);
        let workspaceNamesArr = [];
        let context;
        try {
            workspaceNamesArr = JSON.parse(workspaceNamesParam) || workspaceNamesArr;
        }
        catch (error) {
            // do nothing
        }
        try {
            context = JSON.parse(contextParam);
        }
        catch (error) {
            // do nothing
        }
        if (workspaceNameParam) {
            workspaceNamesArr.push(workspaceNameParam);
        }
        const result = {
            emptyFrame: emptyFrameParam != null && emptyFrameParam !== undefined,
            disableCustomButtons: disableCustomButtons != null && disableCustomButtons !== undefined,
            workspaceNames: workspaceNamesArr,
            context
        };
        this._config = result;
        this.cleanUpUrl();
        return result;
    }
    cleanUpUrl() {
        const params = new URLSearchParams(window.location.search);
        Array.from(params.keys()).forEach(k => params.delete(k));
    }
}
exports.default = new StartupReader();
//# sourceMappingURL=startupReader.js.map