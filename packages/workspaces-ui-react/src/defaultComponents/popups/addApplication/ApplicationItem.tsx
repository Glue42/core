import React from "react";
import { ApplicationItemProps } from "../../../types/internal";


const ApplicationItem: React.FC<ApplicationItemProps> = ({ appName, onClick }) => {
    return (
        <a onClick={onClick} className="list-group-item list-group-item-action px-3" href="#">
            {appName}
        </a>
    )
};

export default ApplicationItem;