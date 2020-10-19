import { Glue42Web } from "../../web";
import { StartingContext } from "../types";
import { LocalWebWindow } from "./my";
import { LocalInstance } from "../app-manager/my";

const createMethodName = (id: string): string => `GC.Wnd.${id}`;

export const registerChildStartupContext = async (interop: Glue42Web.Interop.API, parent: string, id: string, name: string, options?: Glue42Web.Windows.CreateOptions): Promise<void> => {
    const methodName = createMethodName(id);
    const startingContext: StartingContext = {
        context: options?.context ?? {},
        name,
        parent
    };

    await interop.register(methodName, () => startingContext);
};

export const initStartupContext = async (my: LocalWebWindow, interop: Glue42Web.Interop.API, instance?: LocalInstance): Promise<void> => {
    // retrieve the startup context from the window that created us
    const methodName = createMethodName(my.id);
    if (interop.methods().find((m) => m.name === methodName)) {
        const result = await interop.invoke<StartingContext>(methodName);
        if (my) {
            const context = result.returned.context;

            my.setContext(context);
            my.name = result.returned.name;
            my.parent = result.returned.parent;
            if (instance) {
                instance.startedByScript = true;
                instance.context = context;
            }
        }
    }
};
