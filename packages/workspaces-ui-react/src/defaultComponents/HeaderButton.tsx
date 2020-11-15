import React from "react";

const HeaderButton: React.FC<{ title: string, className: string }> = ({ title, className, children, ...props }) => {
    return (
        <li {...props} title={title} className={className}>
            {children}
        </li>
    )
};

export default HeaderButton;
