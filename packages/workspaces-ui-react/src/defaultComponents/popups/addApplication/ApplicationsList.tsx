import React, { useEffect } from "react";
import { ApplicationListProps } from "../../../types/internal";
import ApplicationItem from "./ApplicationItem";

const ApplicationsList: React.FC<ApplicationListProps> = ({ glue, inLane, parent, hidePopup, searchTerm, updatePopupHeight, filterApps }) => {
    const hasFlag = (app: any) => app?.userProperties?.includeInWorkspaces ?? app?.userProperties?.includeInCanvas;
    const isFromSupportedType = (a: any) => !a.type || (a.type !== "activity" &&
        a.type !== "canvas" &&
        a.type !== "workspaces" &&
        a.type !== "node");

    const defaultFilter = (a: any) => !a.isActivity &&
        !a.isShell &&
        isFromSupportedType(a) && hasFlag(a);

    const filter = filterApps || defaultFilter;

    const workspacesFriendlyApps: any[] = glue.appManager.applications().filter(filter);

    const getElementOnClick = (appName: string) => {
        return async () => {
            let workspaceWindow: any;
            let unsub: any;

            const callback = (w: any) => {
                if (!workspaceWindow) {
                    unsub();
                } else if (workspaceWindow.id === w.id) {
                    w.focus();
                    unsub();
                }
            }
            if (!parent.type) {
                unsub = await parent.onWindowLoaded(callback);
            } else {
                unsub = await parent.workspace.onWindowLoaded(callback);
            }

            try {
                if (parent.type === "group" && inLane) {
                    const newGroup = await parent.parent.addGroup({ type: "group", children: [{ type: "window", appName }] });
                    workspaceWindow = newGroup.children[0];
                } else if (parent.type !== "group" && !inLane) {
                    const newGroup = await parent.addGroup({ type: "group", children: [{ type: "window", appName }] });
                    workspaceWindow = newGroup.children[0];
                } else {
                    workspaceWindow = await parent.addWindow({ type: "window", appName });
                }  
            } catch (error) {
                console.warn(error);
            }

            hidePopup();
        };
    }

    useEffect(() => {
        updatePopupHeight();
    }, []);

    return (
        <nav id="applicationsList" className="nav list-group">
            {workspacesFriendlyApps
                .filter((a) => (a.title || a.name).toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
                .map((app: any, i) => {
                    return <ApplicationItem
                        key={i}
                        onClick={() => { getElementOnClick(app.name)() }}
                        appName={app.title || app.name} />
                })}
        </nav>
    )
}

export default ApplicationsList;