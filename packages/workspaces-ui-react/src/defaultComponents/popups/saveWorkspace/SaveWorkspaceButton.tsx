import React, { useEffect, useState } from "react";
import { SaveWorkspaceButtonProps } from "../../../types/internal";

const SaveWorkspaceButton: React.FC<SaveWorkspaceButtonProps> = ({ workspaceId,
    inputValue,
    clearInput,
    showFeedback,
    shouldSaveContext,
    hideFeedback,
    glue,
    hidePopup,
    buildMode }) => {
    const [shouldSave, setShouldSave] = useState(false);

    useEffect(() => {
        if (!shouldSave) {
            return;
        }
        let shouldUpdate = true;
        let workspace: any;
        const workspaceName = inputValue;
        glue.workspaces.getAllWorkspaces().then((allWorkspaces: any) => {
            workspace = allWorkspaces.find((w: any) => w.id === workspaceId);

            return glue.workspaces.layouts.save({
                name: workspaceName,
                workspaceId: workspace.id,
                saveContext: shouldSaveContext
            });
        }).then(() => {
            return workspace.setTitle(workspaceName);
        }).catch((error: Error) => {
            if (shouldUpdate) {
                showFeedback(error.message)
            }
        }).finally(() => {
            if (shouldUpdate) {
                clearInput();
                setShouldSave(false);
                hidePopup();
            }
        });

        return () => {
            shouldUpdate = false;
        }
    }, [shouldSave]);

    const exportJson = (layout: object, name: string) => {
        const downloadElement = document.createElement("a");
        const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout));

        document.body.append(downloadElement);
        downloadElement.setAttribute("href", "data:" + data);
        downloadElement.setAttribute("download", `${name}.txt`);
        downloadElement.click();
        downloadElement.remove();
    }

    const generateLayout = async (name: string, workspaceId: string) => {
        const instance = glue.agm.instance;
        const payload = { operation: "generateLayout", operationArguments: { name, workspaceId } };

        return (await glue.agm.invoke("T42.Workspaces.Control", payload, instance || "best")).returned;
    }

    const onClick = () => {
        const workspaceName = inputValue;

        if (workspaceId && !buildMode) {
            hideFeedback();
            if (!workspaceName) {
                showFeedback("Please provide a valid name");
                return;
            }

            if (shouldSave) {
                return;
            }

            setShouldSave(true);
        } else if (workspaceId) {
            generateLayout(workspaceName, workspaceId).then((layout) => {
                exportJson(layout, workspaceName);
            }).catch((err) => {
                showFeedback(err.message);
            });
        }
    }

    return (<button onClick={onClick} id="saveButton" type="button" className="btn btn-primary">
        {buildMode ? "Download" : "Save"}
    </button>);
};

export default SaveWorkspaceButton;