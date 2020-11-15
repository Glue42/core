import React from "react";
import AddApplicationPopup from "./defaultComponents/popups/addApplication/AddApplicationPopup";
import AddWorkspacePopup from "./defaultComponents/popups/addWorkspace/AddWorkspacePopup";
import SaveWorkspacePopup from "./defaultComponents/popups/saveWorkspace/SaveWorkspacePopup";
import Portal from "./Portal";
import { AddApplicationPopupProps, CreateElementRequestOptions, ElementCreationWrapperState, AddWorkspacePopupProps, SaveWorkspacePopupProps, WorkspacesProps } from "./types/internal";
import WorkspacesWrapper from "./WorkspacesWrapper";

class WorkspacesElementCreationWrapper extends React.Component<WorkspacesProps, ElementCreationWrapperState> {
    constructor(props: WorkspacesProps) {
        super(props);
        this.state = {
            logo: undefined,
            addWorkspace: undefined,
            systemButtons: undefined,
            saveWorkspacePopup: undefined,
            addApplicationPopup: undefined,
            addWorkspacePopup: undefined
        }
    }

    onCreateLogoRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.logo) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                logo: options
            }
        });
    }

    onCreateAddWorkspaceRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.addWorkspace) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspace: options
            }
        });
    }

    onCreateSystemButtonsRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.systemButtons) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                systemButtons: options
            }
        });
    }

    onCreateSaveWorkspaceRequested = (options: CreateElementRequestOptions & SaveWorkspacePopupProps) => {
        if (options === this.state.saveWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                saveWorkspacePopup: options
            }
        }, options.callback);
    }

    onCreateAddApplicationRequested = (options: CreateElementRequestOptions & AddApplicationPopupProps) => {
        if (options === this.state.addApplicationPopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addApplicationPopup: options
            }
        }, options.callback);
    }

    onCreateAddWorkspacePopupRequested = (options: CreateElementRequestOptions & AddWorkspacePopupProps) => {
        if (options === this.state.addWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspacePopup: options
            }
        }, options.callback);
    }

    onHideSystemPopups = (cb: () => void) => {
        this.setState((s) => ({
            ...s,
            addApplicationPopup: undefined,
            saveWorkspacePopup: undefined,
            addWorkspacePopup: undefined
        }), cb);
    }

    renderLogoComponent = () => {
        const LogoCustomElement = this.props.components?.header?.LogoComponent;
        if (!LogoCustomElement || (!this.state.logo || !this.state.logo.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.logo;
        return <Portal domNode={domNode}><LogoCustomElement {...options} /></Portal>
    }

    renderAddWorkspaceComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.header?.AddWorkspaceComponent;

        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspace || !this.state.addWorkspace.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.addWorkspace;
        return <Portal domNode={domNode}><AddWorkspaceCustomComponent {...options} /></Portal>
    }

    renderSystemButtonsComponent = () => {
        const SystemButtonsCustomComponent = this.props.components?.header?.SystemButtonsComponent;
        if (!SystemButtonsCustomComponent || (!this.state.systemButtons || !this.state.systemButtons.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.systemButtons;

        return <Portal domNode={domNode}><SystemButtonsCustomComponent {...options} /></Portal>
    }

    renderSaveWorkspacePopupComponent = () => {
        const SaveWorkspaceCustomComponent = this.props.components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        if (!SaveWorkspaceCustomComponent || (!this.state.saveWorkspacePopup || !this.state.saveWorkspacePopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.saveWorkspacePopup;

        return <Portal domNode={domNode}><SaveWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddApplicationPopupComponent = () => {
        const AddApplicationCustomComponent = this.props.components?.popups?.AddApplicationComponent || AddApplicationPopup;
        if (!AddApplicationCustomComponent || (!this.state.addApplicationPopup || !this.state.addApplicationPopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.addApplicationPopup;

        return <Portal domNode={domNode}><AddApplicationCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddWorkspacePopupComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;
        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspacePopup || !this.state.addWorkspacePopup.domNode)) {
            return;
        }
        const { domNode, callback, ...options } = this.state.addWorkspacePopup;

        return <Portal domNode={domNode}><AddWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    render() {
        const { components, ...additionalProperties } = this.props;
        const addApplicationComponent = components?.popups?.AddApplicationComponent || AddApplicationPopup;
        const saveWorkspaceComponent = components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        const addWorkspaceComponent = components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;

        const onCreateAddApplicationRequested = addApplicationComponent && typeof addApplicationComponent !== "string" ?
            this.onCreateAddApplicationRequested : undefined;

        const onCreateAddWorkspacePopupRequested = addWorkspaceComponent && typeof addWorkspaceComponent !== "string" ?
            this.onCreateAddWorkspacePopupRequested : undefined;

        const onCreateSaveWorkspaceRequested = saveWorkspaceComponent && typeof saveWorkspaceComponent !== "string" ?
            this.onCreateSaveWorkspaceRequested : undefined;

        const addApplication = typeof addApplicationComponent === "string" ? addApplicationComponent : undefined;
        const saveWorkspace = typeof saveWorkspaceComponent === "string" ? saveWorkspaceComponent : undefined;
        const addWorkspace = typeof addWorkspaceComponent === "string" ? addWorkspaceComponent : undefined;

        const externalPopupApplications = {
            addApplication,
            saveWorkspace,
            addWorkspace
        }

        return (
            <div {...additionalProperties} style={{ overflow: "hidden", width: "100%", height: "100%" }}>
                {this.renderLogoComponent()}
                {this.renderAddWorkspaceComponent()}
                {this.renderSystemButtonsComponent()}
                {this.renderSaveWorkspacePopupComponent()}
                {this.renderAddApplicationPopupComponent()}
                {this.renderAddWorkspacePopupComponent()}
                <WorkspacesWrapper
                    onCreateSystemButtonsRequested={components?.header?.SystemButtonsComponent ? this.onCreateSystemButtonsRequested : undefined}
                    onCreateAddWorkspaceRequested={components?.header?.AddWorkspaceComponent ? this.onCreateAddWorkspaceRequested : undefined}
                    onCreateLogoRequested={components?.header?.LogoComponent ? this.onCreateLogoRequested : undefined}
                    onCreateSaveWorkspacePopupRequested={onCreateSaveWorkspaceRequested}
                    onCreateAddApplicationPopupRequested={onCreateAddApplicationRequested}
                    onCreateAddWorkspacePopupRequested={onCreateAddWorkspacePopupRequested}
                    onHideSystemPopupsRequested={this.onHideSystemPopups}
                    externalPopupApplications={externalPopupApplications}
                    glue={this.props.glue}
                />
            </div>
        );
    }
}

export default WorkspacesElementCreationWrapper;
