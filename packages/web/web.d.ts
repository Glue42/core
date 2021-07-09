/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { UnsubscribeFunction } from "callback-registry";
import { Glue42Core } from "@glue42/core";
import { Glue42 } from "@glue42/desktop";
import { Glue42Workspaces } from "@glue42/workspaces-api";

/**
 * Factory function that creates a new glue instance.
 * If your application is running in Glue42 Enterprise this will return a Glue42.Glue API, which is a super-set of the Glue42Web API.
 */
export type Glue42WebFactoryFunction = (config?: Glue42Web.Config) => Promise<Glue42Web.API | Glue42.Glue>;
declare const GlueWebFactory: Glue42WebFactoryFunction;
export default GlueWebFactory;

/**
 * @docmenuorder 1
 * @docname Glue42 Web
 * @intro
 * Glue42 Web allows JavasScript applications to integrate with other applications that are part of the same **Glue42 Core** project via a set of APIs. With Glue42 Web you can share data with other applications, expose functionality, manage windows and notifications.
 *
 * ## Referencing
 *
 * Glue42 Web is available both as a single JavaScript file, which you can include in your web applications using a `<script>` tag, and as a Node.js module:
 *
 * ```html
 * <script type="text/javascript" src="web.umd.js"></script>
 * ```
 *
 * Or:
 *
 * ``` javascript
 * import GlueWeb from "&commat;glue42/web";
 * ```
 *
 * When deploying your application in production, it is recommended to always reference a specific minified version:
 *
 * ```html
 * <script type="text/javascript" src="web.umd.min.js"></script>
 * ```
 *
 * ## Initialization
 *
 * Glue42 Web attaches a factory function to the global `window` object at runtime - `GlueWeb()`. It can be invoked with an optional configuration object to initialize the library and connect to the **Glue42 Core** environment. The factory function resolves with the `glue` API object:
 *
 * ```javascript
 * const initializeGlue42 = async () => {
 *
 *     // Initializing the Workspaces library.
 *     const initOptions = {
 *         libraries: [GlueWorkspaces]
 *     };
 *
 *     // Use the object returned from the factory function
 *     // to access the Glue42 APIs.
 *     const glue = await GlueWeb(initOptions);
 *
 *     // Here Glue42 Web is initialized and you can access all Glue42 APIs.
 * };
 *
 * initializeGlue42().catch(console.error);
 * ```
 */
export namespace Glue42Web {

    export import Interop = Glue42Core.Interop;
    export import Contexts = Glue42Core.Contexts;
    export import Logger = Glue42Core.Logger;

    /**
     * @docmenuorder 2
     */
    export interface Config {
        /**
         * Configure the system logger. Used mostly for during development.
         */
        systemLogger?: SystemLogger;

        /**
         * Connect with GW in memory.
         * Used for testing in node environment, where the GW isn't started by &commat;glue42/worker-web and an inproc GW is used instead.
         * @ignore
         */
        inproc?: Glue42Core.InprocGWSettings;

        /**
         * Configure the system logger. Used mostly for during development.
         */
        notifications?: Notifications.Settings;

        /**
         * A list of glue libraries which will be initiated internally and provide access to specific functionalities
         */
        libraries?: Array<(glue: Glue42Web.API, config?: Glue42Web.Config | Glue42.Config) => Promise<void>>;
    }

    /**
     * @docmenuorder 3
     */
    export interface SystemLogger {
        level?: Glue42Core.LogLevel;
        callback?: (logInfo: any) => void;
    }

    /**
     * @docmenuorder 4
     */
    export interface API extends Glue42Core.GlueCore {
        windows: Glue42Web.Windows.API;
        /**
         * @ignore
         */
        layouts: Glue42Web.Layouts.API;
        notifications: Glue42Web.Notifications.API;
        channels: Glue42Web.Channels.API;
        appManager: Glue42Web.AppManager.API;
        intents: Glue42Web.Intents.API;
        workspaces?: Glue42Workspaces.API;
    }

    /**
     * @docmenuorder 5
     * @intro
     *
     * Using the Window Management API, your application can easily open and manipulate browser windows.
     * This allows you to transform your traditional single-window web app into a multi-window native-like web application.
     * The Window Management API enables applications to:
     *
     * - open multiple windows;
     * - manipulate the position and size of opened windows;
     * - pass context data upon opening new windows;
     * - listen for and handle events related to opening and closing windows;
     *
     * The Window Management API is accessible through the `glue.windows` object.
     */
    export namespace Windows {
        export interface API {
            list(): WebWindow[];

            /** Returns the current window. */
            my(): WebWindow;

            /**
             * Finds a window by ID.
             * @param id Window ID.
             */
            findById(id: string): WebWindow | undefined;

            /**
             * Opens a new Glue42 Web Window.
             * @param name The name for the window
             * @param url The window URL.
             * @param options Options for creating a window.
             */
            open(name: string, url: string, options?: Settings): Promise<WebWindow>;

            /**
             * Notifies when a new window is opened.
             * @param callback Callback function to handle the event. Receives the added window as a parameter. Returns an unsubscribe function.
             */
            onWindowAdded(callback: (window: WebWindow) => void): UnsubscribeFunction;

            /**
             * Notifies when a window is closed. For backwards compatibility, you can also use `windowRemoved`.
             * @param callback Callback function to handle the event. Receives the removed window as a parameter. Returns an unsubscribe function.
             */
            onWindowRemoved(callback: (window: WebWindow) => void): UnsubscribeFunction;
        }

        export interface WebWindow {
            id: string;

            name: string;

            /**
             * Gets the current URL of the window.
             */
            getURL(): Promise<string>;

            /**
             * Sets new location and size for the window. The accepted settings are absolute.
             * @param dimension The object containing the desired absolute size and location.
             */
            moveResize(dimension: Partial<Bounds>): Promise<WebWindow>;

            /**
             * Sets a new size of the window. The accepted settings are relative.
             * @param width Relative width of the window.
             * @param height Relative height of the window.
             */
            resizeTo(width?: number, height?: number): Promise<WebWindow>;

            /**
             * Sets a new location of the window. The accepted settings are relative.
             * @param top Relative distance top coordinates.
             * @param left Relative distance left coordinates.
             */
            moveTo(top?: number, left?: number): Promise<WebWindow>;

            /**
             * Attempts to activate and bring to foreground the window. It is possible to fail due to client browser settings.
             */
            focus(): Promise<WebWindow>;

            /**
             * Closes the window
             * @default 0
             */
            close(): Promise<WebWindow>;

            /**
             * Returns the title of the window.
             * @default 0
             */
            getTitle(): Promise<string>;

            /**
             * Sets a new title for the window
             * @param title The new title value.
             */
            setTitle(title: string): Promise<WebWindow>;

            /**
             * Returns the current location and size of the window.
             */
            getBounds(): Promise<Bounds>;

            /**
             * Gets the current context object of the window.
             */
            getContext(): Promise<any>;

            /**
             * Updates the context object of the window
             * @param context The new context object for the window.
             */
            updateContext(context: any): Promise<WebWindow>;

            /**
             * Sets new context for the window.
             * @param context The new context object for the window.
             */
            setContext(context: any): Promise<WebWindow>;

            /**
             * Notifies when a change to the window's context has been made.
             * @param callback The function which will be invoked when a change to the window's context happens. The function will be called with the new context and window as arguments.
             */
            onContextUpdated(callback: (context: any, window: WebWindow) => void): UnsubscribeFunction;
        }
        export interface Settings {

            /**
             * Distance of the top left window corner from the top edge of the screen.
             * @default 0
             */
            top?: number;

            /**
             * Distance of the top left window corner from the left edge of the screen.
             * @default 0
             */
            left?: number;

            /**
             * Window width.
             * @default 400
             */
            width?: number;

            /**
             * Window height.
             * @default 400
             */
            height?: number;

            /**
             * The initial window context. Accessible from {@link WebWindow#getContext}
             */
            context?: any;

            /**
             * The ID of the window that will be used to relatively position the new window.
             * Can be combined with `relativeDirection`.
             */
            relativeTo?: string;

            /**
             * Direction (`"bottom"`, `"top"`, `"left"`, `"right"`) of positioning the window relatively to the `relativeTo` window. Considered only if `relativeTo` is supplied.
             * @default "right"
             */
            relativeDirection?: RelativeDirection;
        }

        export type RelativeDirection = "top" | "left" | "right" | "bottom";

        export interface Bounds {
            top: number;
            left: number;
            width: number;
            height: number;
        }
    }

    /**
     * @docmenuorder 6
     * @ignore
     */
    namespace Layouts {

        /**
         * Supported layout types are Global and Activity.
         * Global Layout saves all running applications and their state. By default, ignores hidden windows.
         * Activity Layout saves applications running in an activity, the activity state and the individual windows states.
         * By default, saves the activity of the current application but can be configured to save any activity.
         * Activity layouts can be restored as new activity instances or joined to any running activity.
         *
         * @docmenuorder 11
         *
         */
        export type LayoutType = "Global" | "Activity" | "ApplicationDefault" | "Swimlane" | "Workspace";

        /**
         * Controls the import behavior. If `replace` (default), all existing layouts will be removed.
         * If `merge`, the layouts will be added to the existing ones.
         *
         * @docmenuorder 12
         *
         */
        export type ImportMode = "replace" | "merge";

        /**
         * Layouts API.
         *
         * @docmenuorder 1
         */
        export interface API {

            /**
             * Fetches a saved layout or returns undefined if a layout with the provided name and type does not exist.
             * @param type Type of the layout to fetch.
             * @param name Name of the layout to fetch.
             */
            get(name: string, type: LayoutType): Promise<Layout | undefined>;

            /**
             * Returns a lightweight, summarized version of all layouts of the provided type.
             * @param type Type of the layouts to fetch.
             */
            getAll(type: LayoutType): Promise<LayoutSummary[]>;

            /**
             * Returns all layouts from the provided type.
             * @param type Type of the layouts to export.
             */
            export(layoutType?: LayoutType): Promise<Layout[]>;

            /**
             * Stores a full layout.
             * @param layout The layout object to be stored.
             */
            import(layouts: Layout[], mode?: "replace" | "merge"): Promise<void>;

            /**
             * Saves a new layout.
             * @param layout Options for saving a layout.
             */
            save(layout: NewLayoutOptions): Promise<Layout>;

            /**
             * Restores a layout.
             * @param options Options for restoring a layout.
             */
            restore(options: RestoreOptions): Promise<void>;

            /**
             * Removes a layout
             * @param type Type of the layout to remove.
             * @param name Name of the layout to remove.
             */
            remove(type: LayoutType, name: string): Promise<void>;

            /**
             * Notifies when a layout is added.
             * @param callback Callback function to handle the event. Receives the layout as a parameter and returns an unsubscribe function.
             */
            onAdded(callback: (layout: Layout) => void): () => void;

            /**
             * Notifies when a layout is changed.
             * @param callback Callback function to handle the event. Receives the layout as a parameter and returns an unsubscribe function.
             */
            onChanged(callback: (layout: Layout) => void): () => void;

            /**
             * Notifies when a layout is removed.
             * @param callback Callback function to handle the event. Receives the layout as a parameter and returns an unsubscribe function.
             */
            onRemoved(callback: (layout: Layout) => void): () => void;
        }

        /**
         * Describes a layout and its state.
         *
         * @docmenuorder 2
         *
         */
        export interface Layout {
            /** Name of the layout. The name is unique per layout type. */
            name: string;

            /** Type of the layout. */
            type: LayoutType;

            /** Array of component objects describing the applications that are saved in the layout. */
            components: Array<WindowComponent | Glue42Workspaces.WorkspaceComponent>;

            /** Context object passed when the layout was saved. */
            context?: any;

            /** Metadata passed when the layout was saved. */
            metadata?: any;

            /** Version of the layout */
            version?: string;
        }

        export type ComponentType = "application" | "activity";

        export interface WindowComponent {
            type: string;

            /** Type of the component - can be application or activity. */
            componentType?: ComponentType;

            /** Object describing the application bounds, name, context, etc. */
            state: LayoutComponentState;
        }

        export interface LayoutComponentState {
            name: any;
            context: any;
            url: string;
            bounds: any;
            id: string;
            parentId?: string;
            main: boolean;
        }

        export interface LayoutSummary {
            /** Name of the layout. The name is unique per layout type. */
            name: string;

            /** Type of the layout. */
            type: LayoutType;

            /** Context object passed when the layout was saved. */
            context?: any;

            /** Metadata passed when the layout was saved. */
            metadata?: any;
        }

        /**
         * Object describing the layout that you want to save.
         */
        export interface NewLayoutOptions {
            /** Name of the layout. */
            name: string;

            /**
             * Context (application specific data) to be saved with the layout.
             * Used to transfer data to the applications when restoring a layout.
             */
            context?: any;

            /**
             * Metadata to be saved with the layout.
             */
            metadata?: any;
        }

        /**
         * Options object for restoring layouts.
         */
        export interface RestoreOptions {

            /**
             * Name of the layout to restore.
             */
            name: string;

            /**
             * If `true`, will close all visible running instances before restoring the layout.
             * Exceptions are the current application and the Application Manager application.
             * The default is `true` for `Global` layouts and `false` for `Activity` layouts.
             */
            closeRunningInstance?: boolean;

            /**
             * Context object that will be passed to the restored apps. It will be merged with the saved context object.
             */
            context?: object;
        }

        /**
         * Object returned as a result to a save layout request.
         */
        export interface SaveRequestResponse {

            /** Context object specific to the application. */
            windowContext: object;
        }
    }

    /**
     * @docmenuorder 7
     * @intro
     * The Notifications API provides a way to display native notifications with actions and to handle notification and action clicks.
     * **Glue42 Core** supports all available `Notification` settings as defined in the [DOM Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).
     *
     * The **Glue42 Core** Notifications API extends the DOM Notifications API with the option to handle notification and action clicks using Interop methods.
     *
     * The Notifications API is accessible through the `glue.notifications` object.
     */
    export namespace Notifications {
        export interface API {
            /**
             * Raises a new notification
             * @param notification notification options
             */
            raise(notification: RaiseOptions): Promise<Notification>;
            requestPermission?(): Promise<boolean>;
        }

        export interface NotificationDefinition {
            badge?: string;
            body?: string;
            data?: any;
            dir?: "auto" | "ltr" | "rtl";
            icon?: string;
            image?: string;
            lang?: string;
            renotify?: boolean;
            requireInteraction?: boolean;
            silent?: boolean;
            tag?: string;
            timestamp?: number;
            vibrate?: number[];
        }

        export interface Notification extends NotificationDefinition {
            onclick: () => any;
            onshow: () => any;
        }

        export interface RaiseOptions extends NotificationDefinition {
            /** the title of the notification */
            title: string;
            /** set to make the notification click invoke an interop method with specific arguments */
            clickInterop?: InteropActionSettings;
            actions?: NotificationAction[];
        }

        export interface NotificationAction {
            action: string;
            title: string;
            icon?: string;
            /** set to make the action invoke an interop method with specific arguments */
            interop?: InteropActionSettings;
        }

        export interface InteropActionSettings {
            method: string;
            arguments?: any;
            target?: "all" | "best";
        }

        export type NotificationClickHandler = (glue: Glue42Web.API, notificationDefinition: NotificationDefinition) => void;

        export interface ActionClickHandler {
            action: string;
            handler: NotificationClickHandler;
        }

        export interface Settings {
            defaultClick: NotificationClickHandler;
            actionClicks: ActionClickHandler[];
        }
    }

    /**
     * @docmenuorder 8
     * @intro
     * The Glue42 Channels are globally accessed named contexts that allow users to dynamically group applications, instructing them to work over the same shared data object.
     * The Channels API enables you to:
     *
     * - discover Channels - get the names and contexts of all Channels;
     * - navigate through Channels - get the current Channel, join and leave Channels, subscribe for the event which fires when the current Channel has changed;
     * - publish and subscribe - publish data to other applications on the same Channel and subscribe for Channel updates to react to data published by other applications;
     *
     * The Channels API is accessible through the `glue.channels` object.
     */
    namespace Channels {
        /**
         * Channels API.
         */
        export interface API {
            /**
             * Tracks the data in the current channel. Persisted after a channel change.
             * The callback isn't called when you publish the data.
             * @param callback Callback function to handle the received data.
             * @returns Unsubscribe function.
             */
            subscribe(callback: (data: any, context: ChannelContext, updaterId: string) => void): UnsubscribeFunction;

            /**
             * Tracks the data in a given channel.
             * @param name The channel to track.
             * @param callback Callback function to handle the received data.
             * @returns Promise that resolves with an unsubscribe function.
             */
            subscribeFor(name: string, callback: (data: any, context: ChannelContext, updaterId: string) => void): Promise<UnsubscribeFunction>;

            /**
             * Updates the context of the current or a given channel.
             * @param data Data object with which to update the channel context.
             * @param name The name of the channel to be updated. If not provided will update the current channel.
             * @returns Promise that resolves when the data has been published.
             */
            publish(data: any, name?: string): Promise<void>;

            /**
             * Returns a list of all channel names.
             * @returns Promise that resolves with the list of all channel names.
             */
            all(): Promise<string[]>;

            /**
             * Returns a list of all channel contexts.
             * @returns Promise that resolves with the list of all channel contexts.
             */
            list(): Promise<ChannelContext[]>;

            /**
             * Returns the context of a given channel.
             * @param name The name of the channel whose context to return.
             * @returns Promise that resolves with the context of the given channel.
             */
            get(name: string): Promise<ChannelContext>;

            /**
             * Joins a new channel by name. Leaves the current channel.
             * @param name The name of the channel to join.
             * @returns Promise that resolves when the channel has been joined.
             */
            join(name: string): Promise<void>;

            /**
             * Leaves the current channel.
             * @returns Promise that resolves when the channel has been left.
             */
            leave(): Promise<void>;

            /**
             * Returns the name of the current channel.
             * @ignore
             * @returns The name of the current channel.
             */
            current(): string;

            /**
             * Returns the name of the current channel.
             * @returns The name of the current channel.
             */
            my(): string;

            /**
             * Subscribes for the event which fires when a channel is changed.
             * @ignore
             * @param callback Callback function to handle channel changes.
             * @returns Unsubscribe function.
             */
            changed(callback: (channel: string) => void): UnsubscribeFunction;

            /**
             * Subscribes for the event which fires when a channel is changed.
             * @param callback Callback function to handle channel changes.
             * @returns Unsubscribe function.
             */
            onChanged(callback: (channel: string) => void): UnsubscribeFunction;

            /**
             * Adds a new channel.
             * @ignore
             * @param info The initial channel context.
             * @returns Promise that resolves with the initial channel context.
             */
            add(info: ChannelContext): Promise<ChannelContext>;
        }

        /**
         * Channel context object.
         */
        export interface ChannelContext {
            /** Unique name of the context. */
            name: string;
            /** Channel meta data (display name, color, image, etc.) */
            meta: any;
            /** Channel data. */
            data: any;
        }
    }

    /**
     * @docmenuorder 9
     * @intro
     * The Application Management API provides a way to manage **Glue42 Core** applications. It offers abstractions for:
     *
     * - **Application** - a web app as a logical entity, registered in **Glue42 Core** with some metadata (name, title, version, etc.) and with all the configuration needed to spawn one or more instances of it. The Application Management API provides facilities for retrieving application metadata and for detecting when an application has been started;
     *
     * - **Instance** - a running copy of an application. The Application Management API provides facilities for starting/stopping application instances and tracking application and instance related events;
     *
     * The Application Management API is accessible through the `glue.appManager` object.
     */
    namespace AppManager {
        /**
         * Application Management API.
         */
        export interface API {
            /** The instance of the application. */
            myInstance: Instance;

            /** An object, through which applications definitions stored in-memory can be programmatically imported or removed. */
            inMemory: InMemory;

            /**
             * Returns an application by name.
             * @param name Name of the desired application.
             * @returns The application.
             */
            application(name: string): Application;

            /** Returns a list of all applications.
             * @returns A list of all applications.
             */
            applications(): Application[];

            /** Returns an array with all running application instances.
             * @returns A list of all running application instances.
             */
            instances(): Instance[];

            /**
             * Notifies when a new application instance has been started.
             * Replays the already started instances.
             * @param callback Callback function to handle the event. Receives the started application instance as a parameter.
             * @returns Unsubscribe function.
             */
            onInstanceStarted(callback: (instance: Instance) => any): UnsubscribeFunction;

            /**
             * Notifies when an application instance has been stopped.
             * @param callback Callback function to handle the event. Receives the stopped application instance as a parameter.
             * @returns Unsubscribe function.
             */
            onInstanceStopped(callback: (instance: Instance) => any): UnsubscribeFunction;

            /**
             * Notifies when an application is registered in the environment.
             * Replays the already added applications.
             * @param callback Callback function to handle the event. Receives the added application as a parameter.
             * @returns Unsubscribe function.
             */
            onAppAdded(callback: (app: Application) => any): UnsubscribeFunction;

            /**
             * Notifies when the application is removed from the environment.
             * @param callback Callback function to handle the event. Receives the removed application as a parameter.
             * @returns Unsubscribe function.
             */
            onAppRemoved(callback: (app: Application) => any): UnsubscribeFunction;

            /**
             * Notifies when the configuration for an application has changed.
             * @param callback Callback function to handle the event. Receives the changed application as a parameter.
             * @returns Unsubscribe function.
             */
            onAppChanged(callback: (app: Application) => any): UnsubscribeFunction;
        }

        /** An object, through which applications definitions stored in-memory can be programmatically imported or removed. */
        export interface InMemory {
            /**
             * Imports the provided collection of application definitions. Returns an import result object, which contains the names of the successfully imported apps and a list of errors if any.
             * @param definitions A collection of application definition objects to be imported.
             * @param mode Import mode, by default it is "replace". "replace" mode replaces all existing definitions with the provided collection, "merge" mode adds (if new) or updates (if already existing) the provided definitions.
             */
            import(definitions: Definition[], mode?: "replace" | "merge"): Promise<ImportResult>;

            /**
             * Removed an application definition. This method will fire onAppRemoved if a definition was removed and it will do nothing if an app with this was was not found.
             * @param name The name of the definition to be removed.
             */
            remove(name: string): Promise<void>;

            /** Exports all known application definitions */
            export(): Promise<Definition[]>;

            /** Removes all applications from the memory */
            clear(): Promise<void>;
        }

        export interface ImportResult {
            /** A list of names of the successfully imported application definitions */
            imported: string[];

            /** A list of application names and errors of all the unsuccessful imports */
            errors: Array<{ app: string; error: string }>;
        }

        export interface DefinitionDetails {
            url: string;

            /**
             * Distance of the top left window corner from the top edge of the screen.
             * @default 0
             */
            top?: number;

            /**
             * Distance of the top left window corner from the left edge of the screen.
             * @default 0
             */
            left?: number;

            /**
             * Window width.
             * @default 400
             */
            width?: number;

            /**
             * Window height.
             * @default 400
             */
            height?: number;
        }

        /**
         * An intent definition.
         */
        export interface Intent {
            /**
             * The name of the intent to 'launch'. In this case the name of an Intent supported by an Application.
             */
            name: string;

            /**
             * An optional display name for the intent that may be used in UI instead of the name.
             */
            displayName?: string;

            /**
             * A comma separated list of the types of contexts the intent offered by the application can process, here the first part of the context type is the namespace e.g."fdc3.contact, org.symphony.contact".
             */
            contexts?: string[];

            /**
             * Custom configuration for the intent that may be required for a particular desktop agent.
             */
            customConfig?: object;
        }

        export interface Definition {
            /**
             * Application name. Should be unique.
             */
            name: string;

            /**
              * Type of the application - the only supported type in Glue42 Core is "window". More complex types are available in Glue42 Enterprise.
              */
            type: string;

            /**
             * The title of the application. Sets the window's title.
             */
            title?: string;

            /**
             * Application version.
             */
            version?: string;

            /**
             * Detailed configuration.
             */
            details: DefinitionDetails;

            /**
             * Generic object for passing properties, settings, etc., in the for of key/value pairs. Accessed using the app.userProperties property.
             */
            customProperties?: PropertiesObject;

            /**
             * Application icon.
             */
            icon?: string;

            /**
             * Application caption.
             */
            caption?: string;

            /**
             * The list of intents implemented by the Application
             */
            intents?: Intent[];
        }

        /** Object describing an application. */
        export interface Application {
            /** Application name. */
            name: string;

            /** Application title. */
            title?: string;

            /** Application version. */
            version?: string;

            /** Application icon. */
            icon?: string;

            /** Application caption. */
            caption?: string;

            /** Generic object for passing properties, settings, etc., in the for of key/value pairs. */
            userProperties: PropertiesObject;

            /** Instances of that app. */
            instances: Instance[];

            /**
             * Returns the newly started application instance.
             * @param context The initial context of the application.
             * @param options Options object in which you can specify window setting (that will override the default configuration settings), as well as other additional options.
             * @returns Promise that resolves with the newly started application instance.
             */
            start(context?: object, options?: ApplicationStartOptions): Promise<Instance>;

            /**
             * Subscribes for the event which fires when an application instance is started.
             * Note: unlike the API's `onInstanceStarted()` the Application's `onInstanceStarted()` method doesn't replay the already started instances.
             * @param callback Callback function to handle the newly started instance.
             * @returns Unsubscribe function.
             */
            onInstanceStarted(callback: (instance: Instance) => any): void;

            /**
             * Subscribes for the event which fires when an application instance is stopped.
             * @param callback Callback function to handle the newly started instance.
             * @returns Unsubscribe function.
             */
            onInstanceStopped(callback: (instance: Instance) => any): void;
        }

        /**
         * Object with options for starting an application.
         */
        export interface ApplicationStartOptions {

            /**
             * Distance of the top left window corner from the top edge of the screen.
             * @default 0
             */
            top?: number;

            /**
             * Distance of the top left window corner from the left edge of the screen.
             * @default 0
             */
            left?: number;

            /**
             * Window width.
             * @default 400
             */
            width?: number;

            /**
             * Window height.
             * @default 400
             */
            height?: number;

            /**
             * The ID of the window that will be used to relatively position the new window.
             * Can be combined with `relativeDirection`.
             */
            relativeTo?: string;

            /**
             * Direction (`"bottom"`, `"top"`, `"left"`, `"right"`) of positioning the window relatively to the `relativeTo` window. Considered only if `relativeTo` is supplied.
             * @default "right"
             */
            relativeDirection?: "top" | "left" | "right" | "bottom";

            waitForAGMReady?: boolean;
        }

        /** Generic object for passing properties, settings, etc., in the for of key/value pairs. */
        export interface PropertiesObject {
            [key: string]: any;
        }

        /** Object describing an application instance. */
        export interface Instance {
            /** Instance ID. */
            id: string;

            /** The starting context of the instance. */
            getContext(): Promise<object>;

            /** Interop instance. Use this to invoke Interop methods for that instance. */
            agm: Interop.Instance;

            application: Application;

            /** Stops the instance.
             * @returns Promise that resolves when the instance has been stopped.
            */
            stop(): Promise<void>;
        }
    }

    /**
     * @docmenuorder 10
     * @intro
     * In certain workflow scenarios, your application may need to start (or activate) a specific application.
     * For instance, you may have an application showing client portfolios with financial instruments.
     * When the user clicks on an instrument, you want to start an application which shows a chart for that instrument.
     * In other cases, you may want to present the user with several options for executing an action or handling data from the current application.
     *
     * The Intents API makes all that possible by enabling applications to register, find and raise Intents.
     *
     * The Intents API is accessible through the `glue.intents` object.
     */
    namespace Intents {
        export interface API {
            /**
             * Raises an intent, optionally passing context to the intent handlers, and optionally targeting specific intent handlers.
             * If no handlers are matching the targeting conditions the promise will be rejected.
             * @param request can be the intent's name or an {@link IntentRequest} object carrying the intent, and its optional target, context and start options (see "startNew").
             * @returns Promise that resolves with {@link IntentResult}.
             */
            raise(request: string | IntentRequest): Promise<IntentResult>;

            /**
             * Returns all registered {@link Intent}.
             * @returns Promise that resolves with all registered intents.
             */
            all(): Promise<Intent[]>;

            /**
             * If your application is an intent handler use this method to handle incoming intent requests.
             * Please note that when a new instance of your application is started as a result of a raised intent with e.g. `startNew` your application needs to call `addIntentListener()` on startup so that the intent can be resolved.
             * The handler callback will be invoked whenever an intent is raised and your app was selected as an IntentTarget.
             * You can also use this method to register new dynamic intents, that will have the the same lifespan as your application instance.
             * @param intent The intent to be handled. The intent name of an object containing the intent, contextTypes that the intent can handle and a display name.
             * @param handler The callback that will handle a raised intent. Will be called with an {@link IntentContext} if it is provided by the raising application.
             * @returns An object with an unsubscribe function under the unsubscribe property.
             */
            addIntentListener(intent: string | AddIntentListenerRequest, handler: (context: IntentContext) => any): { unsubscribe: UnsubscribeFunction };

            /**
             * Searches for registered intents.
             * @param intentFilter can be the intent name or a {@link IntentFilter} filtering criteria.
             * @returns Promise that resolves with the found intents that match the provided filtering criteria.
             */
            find(intentFilter?: string | IntentFilter): Promise<Intent[]>;
        }

        /** Use to define dynamic intents, that will have the same lifespan as your application instance */
        export interface AddIntentListenerRequest {
            intent: string;
            contextTypes?: string[];
            displayName?: string;
            icon?: string;
            description?: string;
        }

        /**
         * Specifies the search criteria for the Intent API's `find()` method.
         */
        export interface IntentFilter {
            /**
             * The name of the intent to be used in the lookup.
             */
            name?: string;
            /**
             * The name of the context type to be used in the lookup.
             */
            contextType?: string;
        }

        /**
         * Represents an intent.
         */
        export interface Intent {
            /**
             * The name of the intent, such as `"CreateCall"`.
             */
            name: string;
            /**
             * The set of {@link IntentHandler} that provide an implementation for the intent and can be used to handle an intent request.
             */
            handlers: IntentHandler[];
        }

        /**
         * Represents an implementation of an intent.
         * Each intent handler can offer its own display name - this allows context menus
         * built on the fly to display more user friendly options. For example, if there is
         * an intent with a name "ShowNews", there could be a handler with display name
         * "Show Bloomberg News" and another with display name "Show Reuters News".
         * Handlers can optionally specify the context type they support, where the
         * context type is the name of a typed, documented data structure such as
         * "Person", "Team", "Instrument", "Order", etc. In the example above,
         * both the Bloomberg and Reuters handlers would specify a context type "Instrument" and
         * would expect to be raised with an instrument object conforming to an expected
         * structure from both handlers.
         * An intent handler must not necessarily specify a context type.
         */
        export interface IntentHandler {
            /**
             * The name of the application which registered this intent implementation, as specified in the application configuration.
             */
            applicationName: string;

            /* The title of the application which registered this intent implementation, as specified in the application configuration. */
            applicationTitle: string;

            /* User friendly (longer) description of the application, as specified in the application configuration. */
            applicationDescription?: string;

            /* Icon URL of the application that has registered the intent handler, as specified in the application configuration. */
            applicationIcon?: string;

            /**
             * The type of the handler.
             * "app" - An application that has declared itself as an implementor of the intent inside of its application definition.
             * "instance" - A running instance of an application that can handle the intent. Also includes dynamically added intents using `addIntentListener()`.
             */
            type: "app" | "instance";

            /**
             * The human-readable name of the intent handler, as specified in the intent definition.
             */
            displayName?: string;

            /**
             * The context types this handler supports.
             */
            contextTypes?: string[];

            /**
             * The id of the running application instance.
             */
            instanceId?: string;

            /**
             * The window's title of the running application instance.
             */
            instanceTitle?: string;
        }

        /**
         * Represents a request to raise an intent.
         */
        export interface IntentRequest {
            /**
             * The name of the intent to be raised.
             */
            readonly intent: string;
            /**
             * Тhe target of the raised intent. Valid values are:
             * `startNew` - will start a new instance of an application that can handle the intent.
             * `reuse` - a running instance of an application will handle the intent.
             * { app: "AppName" } - will start a new instance of the "AppName" application (iff it can handle it) that will handle the intent.
             * { instance: "i-123-1" } - the running application instance with instanceId "i-123-1" will handle the intent (iff it can handle it).
             */
            readonly target?: "startNew" | "reuse" | { app?: string; instance?: string };
            /**
             * The context type and data that will be provided to the intent implementation's handler.
             */
            readonly context?: IntentContext;
            /**
             * Start up options that will be used when a new instance of an application needs to be started to handle the intent request.
             */
            readonly options?: AppManager.ApplicationStartOptions;
        }

        /**
         * A structure that describes a typed context to be used to raise intents with.
         */
        export interface IntentContext {
            /**
             * The name of a typed, documented data structure such as "Person", "Team", "Instrument", "Order", etc.
             * It is the application developers' job to agree on a protocol to follow.
             */
            readonly type?: string;
            /**
             * The context data used as an argument by the intent implementation.
             */
            readonly data?: { [key: string]: any };
        }

        /**
         * The result of a raised intent.
         */
        export interface IntentResult {
            /**
             * The arguments that were used to raise the intent with.
             */
            request: IntentRequest;
            /**
             * The intent implementation that handled the intent.
             */
            handler: IntentHandler;
            /**
             * The data returned by the intent implementation when handling the intent.
             */
            result?: any;
        }
    }
}
