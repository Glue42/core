import React, {
    useContext,
    useEffect,
    useLayoutEffect,
    useState
} from "react";
import { SaveWorkspacePopupProps } from "../../../types/internal";
import Feedback from "../Feedback";
import SaveContextCheckbox from "./SaveContextCheckbox";
import SaveWorkspaceButton from "./SaveWorkspaceButton";
import withGlueInstance from "../../../withGlueInstance";

const SaveWorkspacePopup: React.FC<SaveWorkspacePopupProps> = ({ workspaceId, resizePopup, hidePopup, buildMode, glue, ...props }) => {
    const inputRef = React.createRef<HTMLInputElement>();
    const containerRef = React.createRef<HTMLDivElement>();

    const [shouldSaveContext, setShouldSaveContext] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [workspaceName, setWorkspaceName] = useState("");

    const refreshHeight = () => {
        if (!containerRef?.current) {
            return;
        }

        const bounds = containerRef.current.getBoundingClientRect();
        resizePopup({
            height: bounds.height,
            width: 300
        });
    }

    useEffect(() => {
        refreshHeight();
    }, [feedbackMessage, workspaceId]);

    useEffect(() => {
        let shouldUpdate = true;
        
        glue.workspaces.getAllWorkspaces().then((allWorkspaces: any[]) => {
            const myWorkspace = allWorkspaces.find((w) => w.id === workspaceId);
            if (shouldUpdate) {
                setWorkspaceName(myWorkspace.layoutName || "");
            }
        });

        return () => {
            shouldUpdate = false;
        }
    }, [workspaceId]);

    const clearInput = () => {
        setWorkspaceName("");
    }

    return (
        <div {...props} onClick={(e) => e.stopPropagation()} ref={containerRef} className="container-fluid save-workspace">
            <div className="row">
                <div className="col">
                    <h5 className="border-bottom border-secondary pb-1 my-3">Save Workspace</h5>
                </div>
            </div>
            <div className="row mb-2">
                <div className="col">
                    <input ref={inputRef}
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        onClick={(e) => setFeedbackMessage("")}
                        className="form-control mr-1"
                        type="text"
                        placeholder="Workspace name"
                        id="js-workspace-name" />
                </div>
            </div>
            <div className="row  align-items-center pb-2">
                <div className="col">
                    {!buildMode &&
                        <SaveContextCheckbox
                            changeChecked={(v) => setShouldSaveContext(v)}
                            refreshHeight={refreshHeight}
                        />}
                </div>

                <div className="col  text-right">
                    <SaveWorkspaceButton
                        clearInput={clearInput}
                        inputValue={workspaceName}
                        workspaceId={workspaceId}
                        shouldSaveContext={shouldSaveContext}
                        showFeedback={setFeedbackMessage}
                        hideFeedback={() => setFeedbackMessage("")}
                        hidePopup={hidePopup}
                        buildMode={buildMode}
                        glue={glue}
                    />
                </div>
            </div>
            {feedbackMessage && <Feedback errMessage={feedbackMessage} />}
        </div>
    )
};

export default withGlueInstance(SaveWorkspacePopup);