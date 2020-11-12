import { RefObject, useEffect, useState } from "react";
import workspacesManager from "./workspacesManager";

function useWorkspacePopup(element: RefObject<HTMLElement>) {
    const [elementId, setElementId] = useState<string | undefined>(undefined);
    const [shouldRemove, setShouldRemove] = useState(false);
    useEffect(() => {
        if (!element?.current) {
            return;
        }
        const id = workspacesManager.registerPopup(element.current);
        setElementId(id);
        return () => {
            workspacesManager.removePopupById(id);
        }
    }, []);

    useEffect(() => {
        if (!shouldRemove) {
            return;
        }
        if (!elementId) {
            setShouldRemove(false);
            return;
        }
        workspacesManager.removePopupById(elementId);
        setShouldRemove(false);


    }, [shouldRemove, elementId]);

    return [() => {
        if (!element?.current) {
            return;
        }
        const id = workspacesManager.notifyWorkspacePopupChanged(element.current);
        setElementId(id);
    }, () => setShouldRemove(true)]
}

export default useWorkspacePopup

