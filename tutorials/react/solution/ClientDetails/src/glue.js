export const setClientFromWorkspace = setClient => glue => {
    glue.windows.my().onContextUpdated(context => {
        if (context) {
            setClient(context);
        }
    });
}