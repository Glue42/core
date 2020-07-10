// Type definitions for GoldenLayout v1.5.x
// Project: https://golden-layout.com/

declare module '@glue42/golden-layout' {
    class GoldenLayout implements GoldenLayout.EventEmitter {
        /**
         * The topmost item in the layout item tree. In browser terms: Think of the GoldenLayout instance as window
         * object and of goldenLayout.root as the document.
         */
        root: GoldenLayout.Root;

        /**
         * A reference to the (jQuery) DOM element containing the layout
         */
        container: JQuery;

        /**
         * True once the layout item tree has been created and the initialised event has been fired
         */
        isInitialised: boolean;

        /**
         * A reference to the current, extended top level config.
         *
         * Don't rely on this object for state saving / serialisation. Use layout.toConfig() instead.
         */
        config: GoldenLayout.Config;

        /**
         * The currently selected item or null if no item is selected. Only relevant if settings.selectionEnabled is set
         * to true.
         */
        selectedItem: GoldenLayout.ContentItem | GoldenLayout.Root;

        /**
         * The current outer width of the layout in pixels.
         */
        width: number;

        /**
         * The current outer height of the layout in pixels.
         */
        height: number;

        /**
         * An array of BrowserWindow instances
         */
        openPopouts: GoldenLayout.BrowserWindow[];

        /**
         * True if the layout has been opened as a popout by another layout.
         */
        isSubWindow: boolean;

        /**
         * A singleton instance of EventEmitter that works across windows
         */
        eventHub: GoldenLayout.EventEmitter;

        /**
         * @param config A GoldenLayout configuration object
         * @param container The DOM element the layout will be initialised in. Default: document.body
         */
        constructor(configuration: GoldenLayout.Config, container?: Element | HTMLElement | JQuery);

        /*
         * @param name 	The name of the component, as referred to by componentName in the component configuration.
         * @param component 	A constructor or factory function. Will be invoked with new and two arguments, a
         *                      containerobject and a component state
         */
        registerComponent(name: String, component: any): void;

        /**
         * Renders the layout into the container. If init() is called before the document is ready it attaches itself as
         * a listener to the document and executes once it becomes ready.
         */
        init(): void;

        /**
         * Returns the current state of the layout and its components as a serialisable object.
         */
        toConfig(): any;

        /**
         * Returns a component that was previously registered with layout.registerComponent().
         * @param name The name of a previously registered component
         */
        getComponent(name: string): any;

        /**
         * Resizes the layout. If no arguments are provided GoldenLayout measures its container and resizes accordingly.
         * @param width The outer width the layout should be resized to. Default: The container elements width
         * @param height The outer height the layout should be resized to. Default: The container elements height
         */
        updateSize(width?: number, height?: number): void;

        /**
         * Destroys the layout. Recursively calls destroy on all components and content items, removes all event
         * listeners and finally removes itself from the DOM.
         */
        destroy(): void;

        /**
         * Creates a new content item or tree of content items from configuration. Usually you wouldn't call this
         * directly, but instead use methods like layout.createDragSource(), item.addChild() or item.replaceChild() that
         * all call this method implicitly.
         * @param itemConfiguration An item configuration (can be an entire tree of items)
         * @param parent A parent item
         */
        createContentItem(itemConfiguration?: GoldenLayout.ItemConfigType, parent?: GoldenLayout.ContentItem): void;

        /**
         * Creates a new popout window with configOrContentItem as contents at the position specified in dimensions
         * @param configOrContentItem   The content item or config that will be created in the new window. If a item is
         *                              provided its config will be read, if config is provided, only the content key
         *                              will be used
         * @param dimensions    A map containing the keys left, top, width and height. Left and top can be negative to
         *                      place the window in another screen.
         * @param parentId  The id of the item within the current layout the child window's content will be appended to
         *                  when popIn is clicked
         * @param indexInParent The index at which the child window's contents will be appended to. Default: null
         */
        createPopout(configOrContentItem: GoldenLayout.ItemConfigType | GoldenLayout.ContentItem,
            dimensions: {
                width: number,
                height: number,
                left: number,
                top: number
            }, parentId?: string,
            indexInParent?: number): void;

        /**
         * Turns a DOM element into a dragSource, meaning that the user can drag the element directly onto the layout
         * where it turns into a contentItem.
         * @param element The DOM element that will be turned into a dragSource
         * @param itemConfiguration An item configuration (can be an entire tree of items)
         */
        createDragSource(element: HTMLElement | JQuery, itemConfiguration: GoldenLayout.ItemConfigType): void;

        /**
         * If settings.selectionEnabled is set to true, this allows to select items programmatically.
         * @param contentItem A ContentItem instance
         */
        selectItem(contentItem: GoldenLayout.ContentItem): void;

        /**
         * Static method on the GoldenLayout constructor! This method will iterate through a GoldenLayout config object
         * and replace frequent keys and values with single letter substitutes.
         * @param config A GoldenLayout configuration object
         */
        static minifyConfig(config: any): any;

        /**
         * Static method on the GoldenLayout constructor! This method will reverse the minifications of GoldenLayout.minifyConfig.
         * @param minifiedConfig A minified GoldenLayout configuration object
         */
        static unminifyConfig(minifiedConfig: any): any;

        /**
         * Subscribe to an event
         * @param eventName The name of the event to describe to
         * @param callback The function that should be invoked when the event occurs
         * @param context The value of the this pointer in the callback function
         */
        on(eventName: string, callback: Function, context?: any): void;

        /**
         * Notify listeners of an event and pass arguments along
         * @param eventName The name of the event to emit
         */
        emit(eventName: string, arg1?: any, arg2?: any, ...argN: any[]): void;

        /**
         * Alias for emit
         */
        trigger(eventName: string, arg1?: any, arg2?: any, ...argN: any[]): void;

        /**
         * Unsubscribes either all listeners if just an eventName is provided, just a specific callback if invoked with
         * eventName and callback or just a specific callback with a specific context if invoked with all three
         * arguments.
         * @param eventName The name of the event to unsubscribe from
         * @param callback The function that should be invoked when the event occurs
         * @param context The value of the this pointer in the callback function
         */
        unbind(eventName: string, callback?: Function, context?: any): void;

        /**
         * Alias for unbind
         */
        off(eventName: string, callback?: Function, context?: any): void;
    }

    namespace GoldenLayout {

        export type ItemConfigType = ItemConfig | ComponentConfig | ReactComponentConfig;

        export interface Settings {
            /**
             * Turns headers on or off. If false, the layout will be displayed with splitters only.
             * Default: true
             */
            hasHeaders?: boolean;

            /**
             * Constrains the area in which items can be dragged to the layout's container. Will be set to false
             * automatically when layout.createDragSource() is called.
             * Default: true
             */
            constrainDragToContainer?: boolean;

            /**
             * If true, the user can re-arrange the layout by dragging items by their tabs to the desired location.
             * Default: true
             */
            reorderEnabled?: boolean;

            /**
             * If true, the user can select items by clicking on their header. This sets the value of layout.selectedItem to
             * the clicked item, highlights its header and the layout emits a 'selectionChanged' event.
             * Default: false
             */
            selectionEnabled?: boolean;

            /**
             * Decides what will be opened in a new window if the user clicks the popout icon. If true the entire stack will
             * be transferred to the new window, if false only the active component will be opened.
             * Default: false
             */
            popoutWholeStack?: boolean;

            /**
             * Specifies if an error is thrown when a popout is blocked by the browser (e.g. by opening it programmatically).
             * If false, the popout call will fail silently.
             * Default: true
             */
            blockedPopoutsThrowError?: boolean;

            /**
             * Specifies if all popouts should be closed when the page that created them is closed. Popouts don't have a
             * strong dependency on their parent and can exist on their own, but can be quite annoying to close by hand. In
             * addition, any changes made to popouts won't be stored after the parent is closed.
             * Default: true
             */
            closePopoutsOnUnload?: boolean;

            /**
             * Specifies if the popout icon should be displayed in the header-bar.
             * Default: true
             */
            showPopoutIcon?: boolean;

            /**
             * Specifies if the minimize icon should be displayed in the header-bar.
             * Default: true
             */
            showMinimizeIcon?: boolean;

            /**
             * Specifies if the maximise icon should be displayed in the header-bar.
             * Default: true
             */
            showMaximizeIcon?: boolean;

            /**
             * Specifies if the close icon should be displayed in the header-bar.
             * Default: true
             */
            showCloseIcon?: boolean;

            /**
             *  Disables the drag proxy element which is created onDrag
             */
            disableDragProxy?: boolean;

            /**
             *  workspace - mode in which golden layout behaves like a container for 
             *  other golden layouts (only one stack with tabs, no drag and drop just reorder, different buttons, etc)
             *  workspaceContent - used for the content of a golden layout in workspace mode
             *  default mode - behaves like workspaceContent 
             */
            mode: "workspace" | "default" | "workspaceContent";
        }

        export interface Dimensions {
            /**
             * The width of the borders between the layout items in pixel. Please note: The actual draggable area is wider
             * than the visible one, making it safe to set this to small values without affecting usability.
             * Default: 5
             */
            borderWidth?: number;

            /**
             * The minimum height an item can be resized to (in pixel).
             * Default: 10
             */
            minItemHeight?: number;

            /**
             * The minimum width an item can be resized to (in pixel).
             * Default: 10
             */
            minItemWidth?: number;

            /**
             * The height of the header elements in pixel. This can be changed, but your theme's header css needs to be
             * adjusted accordingly.
             * Default: 20
             */
            headerHeight?: number;

            /**
             * The width of the element that appears when an item is dragged (in pixel).
             * Default: 300
             */
            dragProxyWidth?: number;

            /**
             * The height of the element that appears when an item is dragged (in pixel).
             * Default: 200
             */
            dragProxyHeight?: number;
        }

        export interface Labels {
            /**
             * The tooltip text that appears when hovering over the close icon.
             * Default: 'close'
             */
            close?: string;

            /**
             * The tooltip text that appears when hovering over the maximise icon.
             * Default: 'maximise'
             */
            maximize?: string;

            /**
             * The tooltip text that appears when hovering over the minimise icon.
             * Default: 'minimise'
             */
            minimize?: string;

            /**
             * The tooltip text that appears when hovering over the popout icon.
             * Default: 'open in new window'
             */
            popout?: string;
        }

        interface WorkspacesConfig {
            /**
             * Indicates that the element is created just for wrapping purposes and should not be exposed to the Workspaces API
             */
            wrapper?: boolean;
        }

        interface BaseItemConfig {
            /**
            * The width of this item, relative to the other children of its parent in percent
            */
            width?: number;

            /**
             * The height of this item, relative to the other children of its parent in percent
             */
            height?: number;

            /**
             * A String or an Array of Strings. Used to retrieve the item using item.getItemsById()
             */
            id?: string | string[];

            /**
             * Determines if the item is closable. If false, the x on the items tab will be hidden and container.close()
             * will return false
             * Default: true
             */
            isClosable?: boolean;

            /**
             * Workspaces API specific configuration
             */
            workspacesConfig: WorkspacesConfig;
        }

        export interface RowConfig extends BaseItemConfig {
            /**
            * The type of the item. Possible values are 'row', 'column', 'stack', 'component' and 'react-component'.
            */
            type: "row";

            /**
             * An array of configurations for items that will be created as children of this item.
             */
            content: ItemConfig[];
        }

        export interface ColumnConfig extends BaseItemConfig {
            /**
            * The type of the item. Possible values are 'row', 'column', 'stack', 'component' and 'react-component'.
            */
            type: "column";

            /**
             * An array of configurations for items that will be created as children of this item.
             */
            content: ItemConfig[];
        }

        export interface StackConfig extends BaseItemConfig {
            /**
            * The type of the item. Possible values are 'row', 'column', 'stack', 'component' and 'react-component'.
            */
            type: "stack";

            /**
             * An array of configurations for items that will be created as children of this item.
             */
            content: ItemConfig[];
        }

        export type ItemConfig = RowConfig | ColumnConfig | StackConfig | ComponentConfig;

        export interface ComponentConfig extends BaseItemConfig {
            type: "component";

            /**
             * The title which appears in the tab item
             */
            title?: string;

            /**
             * The name of the component as specified in layout.registerComponent. Mandatory if type is 'component'.
             */
            componentName: string;

            /**
             * A serialisable object. Will be passed to the component constructor function and will be the value returned by
             * container.getState().
             */
            componentState?: any;

            /**
             * The id of the window which resides in a golden layout tab
             */
            windowId?: string;
        }

        export interface ReactComponentConfig extends BaseItemConfig {
            /**
             * The name of the component as specified in layout.registerComponent. Mandatory if type is 'react-component'
             */
            component: string;

            /**
             * Properties that will be passed to the component and accessible using this.props.
             */
            props?: any;
        }

        export interface WorkspacesOptions {
            /**
             * Context accessible from every app in the workspace
             */
            context?: { [k: string]: any };

            /**
             * The name of the workspace
             */
            name?: string;
        }

        export interface Config {
            /**
             * Unique identifier
             */
            id?: string | string[];

            /**
             * Settings affecting the behaviour of Golden layout
             */
            settings?: Settings;

            /**
             * Options affecting the dimensions of some elements (e.g splitters)
             */
            dimensions?: Dimensions;

            type?: "workspace";

            /**
             * Configuration for the labels
             */
            labels?: Labels;
            content?: ItemConfig[];

            /**
             * Workspaces related configuration
             */
            workspacesOptions?: WorkspacesOptions;
        }

        export interface BaseContentItem extends EventEmitter {
            /**
             * True if the item had been initialised
             */
            isInitialised: boolean;

            /**
             * True if the item is maximised
             */

            isMaximized: boolean;
            /**
              * A String or array of identifiers if provided in the configuration
              */
            id: string | string[];

            /**
            * The item's inner element. Can be the same as the outer element.
            */
            childElementContainer: Container;

            /**
              * A reference to the layoutManager that controls this item
              */
            layoutManager: GoldenLayout;

            /**
             * Adds an item as a child to this item. If the item is already a part of a layout it will be removed
             * from its original position before adding it to this item.
             * @param itemOrItemConfig A content item (or tree of content items) or an ItemConfiguration to create the item from
             * @param index last index  An optional index that determines at which position the new item should be added. Default: last index.
             */
            addChild(itemOrItemConfig: ContentItem | ItemConfigType, index?: number): void;

            /**
             * Destroys the item and all it's children
             * @param contentItem The contentItem that should be removed
             * @param keepChild If true the item won't be destroyed. (Use cautiosly, if the item isn't destroyed it's up to you to destroy it later). Default: false.
             */
            removeChild(contentItem: Config, keepChild?: boolean): void;

            /**
             * The contentItem that should be removed
             * @param oldChild    ContentItem The contentItem that should be removed
             * @param newChild A content item (or tree of content items) or an ItemConfiguration to create the item from
             */
            replaceChild(oldChild: ContentItem, newChild: ContentItem | ItemConfigType): void;

            /**
             * Updates the items size. To actually assign a new size from within a component, use container.setSize( width, height )
             */
            setSize(): void;

            /**
             * Sets the item's title to the provided value. Triggers titleChanged and stateChanged events
             * @param title the new title
             */
            setTitle(title: string): void;

            /**
             * A powerful, yet admittedly confusing method to recursively call methods on items in a tree. Usually you wouldn't need
             * to use it directly, but it's used internally to setSizes, destroy parts of the item tree etc.
             * @param functionName The name of the method to invoke
             * @param functionArguments An array of arguments to pass to every function
             * @param bottomUp If true, the method is invoked on the lowest parts of the tree first and then bubbles upwards. Default: false
             * @param skipSelf If true, the method will only be invoked on the item's children, but not on the item itself. Default: false
             */
            callDownwards(functionName: string, functionArguments?: any[], bottomUp?: boolean, skipSelf?: boolean): void;

            /**
             * Emits an event that bubbles up the item tree until it reaches the root element (and after a delay the layout manager). Useful e.g. for indicating state changes.
             */
            emitBubblingEvent(name: string): void;

            /**
             * Convenience method for item.parent.removeChild( item )
             */
            remove(): void;

            /**
             * Removes the item from its current position in the layout and opens it in a window
             */
            popout(): BrowserWindow;

            /**
             * Maximises the item or minimises it if it's already maximised
             */
            toggleMaximise(): void;

            /**
             * Selects the item. Only relevant if settings.selectionEnabled is set to true
             */
            select(): void;

            /**
             * Unselects the item. Only relevant if settings.selectionEnabled is set to true
             */
            deselect(): void;

            /**
             * Returns true if the item has the specified id or false if not
             * @param id An id to check for
             */
            hasId(id: string): boolean;

            /**
             * Only Stacks have this method! It's the programmatical equivalent of clicking a tab.
             * @param contentItem The new active content item
             */
            setActiveContentItem(contentItem: ContentItem): void;

            /**
             * Only Stacks have this method! Returns the currently selected contentItem.
             */
            getActiveContentItem(): ContentItem;

            /**
             * Adds an id to an item or does nothing if the id is already present
             * @param id The id to be added
             */
            addId(id: string): void;

            /**
             * Removes an id from an item or throws an error if the id couldn't be found
             * @param id The id to be removed
             */
            removeId(id: string): void;

            /**
             * Calls filterFunction recursively for every item in the tree. If the function returns true the item is added to the resulting array
             * @param filterFunction A function that determines whether an item matches certain criteria
             */
            getItemsByFilter(filterFunction: (contentItem: ContentItem) => boolean): ContentItem[];

            /**
             * Returns all items with the specified id.
             * @param id An id specified in the itemConfig
             */
            getItemsById(id: string | string[]): ContentItem[];

            /**
             * Returns all items with the specified type
             * @param type 'row', 'column', 'stack', 'component' or 'root'
             */
            getItemsByType(type: string): ContentItem[];

            /**
             * Returns all instances of the component with the specified componentName
             * @param componentName a componentName as specified in the itemConfig
             */
            getComponentsByName(componentName: string): any;
        }

        export interface Stack extends BaseContentItem {
            /**
             * This items configuration in its current state
             */
            config: ItemConfig;

            /**
             * The type of the item
             */
            type: "stack";

            /**
             * An array of items that are children of this item
             */
            contentItems: ContentItem[];

            /**
             * The item that is this item's parent
             */
            parent: Stack | Row | Column | Root;

            /**
             * True if the item is the layout's root item
             */
            isRoot: false;

            /**
             * True if the item is a row
             */
            isRow: false;

            /**
             * True if the item is a column
             */
            isColumn: false;

            /**
             * True if the item is a stack
             */
            isStack: true;

            /**
             * True if the item is a component
             */
            isComponent: false;

            /**
             * The item's outer element
             */
            element: Container;

            /**
             * The stack header object from which all header related operations can be executed
             */
            header: Header;
        }

        export interface Row extends BaseContentItem {
            /**
             * This items configuration in its current state
             */
            config: ItemConfig;

            /**
             * The type of the item
             */
            type: "row";

            /**
             * An array of items that are children of this item
             */
            contentItems: ContentItem[];

            /**
             * The item that is this item's parent
             */
            parent: Stack | Row | Column | Root;

            /**
             * True if the item is the layout's root item
             */
            isRoot: false;

            /**
             * True if the item is a row
             */
            isRow: true;

            /**
             * True if the item is a column
             */
            isColumn: false;

            /**
             * True if the item is a stack
             */
            isStack: false;

            /**
             * True if the item is a component
             */
            isComponent: false;

            /**
             * The item's outer element
             */
            element: Container;
        }

        export interface Column extends BaseContentItem {
            /**
             * This items configuration in its current state
             */
            config: ItemConfig;

            /**
             * The type of the item
             */
            type: "column";

            /**
             * An array of items that are children of this item
             */
            contentItems: ContentItem[];

            /**
             * The item that is this item's parent
             */
            parent: Stack | Row | Column | Root;

            /**
             * True if the item is the layout's root item
             */
            isRoot: false;

            /**
             * True if the item is a row
             */
            isRow: false;

            /**
             * True if the item is a column
             */
            isColumn: true;

            /**
             * True if the item is a stack
             */
            isStack: false;

            /**
             * True if the item is a component
             */
            isComponent: false;

            /**
             * The item's outer element
             */
            element: Container;
        }

        export interface Component extends BaseContentItem {
            /**
             * This items configuration in its current state
             */
            config: ComponentConfig;

            /**
             * The type of the item
             */
            type: "component";

            /**
             * The item that is this item's parent
             */
            parent: Stack;

            /**
             * True if the item is the layout's root item
             */
            isRoot: false;

            /**
             * True if the item is a row
             */
            isRow: false;

            /**
             * True if the item is a column
             */
            isColumn: false;

            /**
             * True if the item is a stack
             */
            isStack: false;

            /**
             * True if the item is a component
             */
            isComponent: true;

            /**
             * The item's outer element
             */
            element: Container;

            /**
             * The tab object related to the item
             */
            tab: Tab;
        }

        export interface Root extends BaseContentItem {
            /**
            * This items configuration in its current state
            */
            config: ItemConfig;

            /**
             * The type of the item
             */
            type: "root";

            /**
             * An array of items that are children of this item
             */
            contentItems: ContentItem[];

            /**
             * The item that is this item's parent
             */
            parent: null;

            /**
             * True if the item is the layout's root item
             */
            isRoot: true;

            /**
             * True if the item is a row
             */
            isRow: false;

            /**
             * True if the item is a column
             */
            isColumn: false;

            /**
             * True if the item is a stack
             */
            isStack: false;

            /**
             * True if the item is a component
             */
            isComponent: false;

            /**
             * The item's outer element
             */
            element: Container;
        }

        export type ContentItem = Stack | Row | Column | Component;

        export interface Container extends EventEmitter {
            /**
             * The current width of the container in pixel
             */
            width: number;

            /**
             * The current height of the container in pixel
             */
            height: number;

            /**
             * A reference to the component-item that controls this container
             */
            parent: ContentItem;

            /**
             * A reference to the tab that controls this container. Will initially be null
             * (and populated once a tab event has been fired).
             */
            tab: Tab;

            /**
             * The current title of the container
             */
            title: string;

            /*
             * A reference to the GoldenLayout instance this container belongs to
             */
            layoutManager: GoldenLayout;

            /**
             * True if the item is currently hidden
             */
            isHidden: boolean;

            /**
             * Overwrites the components state with the provided value. To only change parts of the componentState see
             * extendState below. This is the main mechanism for saving the state of a component. This state will be the
             * value of componentState when layout.toConfig() is called and will be passed back to the component's
             * constructor function. It will also be used when the component is opened in a new window.
             * @param state A serialisable object
             */
            setState(state: any): void;

            /**
             * This is similar to setState, but merges the provided state into the current one, rather than overwriting it.
             * @param state A serialisable object
             */
            extendState(state: any): void;

            /**
             * Returns the current state.
             */
            getState(): any;

            /**
             * Returns the container's inner element as a jQuery element
             */
            getElement(): JQuery;

            /**
             * hides the container or returns false if hiding it is not possible
             */
            hide(): boolean;

            /**
             * shows the container or returns false if showing it is not possible
             */
            show(): boolean;

            /**
             * Sets the container to the specified size or returns false if that's not possible
             * @param width the new width in pixel
             * @param height the new height in pixel
             */
            setSize(width: number, height: number): boolean;

            /**
             * Sets the item's title to the provided value. Triggers titleChanged and stateChanged events
             * @param title the new title
             */
            setTitle(title: string): void;

            /**
             * Closes the container or returns false if that is not possible
             */
            close(): boolean;
        }

        export interface BrowserWindow {

            /**
             * True if the window has been opened and its GoldenLayout instance initialised.
             */
            isInitialised: boolean;

            /**
             * Creates a window configuration object from the Popout.
             */
            toConfig(): {
                dimensions: {
                    width: number,
                    height: number,
                    left: number,
                    top: number
                },
                content: Config,
                parentId: string,
                indexInParent: number
            };

            /**
             * Returns the GoldenLayout instance from the child window
             */
            getGlInstance(): GoldenLayout;

            /**
             * Returns the native Window object
             */
            getWindow(): Window;

            /**
             * Closes the popout
             */
            close(): void;

            /**
             * Returns the popout to its original position as specified in parentId and indexInParent
             */
            popIn(): void;
        }

        export interface Header {
            /**
             * A reference to the LayoutManager instance
             */
            layoutManager: GoldenLayout;

            /**
             * A reference to the Stack this Header belongs to
             */
            parent: ContentItem;

            /**
             * An array of the Tabs within this header
             */
            tabs: Tab[];

            /**
             * The currently selected activeContentItem
             */
            activeContentItem: ContentItem;

            /**
             * The outer (jQuery) DOM element of this Header
             */
            element: JQuery;

            /**
             * The (jQuery) DOM element containing the tabs
             */
            tabsContainer: JQuery;

            /**
             * The (jQuery) DOM element containing the close, maximise and popout button
             */
            controlsContainer: JQuery;

            /**
             * The (jQuery) DOM element containing open workspace button
             */
            workspaceControlsContainer: JQuery;

            /**
             * Hides the currently selected contentItem, shows the specified one and highlights its tab.
             * @param contentItem The content item that will be selected
             */
            setActiveContentItem(contentItem: ContentItem): void;

            /**
             * Creates a new tab and associates it with a content item
             * @param contentItem The content item the tab will be associated with
             * @param index A zero based index, specifying the position of the new tab
             */
            createTab(contentItem: ContentItem, index?: number): void;

            /**
             * Finds a tab by its contentItem and removes it
             * @param contentItem The content item the tab is associated with
             */
            removeTab(contentItem: ContentItem): void;

            /**
             * Moves or removes the header
             *  @param if true the positions will default to "top", if false the header won't be visible
             */
            position(position: boolean | "top" | "bottom" | "left" | "right"): void;
        }

        export interface Tab {

            /**
             * True if this tab is the selected tab
             */
            isActive: boolean;

            /**
             * A reference to the header this tab is a child of
             */
            header: Header;

            /**
             * A reference to the content item this tab relates to
             */
            contentItem: ContentItem;

            /**
             * The tabs outer (jQuery) DOM element
             */
            element: JQuery;

            /**
             * The (jQuery) DOM element containing the title
             */
            titleElement: JQuery;

            /**
             * The (jQuery) DOM element that closes the tab
             */
            closeElement: JQuery;

            /**
             * Sets the tab's title. Does not affect the contentItem's title!
             * @param title The new title
             */
            setTitle(title: string): void;

            /**
             * Sets this tab's active state. To programmatically switch tabs, use header.setActiveContentItem( item ) instead.
             * @param isActive Whether the tab is active
             */
            setActive(isActive: boolean): void;

            /**
             * Event listener for all drag related events
             */
            _dragListener: EventEmitter;

            /**
             * Function which is called on tab close button click. Similar to the document .onclick function
             */
            onCloseClick: () => void;
        }

        export interface EventEmitter {
            /**
             * Subscribe to an event
             * @param eventName The name of the event to describe to
             * @param callback The function that should be invoked when the event occurs
             * @param context The value of the this pointer in the callback function
             */
            on(eventName: string, callback: Function, context?: any): void;

            /**
             * Notify listeners of an event and pass arguments along
             * @param eventName The name of the event to emit
             */
            emit(eventName: string, arg1?: any, arg2?: any, ...argN: any[]): void;

            /**
             * Alias for emit
             */
            trigger(eventName: string, arg1?: any, arg2?: any, ...argN: any[]): void;

            /**
             * Unsubscribes either all listeners if just an eventName is provided, just a specific callback if invoked with
             * eventName and callback or just a specific callback with a specific context if invoked with all three
             * arguments.
             * @param eventName The name of the event to unsubscribe from
             * @param callback The function that should be invoked when the event occurs
             * @param context The value of the this pointer in the callback function
             */
            unbind(eventName: string, callback?: Function, context?: any): void;

            /**
             * Alias for unbind
             */
            off(eventName: string, callback?: Function, context?: any): void;
        }
    }

    export = GoldenLayout;
}
