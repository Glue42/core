import React, { useEffect, useState } from "react";
import { WorkspacePopupProps } from "./types/internal";
import Popup from "reactjs-popup";
import WorkspacePopupContent from "./WorkspaceContentPopup";
import { PopupActions } from "reactjs-popup/dist/types";

const WorkspacePopup: React.FC<WorkspacePopupProps> = ({ children, innerContentStyle, popupRef, ...props }) => {
    const ref = popupRef || React.createRef<PopupActions>();
    const [shouldClose, setShouldClose] = useState(false);

    useEffect(() => {
        if (!shouldClose) {
            return;
        }

        ref.current?.close();
        setShouldClose(false);
    }, [shouldClose]);

    return (
        <Popup ref={ref} {...props}>
            <WorkspacePopupContent innerContentStyle={innerContentStyle} close={() => setShouldClose(true)} children={children} />
        </Popup>
    )
}

export default WorkspacePopup;