export const startAppWithWorkspace = glue => client => {
    glue.workspaces.restoreWorkspace("example", { context: client });
}
