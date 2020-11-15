export class TabObserver {
    private containerElement: Element;

    public init(containerElementId: string) {
        this.containerElement = $(containerElementId)[0];

        this.setupEvents();
    }

    private setupEvents() {
        const observer = new MutationObserver((records) => {
            Array.from(records).forEach((r) => {
                if (r.type === "childList" && (r.target as Element).classList.contains("lm_tabs")) {
                    const tabs = $(r.target);
                    this.handleTabCountChanged(tabs, Array.from(r.removedNodes));
                } else if (r.type === "attributes"
                    && (r.target as Element).classList.contains("lm_stack")
                    && r.attributeName === "style") {
                    const stackElement = $(r.target);
                    this.handleTabHeaderResized(stackElement);
                }
            });
        });
        observer.observe(this.containerElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style"],
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false
        });

        return () => {
            observer.disconnect();
        };
    }

    private handleTabCountChanged(tabsElement: JQuery<Node>, removedNodes: Node[]) {
        const tabChildren = tabsElement.children();
        tabsElement.css("max-width", `${tabChildren.length * 200}px`);
        const tabWidths = Array.from(tabChildren).map((t) => $(t).width());

        const proportionalWidth = tabsElement.width() / tabWidths.length;

        Array.from(tabChildren).forEach((tab) => {
            const title = $(tab).children(".lm_title");
            title.css("max-width", `${proportionalWidth * 0.75}px`);
            if (removedNodes.length) {
                this.refreshTabClasses(tab);
            }
        });
    }

    private handleTabHeaderResized(stackElement: JQuery<Node>) {
        const headerElement = stackElement.children(".lm_header");
        const tabElements = headerElement.children(".lm_tabs");

        const tabWidths = Array.from(tabElements.children()).map((t) => $(t).width());

        const proportionalWidth = tabElements.width() / tabWidths.length;
        Array.from(tabElements.children()).forEach((tab) => {
            const title = $(tab).children(".lm_title");
            title.css("max-width", `${proportionalWidth * 0.65}px`);

            this.refreshTabClasses(tab);
        });
    }

    private refreshTabClasses(tab: Node) {
        const tabOuterWidth = $(tab).outerWidth();
        const classes = (tab as Element).classList;

        if (tabOuterWidth >= 25 && tabOuterWidth < 35) {
            if (classes.contains("lm_tab_mini")) {
                classes.remove("lm_tab_mini");
            }
            classes.add("lm_tab_small");
        } else if (tabOuterWidth >= 35) {
            classes.remove("lm_tab_small");
            if (classes.contains("lm_tab_mini")) {
                classes.remove("lm_tab_mini");
            }
        } else if (tabOuterWidth < 25) {
            classes.remove("lm_tab_small");
            classes.add("lm_tab_mini");
        }
    }
}
