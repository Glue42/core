import React, { useState } from 'react';
import Workspaces, { WorkspaceContents, CloseFrameButton, getFrameId, MinimizeFrameButton, MaximizeFrameButton } from "@glue42/workspaces-ui-react";
import { useGlue } from "@glue42/react-hooks";
import { Glue42 } from "@glue42/desktop";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { Glue42Web } from '@glue42/web';
import CustomWorkspaceContents from './CustomWorkspaceContents';
import { getClientWorkspace, getDocsWorkspace } from './workspaceDefinitions';

const CustomWorkspaces = () => {
    const [docsWorkspace, setDocsWorkspace] = useState<Glue42Workspaces.Workspace | undefined>(undefined);
    const [clientWorkspace, setClientWorkspace] = useState<Glue42Workspaces.Workspace | undefined>(undefined);
    const [showContents, setShowContents] = useState(true);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");

    const waitForMyFrame = (glue: Glue42Web.API | Glue42.Glue) => {
        return new Promise<Glue42Workspaces.Frame>(async (res, rej) => {
            const unsub = await glue.workspaces?.onFrameOpened((f) => {
                if (f.id === getFrameId()) {
                    res(f);
                    if (unsub) {
                        unsub();
                    }
                }
            });
            const frames = await glue.workspaces?.getAllFrames();
            const myFrame = frames?.find(f => f.id === getFrameId());

            if (myFrame) {
                res(myFrame);
                if (unsub) {
                    unsub();
                }
            }
        });
    };

    useGlue(async (glue) => {
        const myFrame = await waitForMyFrame(glue);
        const docsWorkspace = await myFrame.createWorkspace(getDocsWorkspace("dummyApp"));
        const clientWorkspace = await myFrame.createWorkspace(getClientWorkspace("dummyApp", "dummyApp"));

        setDocsWorkspace(docsWorkspace);
        setClientWorkspace(clientWorkspace);

        const unsub = await myFrame?.onWorkspaceSelected((workspace) => {
            setSelectedWorkspaceId(workspace.id);
        });

        return () => {
            if (unsub) {
                unsub();
            }
        }
    }, []);

    const docsStyle = { backgroundColor: docsWorkspace?.id === selectedWorkspaceId ? "white" : "" };
    const portfolioStyle = { backgroundColor: clientWorkspace?.id === selectedWorkspaceId ? "white" : "" };

    return (
        <Workspaces components={{
            header: {
                LogoComponent: () => <>
                    <div className="pinned-workspace-button docs-pinned-button" style={docsStyle} onClick={() => { docsWorkspace?.focus() }} />
                    <div className="pinned-workspace-button client-pinned-button" style={portfolioStyle} onClick={() => { clientWorkspace?.focus() }} />
                </>,
                SystemButtonsComponent: () => <>
                    <button onClick={() => setShowContents(s => !s)}>ToggleCоntents</button>
                    <MinimizeFrameButton />
                    <MaximizeFrameButton />
                    <CloseFrameButton />
                </>
            },
            // WorkspaceContents needs all of the provided props so make sure they are passed
            WorkspaceContents: (props) => showContents ?
                <WorkspaceContents {...props} /> :
                <CustomWorkspaceContents workspaceId={props.workspaceId} />
        }} />
    );
}

export default CustomWorkspaces;