import configConverter from "../../../src/config/converter";
import { ColumnItem, RowItem, GroupItem, WindowItem, WorkspaceItem } from "../../../src/types/internal";
import { expect } from "chai";
import * as sinon from "sinon";
import * as shortid from "shortid";

describe("convertToRendererConfig() Should", () => {
    const mockId = "mock";
    const mockApp = "mockApp";
    const mockUrl = "mockUrl";

    const mockAppConfig: WindowItem = {
        id: mockId,
        type: "window",
        config: {
            appName: mockApp,
            isFocused: false,
            isLoaded: false,
            isMaximized: false,
            url: mockUrl,
            windowId: undefined
        }
    };

    const workspaceSettings = {
        settings: {
            mode: "default",
            showCloseIcon: false,
            showPopoutIcon: true
        }
    };
    let stub;

    before(() => {
        stub = sinon.stub(shortid, "generate").returns(mockId);
    });

    after(() => {
        stub.restore();
    });

    Array.from(["row", "column"]).forEach((type: "row" | "column") => {
        it(`return the golden layout config with a placeholder window when the config is an empty ${type} config`, () => {
            const column = {
                children: [],
                type,
                config: {},
            };

            const expectedResult = {
                content: [
                    {
                        type: "stack",
                        workspacesConfig: {
                            wrapper: true
                        },
                        content: [
                            {
                                componentName: "emptyVisibleWindow",
                                componentState: {
                                    header: false
                                },
                                id: mockId,
                                type: "component",
                                workspacesConfig: {}
                            }
                        ]
                    }
                ] as any[],
                type,
                workspacesOptions: {}
            };

            const actualResult = configConverter.convertToRendererConfig(column);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the golden layout config when the config is a ${type} with multiple windows`, () => {

            const container: ColumnItem | RowItem = {
                children:
                    [
                        mockAppConfig,
                        mockAppConfig,
                        mockAppConfig
                    ],
                type,
                config: {},
                id: mockId
            };

            const expectedResult = {
                type,
                workspacesOptions: {},
                content: [
                    {
                        type: "stack",
                        workspacesConfig: {
                            wrapper: true
                        },
                        content: [
                            {
                                componentName: `app${mockId}`,
                                componentState: {
                                    header: false,
                                    appName: mockApp,
                                    url: mockUrl,
                                    windowId: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                workspacesConfig: {}
                            }
                        ]
                    },
                    {
                        type: "stack",
                        workspacesConfig: {
                            wrapper: true
                        },
                        content: [
                            {
                                componentName: `app${mockId}`,
                                componentState: {
                                    header: false,
                                    appName: mockApp,
                                    url: mockUrl,
                                    windowId: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                workspacesConfig: {}
                            }
                        ]
                    },
                    {
                        type: "stack",
                        workspacesConfig: {
                            wrapper: true
                        },
                        content: [
                            {
                                componentName: `app${mockId}`,
                                componentState: {
                                    header: false,
                                    appName: mockApp,
                                    url: mockUrl,
                                    windowId: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                workspacesConfig: {}
                            }
                        ]
                    }
                ] as any[]
            };

            const actualResult = configConverter.convertToRendererConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the golden layout config when the config is a ${type} with multiple empty ${type === "row" ? "column" : "row"}s`, () => {

            const container: ColumnItem | RowItem = {
                children:
                    [
                        {
                            type: type === "row" ? "column" : "row",
                            children: []
                        },
                        {
                            type: type === "row" ? "column" : "row",
                            children: []
                        },
                        {
                            type: type === "row" ? "column" : "row",
                            children: []
                        }
                    ],
                type,
                config: {},
                id: mockId
            };

            const emptyWindowPlaceholder = {
                type: "stack",
                workspacesConfig: {
                    wrapper: true
                },
                content: [
                    {
                        componentName: "emptyVisibleWindow",
                        componentState: {
                            header: false
                        },
                        id: mockId,
                        type: "component",
                        workspacesConfig: {}
                    }
                ]
            };
            const expectedResult = {
                type,
                workspacesOptions: {},
                content: [
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        content: [
                            emptyWindowPlaceholder
                        ]
                    },
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        content: [
                            emptyWindowPlaceholder
                        ]
                    },
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        content: [
                            emptyWindowPlaceholder
                        ]
                    }
                ]
            };

            const actualResult = configConverter.convertToRendererConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the golden layout config when the config is a ${type} with multiple empty groups`, () => {

            const container: ColumnItem | RowItem = {
                children:
                    [
                        {
                            type: "group",
                            children: []
                        },
                        {
                            type: "group",
                            children: []
                        },
                        {
                            type: "group",
                            children: []
                        }
                    ],
                type,
                config: {},
                id: mockId
            };

            const emptyWindowPlaceholder = {
                type: "stack",
                workspacesOptions: {},
                content: [
                    {
                        componentName: "emptyVisibleWindow",
                        componentState: {
                            header: false
                        },
                        id: mockId,
                        type: "component",
                        workspacesConfig: {}
                    }
                ]
            };

            const expectedResult = {

                type,
                workspacesOptions: {},
                content: [
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder
                ]
            };

            const actualResult = configConverter.convertToRendererConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });
    });

    it("return the golden layout config when the config is an empty group", () => {
        const group: GroupItem = {
            children: [],
            type: "group",
            config: {},
        };

        const expectedResult = {
            type: "stack",
            workspacesOptions: {},
            content: [
                {
                    componentName: "emptyVisibleWindow",
                    componentState: {
                        header: false
                    },
                    id: mockId,
                    type: "component",
                    workspacesConfig: {}
                }
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(group);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a group with multiple windows", () => {
        const group: GroupItem = {
            children: [
                mockAppConfig,
                mockAppConfig,
                mockAppConfig,
            ],
            type: "group",
            config: {},
        };

        const expectedResult = {
            type: "stack",
            workspacesOptions: {},
            content: [
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        windowId: undefined
                    },
                    id: mockId,
                    type: "component",
                    windowId: undefined,
                    workspacesConfig: {}
                },
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        windowId: undefined
                    },
                    id: mockId,
                    type: "component",
                    windowId: undefined,
                    workspacesConfig: {}
                },
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        windowId: undefined
                    },
                    id: mockId,
                    type: "component",
                    windowId: undefined,
                    workspacesConfig: {}
                }
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(group);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a workspace config with row root", () => {
        const workspace: WorkspaceItem = {
            children: [{
                children: [],
                type: "row",
                config: {},
            }],
            type: "workspace",
            config: {},
        };

        const emptyWindowPlaceholder = {
            type: "stack",
            workspacesConfig: {
                wrapper: true
            },
            content: [
                {
                    componentName: "emptyVisibleWindow",
                    componentState: {
                        header: false
                    },
                    id: mockId,
                    type: "component",
                    workspacesConfig: {}
                }
            ]
        };

        const expectedResult = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                {
                    type: "row",
                    workspacesOptions: {},
                    content: [
                        emptyWindowPlaceholder
                    ]
                }
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a workspace config with column root", () => {
        const workspace: WorkspaceItem = {
            children: [{
                children: [],
                type: "column",
                config: {},
            }],
            type: "workspace",
            config: {},
        };

        const emptyWindowPlaceholder = {
            type: "stack",
            workspacesConfig: {
                wrapper: true
            },
            content: [
                {
                    componentName: "emptyVisibleWindow",
                    componentState: {
                        header: false
                    },
                    id: mockId,
                    type: "component",
                    workspacesConfig: {}
                }
            ]
        };

        const expectedResult = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                {
                    type: "column",
                    workspacesOptions: {},
                    content: [
                        emptyWindowPlaceholder
                    ]
                }
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a workspace config with group root", () => {
        const workspace: WorkspaceItem = {
            children: [{
                children: [],
                type: "group",
                config: {},
            }],
            type: "workspace",
            config: {},
        };

        const emptyWindowPlaceholder = {
            type: "stack",
            workspacesOptions: {},
            content: [
                {
                    componentName: "emptyVisibleWindow",
                    componentState: {
                        header: false
                    },
                    id: mockId,
                    type: "component",
                    workspacesConfig: {}
                }
            ]
        };

        const expectedResult = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                emptyWindowPlaceholder
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a workspace config complex", () => {
        const workspace: WorkspaceItem = {
            children: [{
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: [
                                mockAppConfig
                            ]
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "group",
                                children: [
                                    mockAppConfig
                                ]
                            }]
                        }]
                    }
                ]
            }],
            type: "workspace",
            config: {},
        };

        const expectedResult = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                {
                    type: "row",
                    content: [
                        {
                            type: "column",
                            content: [{
                                type: "stack",
                                content: [
                                    {
                                        componentName: `app${mockId}`,
                                        componentState: {
                                            appName: mockApp,
                                            url: mockUrl,
                                            windowId: undefined
                                        },
                                        id: mockId,
                                        type: "component",
                                        windowId: undefined,
                                        workspacesConfig: {}
                                    }
                                ],
                                workspacesOptions: {},
                            }],
                            workspacesOptions: {},
                        },
                        {
                            type: "column",
                            content: [{
                                type: "row",
                                content: [{
                                    type: "stack",
                                    content: [
                                        {
                                            componentName: `app${mockId}`,
                                            componentState: {
                                                appName: mockApp,
                                                url: mockUrl,
                                                windowId: undefined
                                            },
                                            id: mockId,
                                            type: "component",
                                            windowId: undefined,
                                            workspacesConfig: {}
                                        }
                                    ],
                                    workspacesOptions: {},
                                }],
                                workspacesOptions: {},
                            }],
                            workspacesOptions: {},
                        }
                    ],
                    workspacesOptions: {},
                }
            ]
        };

        const actualResult = configConverter.convertToRendererConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    Array.from([null, undefined]).forEach((input) => {
        it(`return undefined when the config ${input}`, () => {
            const actualResult = configConverter.convertToRendererConfig(input);
            expect(actualResult).to.be.undefined;
        });
    });
});