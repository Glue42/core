import { StartupConfig } from "../types/internal";
import { EmptyFrameQueryParam, DisableCustomButtonsQueryParam, WorkspaceNameQueryParam, WorkspaceNamesQueryParam, ContextQueryParam } from "../constants";

class StartupReader {
    private _config: StartupConfig;

    public get config() {
        return this._config;
    }

    public loadConfig() {
        const urlParams = new URLSearchParams(window.location.search);

        const emptyFrameParam = urlParams.get(EmptyFrameQueryParam);
        const disableCustomButtons = urlParams.get(DisableCustomButtonsQueryParam);
        const workspaceNameParam = urlParams.get(WorkspaceNameQueryParam);
        const workspaceNamesParam = urlParams.get(WorkspaceNamesQueryParam);
        const contextParam = urlParams.get(ContextQueryParam);

        let workspaceNamesArr: string[] = [];
        let context: object;

        try {
            workspaceNamesArr = JSON.parse(workspaceNamesParam) || workspaceNamesArr;
        } catch (error) {
            // do nothing
        }

        try {
            context = JSON.parse(contextParam);
        } catch (error) {
            // do nothing
        }

        if (workspaceNameParam) {
            workspaceNamesArr.push(workspaceNameParam)
        }

        const result = {
            emptyFrame: emptyFrameParam != null && emptyFrameParam !== undefined,
            disableCustomButtons: disableCustomButtons != null && disableCustomButtons !== undefined,
            workspaceNames: workspaceNamesArr,
            context
        }

        this._config = result;
        this.cleanUpUrl();
        return result;
    }

    private cleanUpUrl() {
        const params = new URLSearchParams(window.location.search);
        Array.from(params.keys()).forEach(k => params.delete(k));
    }
}

export default new StartupReader();