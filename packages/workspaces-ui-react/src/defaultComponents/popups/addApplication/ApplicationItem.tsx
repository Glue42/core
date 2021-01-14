import React from "react";
import { ApplicationItemProps } from "../../../types/internal";

const ApplicationItem: React.FC<ApplicationItemProps> = ({ appName, onClick }) => {
    return (
        <a onClick={(e) => {
            e.preventDefault();
            if (typeof onClick === "function") {
                return onClick(e);
            }
        }} className="list-group-item list-group-item-action px-3">
            {appName}
        </a>
    )
};

export default ApplicationItem;