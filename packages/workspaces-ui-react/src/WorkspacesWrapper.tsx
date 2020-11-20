import React from "react";
import { WorkspacesWrapperProps } from "./types/internal";
import withGlueInstance from "./withGlueInstance";
import workspacesManager from "./workspacesManager";

const templateId = "workspaces-react-wrapper-template";
const workspacesInnerContainerId = "outter-layout-container";

class WorkspacesWrapper extends React.Component<WorkspacesWrapperProps> {
    containerRef: HTMLElement | null;

    componentDidMount() {
        let placeholder = document.getElementById(templateId) as HTMLTemplateElement;
        if (!placeholder) {
            const template = document.createElement("template");
            template.id = templateId;
            const glContainer = document.createElement("div");

            glContainer.id = workspacesInnerContainerId;
            glContainer.style.overflow = "hidden";
            glContainer.style.width = "100%";
            glContainer.style.height = "100%";
            template.content.appendChild(glContainer);
            document.body.appendChild(template);
            placeholder = template;
        }
        if (!this.containerRef) {
            return;
        }
        this.containerRef.appendChild(placeholder.content);

        const componentFactory = {
            createLogo: this.props.onCreateLogoRequested,
            createAddWorkspace: this.props.onCreateAddWorkspaceRequested,
            createSystemButtons: this.props.onCreateSystemButtonsRequested,
            createWorkspaceContents: this.props.onCreateWorkspaceContentsRequested,
            createSaveWorkspacePopup: this.props.onCreateSaveWorkspacePopupRequested,
            createAddApplicationPopup: this.props.onCreateAddApplicationPopupRequested,
            createAddWorkspacePopup: this.props.onCreateAddWorkspacePopupRequested,
            hideSystemPopups: this.props.onHideSystemPopupsRequested,
            externalPopupApplications: this.props.externalPopupApplications
        };
        workspacesManager.init(this.props.glue, componentFactory);
    }

    componentWillUnmount() {
        let placeholder = document.getElementById(templateId) as HTMLTemplateElement;

        if (!this.containerRef) {
            return;
        }

        placeholder?.content.appendChild(this.containerRef.children[0]);

        workspacesManager.unmount();
    }

    render() {
        return (
            <div ref={(r) => this.containerRef = r} style={{ overflow: "hidden", width: "100%", height: "100%" }}>

            </div>
        );
    }
}

export default withGlueInstance(WorkspacesWrapper);