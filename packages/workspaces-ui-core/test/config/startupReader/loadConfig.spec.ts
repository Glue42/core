/* eslint-disable @typescript-eslint/no-explicit-any */
import startupReader from "../../../src/config/startupReader";
import { expect } from "chai";

declare const global: any;

describe("loadConfig() Should", () => {
    afterEach(() => {
        global.window = undefined;
        global.document = undefined;
    });

    it("return empty frame as false when the empty frame parameter is missing", () => {
        global.window = {
            location: {
                search: "",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.emptyFrame).to.be.false;
    });

    it("return empty frame as true when the empty frame parameter is present", () => {
        global.window = {
            location: {
                search: "?emptyFrame=true",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };
        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.emptyFrame).to.be.true;
    });

    it("return disable custom buttons as false when the disable custom buttons parameter is missing", () => {
        global.window = {
            location: {
                search: "",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.disableCustomButtons).to.be.false;
    });

    it("return disable custom buttons as true when the disable custom buttons parameter is present", () => {
        global.window = {
            location: {
                search: "?disableCustomButtons=true",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.disableCustomButtons).to.be.true;
    });

    it("return workspaceNames as empty array when the both workspaceName and workspaceNames is null", () => {
        global.window = {
            location: {
                search: "",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.workspaceNames.length).to.eql(0);
        expect(Array.isArray(resultConfig.workspaceNames)).to.be.true;
    });

    it("return workspaceNames with a name when the both workspaceName is set and workspaceNames is null", () => {
        const mockName = "mockName";
        global.window = {
            location: {
                search: `?workspaceName=${mockName}`,
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.workspaceNames.length).to.eql(1);
        expect(Array.isArray(resultConfig.workspaceNames)).to.be.true;
        expect(resultConfig.workspaceNames[0]).to.eql(mockName);
    });

    it("return workspaceNames with names when the both workspaceName is set and workspaceNames is set", () => {
        const mockName = "mockName";
        const mockNames = ["mockName1", "mockName2", "mockName3"];
        global.window = {
            location: {
                search: `?workspaceName=${mockName}&workspaceNames=${JSON.stringify(mockNames)}`,
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.workspaceNames.length).to.eql(4);
        expect(Array.isArray(resultConfig.workspaceNames)).to.be.true;
        [mockName, ...mockNames].forEach((n) => {
            const containsName = resultConfig.workspaceNames.indexOf(n) != -1;

            expect(containsName).to.be.true;
        });
    });

    it("return workspaceNames with names when the workspaceName is null and workspaceNames is set", () => {
        const mockNames = ["mockName1", "mockName2", "mockName3"];
        global.window = {
            location: {
                search: `?workspaceNames=${JSON.stringify(mockNames)}`,
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.workspaceNames.length).to.eql(3);
        expect(Array.isArray(resultConfig.workspaceNames)).to.be.true;
        mockNames.forEach((n) => {
            const containsName = resultConfig.workspaceNames.indexOf(n) != -1;

            expect(containsName).to.be.true;
        });
    });

    it("return context as an object when context is set", () => {
        const context = { myContext: 1 };
        global.window = {
            location: {
                search: `?context=${JSON.stringify(context)}`,
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.context).to.eql(context);
    });

    it("have context as null when the context isn't passed", () => {
        global.window = {
            location: {
                search: "",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: () => {
                    // do nothing
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        const resultConfig = startupReader.loadConfig();

        expect(resultConfig.context).to.be.null;
    });

    it("cleanUp the url when only emptyFrame is passed", () => {
        let invoked = false;
        global.window = {
            location: {
                search: "?emptyFrame=true",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: (_, __, url) => {
                    invoked = true;
                    expect(url).to.eql("https://glue42.com/core/?");
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        startupReader.loadConfig();

        expect(invoked).to.be.true;
    });

    it("cleanUp the url when emptyFrame and workspaceName is passed second", () => {
        let invoked = false;
        global.window = {
            location: {
                search: "?emptyFrame=true&workspaceName=WSPSname",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: (_, __, url) => {
                    invoked = true;
                    expect(url).to.eql("https://glue42.com/core/?workspaceName=WSPSname");
                }
            }
        };
        global.document = {
            title: "glue42"
        };

        startupReader.loadConfig();
        expect(invoked).to.be.true;

    });

    it("cleanUp the url when emptyFrame and workspaceName is passed first", () => {
        let invoked = false;
        global.window = {
            location: {
                search: "?workspaceName=WSPSname&emptyFrame=true",
                origin: "https://glue42.com",
                pathname: "/core/"
            },
            history: {
                replaceState: (_, __, url) => {
                    invoked = true;
                    expect(url).to.eql("https://glue42.com/core/?workspaceName=WSPSname");
                }
            }
        };

        global.document = {
            title: "glue42"
        };

        startupReader.loadConfig();
        
        expect(invoked).to.be.true;
    });
});
