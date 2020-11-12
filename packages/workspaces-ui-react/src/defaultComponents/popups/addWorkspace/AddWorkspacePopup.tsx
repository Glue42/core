import React, { useEffect, useState } from "react";
import { AddWorkspacePopupProps } from "../../../types/internal";
import Feedback from "../Feedback";
import WorkspaceLayoutsList from "./WorkspaceLayoutsList";
import withGlueInstance from "../../../withGlueInstance";

const AddWorkspacePopup: React.FC<AddWorkspacePopupProps> = ({ frameId, hidePopup, resizePopup, glue, ...props }) => {
    const [feedbackText, setFeedbackText] = useState<string | undefined>(undefined);
    const containerRef = React.createRef<HTMLDivElement>();

    const resizePopupWithContainerHeight = () => {
        const containerHeight = containerRef.current?.getBoundingClientRect().height;
        resizePopup({
            width: 300,
            height: containerHeight
        });
    }

    useEffect(() => {
        resizePopupWithContainerHeight();
    }, [feedbackText]);
    const onCreateNewClicked = () => {
        glue.workspaces.createWorkspace({
            children: [],
            frame: {
                reuseFrameId: frameId
            }
        });
        hidePopup();
    }

    return (
        <div {...props} ref={containerRef} className="container-fluid add-workspace">
            <div className="row">
                <div className="col">
                    <h5 className="border-bottom border-secondary pb-1 my-3">Add Workspace</h5>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h5 onClick={onCreateNewClicked} itemType="h5" id="createNewButton" className="btn btn-primary mb-3 w-100">Create New</h5>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Load Workspace</h3>
                    <div className="workspaces mb-2">
                        <WorkspaceLayoutsList
                            frameId={frameId}
                            glue={glue}
                            showFeedback={setFeedbackText}
                            hidePopup={hidePopup}
                            resizePopup={resizePopupWithContainerHeight}
                        />
                    </div>
                </div>
            </div>

            {feedbackText && <Feedback errMessage={feedbackText} />}
        </div>
    );
};

export default withGlueInstance(AddWorkspacePopup);