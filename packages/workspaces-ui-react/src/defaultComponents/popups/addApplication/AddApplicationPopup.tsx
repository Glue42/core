import React, { useEffect, useState } from "react";
import { AddApplicationPopupProps } from "../../../types/internal";
import ApplicationsList from "./ApplicationsList";
import ContainerSwitch from "./ContainerSwitch";
import withGlueInstance from "../../../withGlueInstance";

declare const window: Window & { glue?: any };

const AddApplicationPopup: React.FC<AddApplicationPopupProps> = ({ workspaceId, boxId, hidePopup, resizePopup, glue, frameId, ...props }) => {
    const [inLane, setInLane] = useState(false);
    const [parent, setParent] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = React.createRef<HTMLDivElement>();

    useEffect(() => {
        glue.workspaces.getAllWorkspaces().then((allWorkspaces: any) => {
            const myWorkspace = allWorkspaces.find((w: any) => w.id === workspaceId);
            const parent = myWorkspace.getBox((p: any) => p.id === boxId) || myWorkspace;

            setParent(parent);
        });
    }, [boxId, workspaceId]);

    const refreshPopupHeight = () => {
        const containerHeight = containerRef.current?.getBoundingClientRect().height;
        resizePopup({
            width: 300,
            height: containerHeight
        });
    }

    useEffect(() => {
        refreshPopupHeight();
    }, [searchTerm, parent]);

    return (
        <div {...props} ref={containerRef} className="container-fluid add-application">
            <div className="row">
                <div className="col">
                    <h5 className="border-bottom border-secondary pb-1 my-3">Add Application</h5>
                </div>
            </div>
            <div id="applicationPlacementSection" className="row">
                <div className="col">
                    {parent && <ContainerSwitch
                        inLane={inLane}
                        setInLane={setInLane}
                        parent={parent} />}
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <div className="input-group position-relative mb-2">
                        <input type="text" id="appSearch" className="form-control pr-4" placeholder="Search аpplication"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search аpplication" aria-describedby="" />
                        <div className="icon-search">
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <div className="applications mb-2">
                        <ApplicationsList
                            glue={glue}
                            hidePopup={hidePopup}
                            inLane={inLane}
                            parent={parent}
                            searchTerm={searchTerm}
                            updatePopupHeight={() => { refreshPopupHeight() }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withGlueInstance(AddApplicationPopup);