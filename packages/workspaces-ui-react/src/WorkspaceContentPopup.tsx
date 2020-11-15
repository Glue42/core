import React, { CSSProperties } from "react";
import useOnWorkspaceWindowClicked from "./useWorkspaceWindowClicked";
import useWorkspacePopup from "./useWorkspacePopup";

const WorkspacePopupContent: React.FC<{ innerContentStyle?: CSSProperties, close: () => void }> = ({ children, innerContentStyle, close }) => {
    const popupContentRef = React.createRef<HTMLDivElement>();

    useOnWorkspaceWindowClicked(close);
    useWorkspacePopup(popupContentRef);

    return (
        <div style={innerContentStyle} ref={popupContentRef}>
            {children}
        </div>
    )
};


export default WorkspacePopupContent;