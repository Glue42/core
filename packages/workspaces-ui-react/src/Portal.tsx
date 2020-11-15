import React from "react";
import ReactDOM from "react-dom";
import { PortalProps } from "./types/internal";

class Portal extends React.Component<PortalProps> {
    render() {
        return ReactDOM.createPortal(this.props.children, this.props.domNode);
    }
}

export default Portal;