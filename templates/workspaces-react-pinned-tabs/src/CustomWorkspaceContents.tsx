import React from "react";

const CustomWorkspaceContents: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
    return (
        <div>The workspace contents for workspace {workspaceId} are replaced. To bring them back please click on ToggleWorkspaceContents!</div>
    )
}

export default CustomWorkspaceContents;