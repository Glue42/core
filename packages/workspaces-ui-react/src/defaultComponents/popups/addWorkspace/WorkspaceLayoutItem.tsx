import React from "react";
import { WorkspaceLayoutItemProps } from "../../../types/internal";

const WorkspaceLayoutItem: React.FC<WorkspaceLayoutItemProps> = ({ name, onClick, onCloseClick }) => {
    return (
        <a onClick={(e) => {
            e.preventDefault();
            if (typeof onClick === "function") {
                return onClick(e);
            }
        }} className="list-group-item list-group-item-action ry-2">
            <div className="align-items-center workspace d-flex flex-row">
                <div className="workspace__icon mr-2"></div>
                <div className="workspace__description">
                    <h5 className="mb-0 text-truncate">{name}</h5>
                </div>
                <div onClick={onCloseClick} className="close-icon ml-auto"></div>
            </div>
        </a>
    );
}


export default WorkspaceLayoutItem;