import React, { useEffect } from "react";
import { ContainerSwitchProps } from "../../../types/internal";

const ContainerSwitch: React.FC<ContainerSwitchProps> = ({ inLane, setInLane, parent }) => {
    let wordInLabel = "";
    if (!parent.type) {
        wordInLabel = `workspace`;
    } else if (parent.type === "group" && !parent.children.length) {
        wordInLabel = "";
    } else if (parent.type === "group") {
        wordInLabel = `${parent.parent.type || ""}`;
    }

    useEffect(() => {
        if (!wordInLabel || wordInLabel === "workspace") {
            setInLane(false);
        }
    }, [wordInLabel])

    if (!wordInLabel || wordInLabel === "workspace") {
        return null;
    }

    const labelToPut = `This ${wordInLabel[0].toUpperCase() + wordInLabel.substring(1)}`;

    return (
        <div className="form-group">
            <label htmlFor="Application placement">Application Placement</label>
            <div className="btn-group d-flex mb-2" role="group" aria-label="Application placement">
                <button
                    onClick={() => setInLane(true)}
                    type="button"
                    id="laneButton"
                    className={`btn btn-outline-primary w-100 ${inLane ? "active" : ""}`}>
                    {labelToPut}
                </button>
                <button
                    onClick={() => setInLane(false)}
                    type="button"
                    id="tabGroupButton"
                    className={`btn btn-outline-primary w-100 ${!inLane ? "active" : ""}`}>
                    This Tab Group
            </button>
            </div>
        </div>
    );
};

export default ContainerSwitch;