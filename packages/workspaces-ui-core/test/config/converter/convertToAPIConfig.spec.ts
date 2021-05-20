/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigConverter } from "../../../src/config/converter";
import { ColumnItem, RowItem, GroupItem, WorkspaceItem } from "../../../src/types/internal";
import { expect } from "chai";
import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import sinon from "sinon";

describe("convertToAPIConfig() Should", () => {
    const mockId = "mock";
    const mockApp = "mockApp";
    const mockUrl = "mockUrl";

    const mockAppConfig: any = {
        id: mockId,
        type: "window",
        config: {
            appName: mockApp,
            isFocused: false,
            isLoaded: false,
            isMaximized: undefined,
            url: mockUrl,
            windowId: undefined,
            frameId: undefined,
            positionIndex: undefined,
            title: undefined,
            workspaceId: undefined,
            allowExtract: undefined,
            showCloseButton: undefined,
            minWidth: undefined,
            maxWidth: undefined,
            minHeight: undefined,
            maxHeight: undefined,
            widthInPx: undefined,
            heightInPx: undefined
        }
    };

    const workspaceSettings = {
        settings: {
            showCloseIcon: false,
            showMaximizeIcon: true,
            showPopoutIcon: true
        }
    };

    let configConverter: ConfigConverter;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        };

        configConverter = new ConfigConverter(new WorkspacesConfigurationFactory(glueStub));
    });

    Array.from(["row", "column"]).forEach((type: "row" | "column") => {
        it(`return the ${type} API config without placeholder elements when the config is a ${type} with placeholder`, () => {
            const expectedResult: object = {
                children: [],
                type,
                config: {
                    activeTabIndex: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined
            };

            const container: object = {
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
                workspacesOptions: {}
            };

            const actualResult = configConverter.convertToAPIConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the API config when the config is a ${type} with multiple windows`, () => {

            const expectedResult: ColumnItem | RowItem = {
                children:
                    [
                        mockAppConfig,
                        mockAppConfig,
                        mockAppConfig
                    ],
                type,
                config: {
                    activeTabIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined
            };

            const container: object = {
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
                ] as object[]
            };

            const actualResult = configConverter.convertToAPIConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the API config when the config is a ${type} with multiple empty ${type === "row" ? "column" : "row"}s`, () => {

            const expectedResult: ColumnItem | RowItem = {
                children:
                    [
                        {
                            type: type === "row" ? "column" : "row",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        },
                        {
                            type: type === "row" ? "column" : "row",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        },
                        {
                            type: type === "row" ? "column" : "row",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        }
                    ],
                type,
                config: {
                    activeTabIndex: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined
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
            const container: object = {
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

            const actualResult = configConverter.convertToAPIConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });

        it(`return the golden layout config when the config is a ${type} with multiple empty groups`, () => {

            const expectedResult: ColumnItem | RowItem = {
                children:
                    [
                        {
                            type: "group",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                allowExtract: undefined,
                                showEjectButton: undefined,
                                showAddWindowButton: undefined,
                                showMaximizeButton: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        },
                        {
                            type: "group",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                allowExtract: undefined,
                                showEjectButton: undefined,
                                showAddWindowButton: undefined,
                                showMaximizeButton: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        },
                        {
                            type: "group",
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                allowExtract: undefined,
                                showEjectButton: undefined,
                                showAddWindowButton: undefined,
                                showMaximizeButton: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            id: undefined,
                            children: []
                        }
                    ],
                type,
                config: {
                    activeTabIndex: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined
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

            const container: object = {
                type,
                workspacesOptions: {},
                content: [
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder,
                    emptyWindowPlaceholder
                ]
            };

            const actualResult = configConverter.convertToAPIConfig(container);
            expect(actualResult).to.eql(expectedResult);
        });
    });

    it("return the API config when the config is an empty group", () => {
        const expectedResult: GroupItem = {
            children: [],
            type: "group",
            config: {
                activeTabIndex: undefined,
                frameId: undefined,
                height: undefined,
                workspaceId: undefined,
                width: undefined,
                positionIndex: undefined,
                allowDrop: undefined,
                isPinned: undefined,
                widthInPx: undefined,
                heightInPx: undefined,
                allowExtract: undefined,
                showAddWindowButton: undefined,
                showEjectButton: undefined,
                showMaximizeButton: undefined,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined
            },
            id: undefined
        };

        const group: object = {
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

        const actualResult = configConverter.convertToAPIConfig(group);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the API config when the config is a group with multiple windows", () => {
        const expectedResult: GroupItem = {
            children: [
                mockAppConfig,
                mockAppConfig,
                mockAppConfig,
            ],
            type: "group",
            config: {
                activeTabIndex: undefined,
                frameId: undefined,
                height: undefined,
                workspaceId: undefined,
                width: undefined,
                positionIndex: undefined,
                allowExtract: undefined,
                allowDrop: undefined,
                isPinned: undefined,
                widthInPx: undefined,
                heightInPx: undefined,
                showAddWindowButton: undefined,
                showEjectButton: undefined,
                showMaximizeButton: undefined,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined
            },
            id: undefined
        };

        const group: object = {
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

        const actualResult = configConverter.convertToAPIConfig(group);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the API config when the config is a workspace config with row root", () => {
        const expectedResult: WorkspaceItem = {
            children: [{
                children: [],
                type: "row",
                config: {
                    activeTabIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined
            }],
            id: undefined,
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

        const workspace: object = {
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

        const actualResult = configConverter.convertToAPIConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the API config when the config is a workspace config with column root", () => {
        const expectedResult: WorkspaceItem = {
            children: [{
                children: [],
                type: "column",
                config: {
                    activeTabIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                id: undefined,
            }],
            id: undefined,
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

        const workspace: object = {
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

        const actualResult = configConverter.convertToAPIConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the golden layout config when the config is a workspace config with group root", () => {
        const expectedResult: WorkspaceItem = {
            children: [{
                children: [],
                type: "group",
                id: undefined,
                config: {
                    activeTabIndex: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    allowExtract: undefined,
                    showAddWindowButton: undefined,
                    showEjectButton: undefined,
                    showMaximizeButton: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
            }],
            id: undefined,
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

        const workspace: object = {
            ...workspaceSettings,
            workspacesOptions: {},
            content: [
                emptyWindowPlaceholder
            ]
        };

        const actualResult = configConverter.convertToAPIConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    it("return the api config when the config is a workspace config complex", () => {
        const expectedResult: WorkspaceItem = {
            children: [{
                type: "row",
                id: undefined,
                config: {
                    activeTabIndex: undefined,
                    frameId: undefined,
                    height: undefined,
                    workspaceId: undefined,
                    width: undefined,
                    positionIndex: undefined,
                    allowDrop: undefined,
                    isPinned: undefined,
                    widthInPx: undefined,
                    heightInPx: undefined,
                    minWidth: undefined,
                    maxWidth: undefined,
                    minHeight: undefined,
                    maxHeight: undefined
                },
                children: [
                    {
                        type: "column",
                        id: undefined,
                        config: {
                            activeTabIndex: undefined,
                            frameId: undefined,
                            height: undefined,
                            workspaceId: undefined,
                            width: undefined,
                            positionIndex: undefined,
                            allowDrop: undefined,
                            isPinned: undefined,
                            widthInPx: undefined,
                            heightInPx: undefined,
                            minWidth: undefined,
                            maxWidth: undefined,
                            minHeight: undefined,
                            maxHeight: undefined
                        },
                        children: [{
                            type: "group",
                            id: undefined,
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                allowExtract: undefined,
                                showAddWindowButton: undefined,
                                showEjectButton: undefined,
                                showMaximizeButton: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            children: [
                                mockAppConfig
                            ]
                        }]
                    },
                    {
                        type: "column",
                        id: undefined,
                        config: {
                            activeTabIndex: undefined,
                            frameId: undefined,
                            height: undefined,
                            workspaceId: undefined,
                            width: undefined,
                            positionIndex: undefined,
                            allowDrop: undefined,
                            isPinned: undefined,
                            widthInPx: undefined,
                            heightInPx: undefined,
                            minWidth: undefined,
                            maxWidth: undefined,
                            minHeight: undefined,
                            maxHeight: undefined
                        },
                        children: [{
                            type: "row",
                            id: undefined,
                            config: {
                                activeTabIndex: undefined,
                                frameId: undefined,
                                height: undefined,
                                workspaceId: undefined,
                                width: undefined,
                                positionIndex: undefined,
                                allowDrop: undefined,
                                isPinned: undefined,
                                widthInPx: undefined,
                                heightInPx: undefined,
                                minWidth: undefined,
                                maxWidth: undefined,
                                minHeight: undefined,
                                maxHeight: undefined
                            },
                            children: [{
                                type: "group",
                                id: undefined,
                                config: {
                                    activeTabIndex: undefined,
                                    frameId: undefined,
                                    height: undefined,
                                    workspaceId: undefined,
                                    width: undefined,
                                    positionIndex: undefined,
                                    allowDrop: undefined,
                                    isPinned: undefined,
                                    widthInPx: undefined,
                                    heightInPx: undefined,
                                    allowExtract: undefined,
                                    showAddWindowButton: undefined,
                                    showEjectButton: undefined,
                                    showMaximizeButton: undefined,
                                    minWidth: undefined,
                                    maxWidth: undefined,
                                    minHeight: undefined,
                                    maxHeight: undefined
                                },
                                children: [
                                    mockAppConfig
                                ]
                            }]
                        }]
                    }
                ]
            }],
            config: {},
            id: undefined
        };

        const workspace: object = {
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

        const actualResult = configConverter.convertToAPIConfig(workspace);
        expect(actualResult).to.eql(expectedResult);
    });

    Array.from([null, undefined]).forEach((input) => {
        it(`return undefined when the config ${input}`, () => {
            const actualResult = configConverter.convertToAPIConfig(input);
            expect(actualResult).to.be.undefined;
        });
    });
});
