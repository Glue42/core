import { IoC } from "./shared/ioc";
import { composeAPI } from "./main";
import { WorkspacesFactoryFunction } from "../workspaces";

/* eslint-disable @typescript-eslint/no-explicit-any */
const factoryFunction: WorkspacesFactoryFunction = async (glue: any): Promise<void> => {

    const ioc = new IoC(glue.agm, glue.windows, glue.layouts, glue.contexts);

    const actualWindowId = glue.interop.instance.windowId;

    await ioc.initiate(actualWindowId);

    glue.workspaces = composeAPI(glue, ioc);
};

// attach to window object
if (typeof window !== "undefined") {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).GlueWorkspaces = factoryFunction;
}

export default factoryFunction;
