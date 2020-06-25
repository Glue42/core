import { Glue42Web } from "../../web";
import { StartingContext } from "../types";
import { LocalWebWindow } from "./my";
import { LocalInstance } from "../app-manager/my";

export const registerChildStartupContext = (interop: Glue42Web.Interop.API, parent: string, id: string, name: string, options?: Glue42Web.Windows.CreateOptions) => {
    const methodName = createMethodName(id);
    const startingContext: StartingContext = {
        context: options?.context ?? {},
        name,
        parent
    };
    interop.register(methodName, () => startingContext);
};

export const initStartupContext = async (my: LocalWebWindow, interop: Glue42Web.Interop.API, instance: LocalInstance): Promise<void> => {
    // retrieve the startup context from the window that created us
    const methodName = createMethodName(my.id);
    if (interop.methods().find((m) => m.name === methodName)) {
        const result = await interop.invoke<StartingContext>(methodName);
        if (my) {
            my.setContext(result.returned.context);
            my.name = result.returned.name;
            my.parent = result.returned.parent;
            instance.startedByScript = true;
            instance.context = result.returned.context;
        }
    }
};

const createMethodName = (id: string) => `"GC.Wnd."${id}`;
