import { StartupConfig } from "../types/internal";
import { EmptyFrameQueryParam, DisableCustomButtonsQueryParam, WorkspaceNameQueryParam, WorkspaceNamesQueryParam, ContextQueryParam, BuildQueryParam } from "../constants";

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
        const buildParam = urlParams.get(BuildQueryParam);

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
            workspaceNamesArr.push(workspaceNameParam);
        }

        const result = {
            emptyFrame: emptyFrameParam != null && emptyFrameParam !== undefined,
            disableCustomButtons: disableCustomButtons != null && disableCustomButtons !== undefined,
            workspaceNames: workspaceNamesArr,
            context,
            build: buildParam !== null && buildParam !== undefined
        };

        this._config = result;
        this.cleanUpUrl();
        return result;
    }

    private cleanUpUrl() {
        const cleanedSearch = this.removeQueryParams(window.location.search, [EmptyFrameQueryParam]);
        window.history.replaceState(null, document.title, window.location.origin + window.location.pathname + cleanedSearch);
    }

    private removeQueryParams(search: string, params: string[]) {
        params.forEach((p) => {
            const queryParams = new URLSearchParams(search);
            const value = queryParams.get(p);
            const containsKey = Array.from(queryParams.keys()).indexOf(p) > -1;
            if (containsKey) {
                search = search.replace(`${p}=${value}`, "");
            }
        });

        if (search[search.length - 1] === "&") {
            search = search.substr(0, search.length - 1);
        }

        search = search.replace("&&", "&");
        search = search.replace("?&", "?");

        return search;
    }
}

export default new StartupReader();
