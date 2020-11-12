import { useEffect, useState } from "react";
import { WorkspacesManager } from "./types/internal";
import workspacesManager from "./workspacesManager";

declare const window: Window & { workspacesManager: WorkspacesManager };

function useWorkspaceWindowClicked(cb: () => void) {
    const [unsub, setUnsub] = useState<(() => void) | undefined>(undefined);
    useEffect(() => {
        const unsubFunction = workspacesManager.subscribeForWindowFocused(cb);
        setUnsub(() => () => unsubFunction());
        return () => {
            unsubFunction();
        }
    }, []);

    return () => {
        if (unsub) {
            unsub();
        }
    };
}

export default useWorkspaceWindowClicked;