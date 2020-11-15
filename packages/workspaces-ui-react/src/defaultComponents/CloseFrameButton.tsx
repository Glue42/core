import React from "react";
import { CloseFrameButtonProps } from "../types/internal";
import HeaderButton from "./HeaderButton";

const CloseFrameButton: React.FC<CloseFrameButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "close"} className={"lm_close"}>{children}</HeaderButton>
};

export default CloseFrameButton;
