export const setClientFromWorkspace = setClient => glue => {
    glue.windows.my().onContextUpdated(context => {
        if (context) {
            setClient(context);
            glue.workspaces.getMyWorkspace()
                .then(workspace => workspace.setTitle(context.clientName));
        }
    });
}