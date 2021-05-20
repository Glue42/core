import { ConfigConverter } from "../../../src/config/converter";
import { ColumnItem, RowItem, GroupItem, WindowItem, WorkspaceItem, ParentItem } from "../../../src/types/internal";
import { expect } from "chai";
import Sinon, * as sinon from "sinon";
import shortid from "shortid";
import { WorkspacesConfigurationFactory } from "../../../src/config/factory";

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
            title: undefined,
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

    let configConverter: ConfigConverter;

    let stub: Sinon.SinonStub;

    sinon.stub()

    before(() => {
        stub = sinon.stub(shortid, "generate").returns(mockId);
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        };

        configConverter = new ConfigConverter(new WorkspacesConfigurationFactory(glueStub));
    });

    after(() => {
        stub.restore();
    });

    Array.from(["row", "column"]).forEach((type: "row" | "column") => {
        it(`return the golden layout config with a placeholder window when the config is an empty ${type} config`, () => {
            const column: ParentItem = {
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
                ] as object[],
                type,
                width: undefined,
                height: undefined,
                workspacesOptions: {},
                workspacesConfig: {
                    allowDrop: undefined,
                    isPinned: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
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
                width: undefined,
                height: undefined,
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
                                    windowId: undefined,
                                    title: undefined,
                                    context: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                title: undefined,
                                workspacesConfig: {
                                    allowExtract: undefined,
                                    showCloseButton: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                }
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
                                    windowId: undefined,
                                    title: undefined,
                                    context: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                title: undefined,
                                workspacesConfig: {
                                    allowExtract: undefined,
                                    showCloseButton: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                }
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
                                    windowId: undefined,
                                    title: undefined,
                                    context: undefined
                                },
                                id: mockId,
                                type: "component",
                                windowId: undefined,
                                title: undefined,
                                workspacesConfig: {
                                    allowExtract: undefined,
                                    showCloseButton: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                }
                            }
                        ]
                    }
                ] as object[],
                workspacesConfig: {
                    allowDrop: undefined,
                    isPinned: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
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
                width: undefined,
                height: undefined,
                workspacesOptions: {},
                content: [
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        width: undefined,
                        height: undefined,
                        content: [
                            emptyWindowPlaceholder
                        ],
                        workspacesConfig: {
                            allowDrop: undefined,
                            isPinned: undefined,
                            minWidth: undefined,
                            maxWidth: undefined,
                            minHeight: undefined,
                            maxHeight: undefined
                        },
                    },
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        width: undefined,
                        height: undefined,
                        content: [
                            emptyWindowPlaceholder
                        ],
                        workspacesConfig: {
                            allowDrop: undefined,
                            isPinned: undefined,
                            minWidth: undefined,
                            maxWidth: undefined,
                            minHeight: undefined,
                            maxHeight: undefined
                        },
                    },
                    {
                        type: type === "row" ? "column" : "row",
                        workspacesOptions: {},
                        width: undefined,
                        height: undefined,
                        content: [
                            emptyWindowPlaceholder
                        ], workspacesConfig: {
                            allowDrop: undefined,
                            isPinned: undefined,
                            minWidth: undefined,
                            maxWidth: undefined,
                            minHeight: undefined,
                            maxHeight: undefined
                        },
                    }
                ],
                workspacesConfig: {
                    allowDrop: undefined,
                    isPinned: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
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
                activeItemIndex: undefined,
                width: undefined,
                height: undefined,
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
                ],
                workspacesConfig: {
                    allowDrop: undefined,
                    allowExtract: undefined,
                    showEjectButton: undefined,
                    showMaximizeButton: undefined,
                    showAddWindowButton: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
            };

            const expectedResult = {
                type,
                workspacesOptions: {},
                width: undefined,
                height: undefined,
                content: [
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder
                ],
                workspacesConfig: {
                    allowDrop: undefined,
                    isPinned: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
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
            activeItemIndex: undefined,
            width: undefined,
            height: undefined,
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
            ],
            workspacesConfig: {
                allowDrop: undefined,
                allowExtract: undefined,
                showEjectButton: undefined,
                showMaximizeButton: undefined,
                showAddWindowButton: undefined,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined
            }
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

        const expectedResult: object = {
            type: "stack",
            workspacesOptions: {},
            activeItemIndex: undefined,
            width: undefined,
            height: undefined,
            content: [
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        windowId: undefined,
                        title: undefined,
                        context: undefined
                    },
                    id: mockId,
                    type: "component",
                    windowId: undefined,
                    title: undefined,
                    workspacesConfig: {
                        allowExtract: undefined,
                        showCloseButton: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    }
                },
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        windowId: undefined,
                        title: undefined,
                        context: undefined
                    },
                    id: mockId,
                    type: "component",
                    title: undefined,
                    windowId: undefined,
                    workspacesConfig: {
                        allowExtract: undefined,
                        showCloseButton: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    }
                },
                {
                    componentName: `app${mockId}`,
                    componentState: {
                        appName: mockApp,
                        url: mockUrl,
                        title: undefined,
                        windowId: undefined,
                        context: undefined
                    },
                    id: mockId,
                    type: "component",
                    windowId: undefined,
                    title: undefined,
                    workspacesConfig: {
                        allowExtract: undefined,
                        showCloseButton: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    }
                }
            ],
            workspacesConfig: {
                allowDrop: undefined,
                allowExtract: undefined,
                showEjectButton: undefined,
                showMaximizeButton: undefined,
                showAddWindowButton: undefined,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined
            },
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
                    width: undefined,
                    height: undefined,
                    workspacesOptions: {},
                    content: [
                        emptyWindowPlaceholder
                    ],
                    workspacesConfig: {
                        allowDrop: undefined,
                        isPinned: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    }
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
                    width: undefined,
                    height: undefined,
                    content: [
                        emptyWindowPlaceholder
                    ],
                    workspacesConfig: {
                        allowDrop: undefined,
                        isPinned: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    },
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
            activeItemIndex: undefined,
            width: undefined,
            height: undefined,
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
            ],
            workspacesConfig: {
                allowDrop: undefined,
                allowExtract: undefined,
                showEjectButton: undefined,
                showMaximizeButton: undefined,
                showAddWindowButton: undefined,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined
            },
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

        const expectedResult: object = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                {
                    type: "row",
                    width: undefined,
                    height: undefined,
                    content: [
                        {
                            type: "column",
                            width: undefined,
                            height: undefined,
                            content: [{
                                type: "stack",
                                activeItemIndex: undefined,
                                width: undefined,
                                height: undefined,
                                content: [
                                    {
                                        componentName: `app${mockId}`,
                                        componentState: {
                                            appName: mockApp,
                                            url: mockUrl,
                                            windowId: undefined,
                                            title: undefined,
                                            context: undefined
                                        },
                                        id: mockId,
                                        type: "component",
                                        windowId: undefined,
                                        title: undefined,
                                        workspacesConfig: {
                                            allowExtract: undefined,
                                            showCloseButton: undefined,
                                            minWidth: undefined,
                                            maxWidth: undefined,
                                            minHeight: undefined,
                                            maxHeight: undefined
                                        }
                                    }
                                ],
                                workspacesConfig: {
                                    allowDrop: undefined,
                                    allowExtract: undefined,
                                    showEjectButton: undefined,
                                    showMaximizeButton: undefined,
                                    showAddWindowButton: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                },
                                workspacesOptions: {},
                            }],
                            workspacesConfig: {
                                allowDrop: undefined,
                                isPinned: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            workspacesOptions: {},
                        },
                        {
                            type: "column",
                            width: undefined,
                            height: undefined,
                            content: [{
                                type: "row",
                                width: undefined,
                                height: undefined,
                                content: [{
                                    type: "stack",
                                    activeItemIndex: undefined,
                                    width: undefined,
                                    height: undefined,
                                    content: [
                                        {
                                            componentName: `app${mockId}`,
                                            componentState: {
                                                appName: mockApp,
                                                url: mockUrl,
                                                windowId: undefined,
                                                title: undefined,
                                                context: undefined
                                            },
                                            id: mockId,
                                            type: "component",
                                            windowId: undefined,
                                            title: undefined,
                                            workspacesConfig: {
                                                allowExtract: undefined,
                                                showCloseButton: undefined,
                                                minWidth: undefined,
                                                maxWidth: undefined,
                                                minHeight: undefined,
                                                maxHeight: undefined
                                            }
                                        }
                                    ],
                                    workspacesConfig: {
                                        allowDrop: undefined,
                                        allowExtract: undefined,
                                        showEjectButton: undefined,
                                        showMaximizeButton: undefined,
                                        showAddWindowButton: undefined,
                                        minWidth: undefined,
                                        maxWidth: undefined,
                                        minHeight: undefined,
                                        maxHeight: undefined
                                    },
                                    workspacesOptions: {},
                                }],
                                workspacesConfig: {
                                    allowDrop: undefined,
                                    isPinned: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                },
                                workspacesOptions: {},
                            }],
                            workspacesConfig: {
                                allowDrop: undefined,
                                isPinned: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            workspacesOptions: {},
                        }
                    ],
                    workspacesConfig: {
                        allowDrop: undefined,
                        isPinned: undefined,
                        minWidth: undefined,
                        maxWidth: undefined,
                        minHeight: undefined,
                        maxHeight: undefined
                    },
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
