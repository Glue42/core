import React, { useEffect, useState } from "react";
import { WorkspaceLayoutsListProps } from "../../../types/internal";
import WorkspaceLayoutItem from "./WorkspaceLayoutItem";

const WorkspaceLayoutsList: React.FC<WorkspaceLayoutsListProps> = ({ glue, frameId, showFeedback, hidePopup, resizePopup }) => {
    const [layoutSummaries, setLayoutSummaries] = useState([] as any[]);

    const refreshSummaries = () => {
        return glue.workspaces.layouts.getSummaries().then((s: any) => { setLayoutSummaries(s); });
    };

    useEffect(() => {
        refreshSummaries();
    }, []);

    useEffect(() => {
        resizePopup();
    }, [layoutSummaries]);

    const getOnClickCallback = (layoutName: string) => {
        return () => {
            glue.workspaces.restoreWorkspace(layoutName, { frameId, title: layoutName }).catch((e: Error) => {
                showFeedback(e.message);
            }).finally(() => {
                hidePopup();
            });
        };
    };

    const getOnCloseClickCallback = (layoutName: string) => {
        return () => {
            glue.workspaces.layouts.delete(layoutName).catch((e: Error) => {
                showFeedback(e.message);
            }).then(() => {
                refreshSummaries();
            });
        };
    }

    return (
        <nav id="workspacesList" className="nav flex-column">
            {layoutSummaries.map((summary, i) => {
                return <WorkspaceLayoutItem
                    key={i}
                    name={summary.name}
                    onClick={() => getOnClickCallback(summary.name)()}
                    onCloseClick={(e) => { e.stopPropagation(); getOnCloseClickCallback(summary.name)(); }}
                />
            })}
        </nav>
    );
}

export default WorkspaceLayoutsList;