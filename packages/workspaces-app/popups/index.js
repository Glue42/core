
const config = {
    application: "WorkspacesPopup",
    appManager: true
};

GlueWeb(config).then(async (glue) => {
    window.interopId = glue.interop.instance.peerId;
    let startInformation = {};
    const getAppHtml = (appName) => {
        const template = document.createElement('template');
        template.innerHTML = ` 
            <a class="nav-link border-bottom border-secondary pb-2 px-2" href = "#" >
            <div class="application d-flex flex-row justify-content-between">
                <div class="application-name">
                    ${appName}
            </div>
            </div>
        </a >`;
        return template.content.children[0];
    }

    const getLayoutHtml = (name, lastUpdated) => {
        const template = document.createElement('template');
        template.innerHTML = `
        <a class="nav-link border-bottom border-secondary pb-2 px-2" href="#">
            <div class="workspace d-flex flex-row">
                <div class="workspace-icon mr-2"></div>
                <div class="workspace-description">
                    <h5 class="mb-1">${name}</h5>
                    <div class="text-muted">Last updated: <span>10-Nov-2019</span></div>
                </div>
            </div>
        </a>`

        return template.content.children[0];
    }

    const getErrorFeedbackHtml = (message) => {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="invalid-feedback mt-0 d-block">
            ${message || "Please choose a name."}
        </div>`

        return template.content.children[0];
    }

    const hidePopup = (type) => {
        const instance = glue.agm.servers().find((i) => i.peerId === startInformation.peerId);

        return window.glue.agm.invoke("T42.Workspaces.HidePopup", { type }, instance || "best");
    }

    const updatePopupSize = () => {
        const bodyBounds = document.body.getBoundingClientRect();
        const bodySize = {
            width: bodyBounds.width,
            height: bodyBounds.height
        }

        const instance = glue.agm.servers().find((i) => i.peerId === startInformation.peerId)
        return window.glue.agm.invoke("T42.Workspaces.ResizePopup", { size: bodySize }, instance || "best");
    }

    const invokeGlueAction = async (operation, operationArguments) => {
        const instance = glue.agm.servers().find((i) => i.peerId === startInformation.peerId)
        console.log("instance", instance, operation, operationArguments);

        return (await glue.agm.invoke("T42.Workspaces.Control", { operation, operationArguments }, instance || "best")).returned;
    }

    const getApps = () => {
        return glue.appManager.applications();
    }

    const findElementById = (element, id) => {
        if (element.id === id) {
            return element;
        }
        else if (element.children) {
            return element.children.map((c) => findElementById(c, id)).find(c => c)
        }
    }

    const findElementParentById = (element, id) => {
        if (element.children && element.children.some((c) => c.id === id)) {
            return element;
        }
        else if (element.children) {
            return element.children.map((c) => findElementParentById(c, id)).find(c => c)
        }
    }

    const populateAppList = (filterText) => {
        const filterApps = (apps, filter) => {
            const check = (word) => word && word.toLowerCase().indexOf(filter) !== -1;
            return apps.filter(a => !filter || (check(a.title) || check(a.name)));
        };

        filterApps(getApps(), filterText).forEach((a) => {
            const appElement = getAppHtml(a.title || a.name);
            appElement.onclick = async () => {
                const allWorkspaces = await glue.workspaces.getAllWorkspaces();
                const currWorkspace = allWorkspaces.find(w => w.id === startInformation.workspaceId);
                const parent = currWorkspace.getParent((p => p.id === startInformation.laneId)) || currWorkspace;
                const rowColRadioButton = document.getElementById("rowColButton");

                if (rowColRadioButton && rowColRadioButton.classList.contains("active")) {
                    const containerContent = { type: "group", children: [{ type: "window", appName: a.name }] };
                    const targetParent = parent.type ? parent.getMyParent() : parent;
                    const rowArguments = { type: "column", children: [containerContent] };
                    const columnArguments = { type: "row", children: [containerContent] };

                    if (targetParent.type === "row") {
                        await targetParent.addColumn(rowArguments);
                    } else {
                        await targetParent.addRow(columnArguments);
                    }
                } else {
                    await parent.addWindow({
                        type: "window", appName: a.name
                    });
                }

                hidePopup();
            }
            appList.append(appElement);
        });
    }

    const populateWorkspacesList = async () => {
        const workspaceLayouts = (await glue.layouts.getAll("Workspace")).filter(l => l.type === "Workspace");

        workspaceLayouts.forEach((s) => {
            const workspaceLayoutElement = getLayoutHtml(s.name);

            workspaceLayoutElement.onclick = () => {
                glue.workspaces.restoreWorkspace(s.name, { frameId: startInformation.frameId }).finally(() => {
                    hidePopup();
                });
            }

            workspaceList.appendChild(workspaceLayoutElement);
        })
    }

    const showErrorFeedback = (message) => {
        const feedbackContainer = document.getElementById("feedback-container");

        feedbackContainer.appendChild(getErrorFeedbackHtml(message));

        updatePopupSize().catch((e) => console.warn(`Could not resize popup because ${JSON.stringify(e)}`));
    }

    const hideSaveWorkspaceFeedback = () => {
        const feedbackContainer = document.getElementById("feedback-container");

        Array.from(feedbackContainer.children).forEach(c => c.remove());

        updatePopupSize().catch((e) => console.warn(`Could not resize popup because ${JSON.stringify(e)}`));
    }

    window.glue = glue;
    const addApplicationView = document.getElementsByClassName("add-application")[0];
    const saveWorkspaceView = document.getElementsByClassName("save-workspace")[0];
    const openWorkspaceView = document.getElementsByClassName("add-workspace")[0];
    const appPlacementRadioButtons = document.querySelector(".add-application div.row:nth-child(2)");
    const createNewWorkspaceButton = document.getElementById("createNewWorkspaceBtn");
    const appList = document.getElementById("applicationsList");
    const workspaceList = document.getElementById("workspacesList");

    await glue.agm.registerAsync("T42.Workspaces.ShowPopup", async (args, _, success, error) => {
        switch (args.type) {
            case "addApplication":
                await handleAddApplication(args.payload);
                break;
            case "saveWorkspace":
                handleSaveWorkspace(args.payload);
                break;
            case "openWorkspace":
                await handleOpenWorkspace(args.payload);
                break;
            default:
                error("invalid args type")
                break;
        }

        const bodyBounds = document.body.getBoundingClientRect();
        const bodySize = {
            width: bodyBounds.width,
            height: bodyBounds.height
        }

        console.log("body size", bodySize);
        success(bodySize)
    })

    populateAppList();
    await populateWorkspacesList();

    const handleAddApplication = async (payload) => {
        addApplicationView.style.display = "";
        saveWorkspaceView.style.display = "none";
        openWorkspaceView.style.display = "none";

        Array.from(appList.children).forEach(i => i.remove());
        populateAppList();

        const allWorkspaces = await glue.workspaces.getAllWorkspaces();
        const currWorkspace = allWorkspaces.find(w => w.id === payload.workspaceId);

        const lane = currWorkspace.getParent((p => p.id === payload.laneId)) || currWorkspace;

        startInformation = payload;

        const rowColRadioButton = document.getElementById("rowColButton");
        const tabGroupRadioButton = document.getElementById("tabGroupButton");
        const appSearch = document.getElementById("appSearch");

        appSearch.oninput = (ev) => {
            const filterText = ev.target.value;

            Array.from(appList.children).forEach((c) => c.remove());
            populateAppList(filterText.toLowerCase());
        }

        rowColRadioButton.onclick = () => {
            tabGroupRadioButton.classList.remove("active");

            rowColRadioButton.classList.add("active");
        }

        tabGroupRadioButton.onclick = () => {
            rowColRadioButton.classList.remove("active");
            tabGroupRadioButton.classList.add("active");
        }

        let parentType = lane.type || "workspace";

        if (parentType === "group") {
            parentType = lane.getMyParent().type || "workspace";
        }

        rowColRadioButton.innerText = `This ${parentType.substring(0, 1).toUpperCase() + parentType.substring(1)}`;

        if (lane.type !== "group") {
            appPlacementRadioButtons.style.display = "none";
        } else {
            appPlacementRadioButtons.style.display = "";
        }
    }

    const handleSaveWorkspace = (payload) => {
        addApplicationView.style.display = "none";
        saveWorkspaceView.style.display = "";
        openWorkspaceView.style.display = "none";

        const saveWorkspaceButton = document.getElementById("saveWorkspaceButton");
        const saveWorkspaceName = document.getElementById("saveWorkspaceName");

        saveWorkspaceName.onclick = () => {
            hideSaveWorkspaceFeedback();
        }

        saveWorkspaceButton.onclick = async () => {
            const workspaceName = saveWorkspaceName.value;
            if (workspaceName) {
                try {
                    await invokeGlueAction("saveLayout", { name: workspaceName, workspaceId: payload.workspaceId });
                    saveWorkspaceName.value = "";

                    hidePopup();
                } catch (error) {
                    hideSaveWorkspaceFeedback();
                    showErrorFeedback(error.message);
                }
            }
        }
    }

    const handleOpenWorkspace = async (payload) => {
        addApplicationView.style.display = "none";
        saveWorkspaceView.style.display = "none";
        openWorkspaceView.style.display = "";

        startInformation = payload
        Array.from(workspaceList.children).forEach(i => i.remove());
        await populateWorkspacesList();
        createNewWorkspaceButton.onclick = () => {
            glue.workspaces.createWorkspace({
                children: [], frame: {
                    newFrame: false,
                    reuseFrameId: startInformation.frameId
                }
            }).finally(() => {
                hidePopup();
            });
        }
    }
});