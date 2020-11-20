import { Glue42Workspaces } from "@glue42/workspaces-api";

/**
 * Provides the workspace definition for the sample docs workspace
 * @param docsApplication the name of the application to be used for the docs app
 */
export const getDocsWorkspace = (docsApplication: string): Glue42Workspaces.WorkspaceDefinition => ({
    children: [
        {
            type: "group",
            children: [{
                type: "window",
                appName: docsApplication
            }]
        }
    ],
    config: {
        noTabHeader: true
    }
});

/**
 * Provides the workspace definition for the sample client workspace
 * @param clientApplication the name of the application to be used for the client app
 * @param portfolioApplication the name of the application to be used for the portfolio app
 */
export const getClientWorkspace = (clientApplication: string, portfolioApplication: string): Glue42Workspaces.WorkspaceDefinition => ({
    children: [
        {
            type: "row",
            children: [
                {
                    type: "column",
                    children: [
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: clientApplication
                                }
                            ]
                        },
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: portfolioApplication
                                }
                            ]
                        }
                    ]
                }]
        }
    ],
    config: {
        noTabHeader: true
    }
});
