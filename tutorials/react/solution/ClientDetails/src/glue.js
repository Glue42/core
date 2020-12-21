export const setClientFromWorkspace = setClient => glue =>
    glue.workspaces.getMyWorkspace()
        .then(myWorkspace => {
            myWorkspace
                .onContextUpdated(context => {
                    if (context) {
                        setClient(context);
                        myWorkspace.setTitle(context.clientName);
                    }
                })
        });
