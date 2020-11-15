import React from "react";
import { MaximizeFrameButtonProps } from "../types/internal";
import HeaderButton from "./HeaderButton";

const MaximizeFrameButton: React.FC<MaximizeFrameButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "maximize"} className={"lm_maximise"}>{children}</HeaderButton>
};

export default MaximizeFrameButton;
