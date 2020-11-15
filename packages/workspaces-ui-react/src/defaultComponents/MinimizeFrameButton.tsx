import React from "react";
import { MinimizeFrameButtonProps } from "../types/internal";
import HeaderButton from "./HeaderButton";

const MinimizeFrameButton: React.FC<MinimizeFrameButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "minimize"} className={"lm_minimise"} >{children}</HeaderButton>
};

export default MinimizeFrameButton;
