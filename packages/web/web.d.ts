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
export type GlueWebFactoryFunction = (config?: Glue42Web.Config) => Promise<Glue42Web.API | Glue42.Glue>;
declare const GlueWebFactory: GlueWebFactoryFunction;
export default GlueWebFactory;

/**
 * @docmenuorder 1
 * @docname Glue42 Web
 * @intro
 * Glue42 Web allows JavasScript applications to integrate with other applications, part of the same Glue42 Core project via a set of APIs. With Glue42 Web you can share data with other applications, expose functionality, manage windows and notifications.
 *
 * ## Referencing
 *
 * Glue42 Web is available both as a single JavaScript file which you can include into your web applications using a `<script>` tag, and as a node.js module.
 * You can use Glue42 Web in a `script` tag include, e.g.:
 *
 * @example
 * ```html
 * <script type="text/javascript" src="web.umd.js"></script>
 * ```
 *
 * ...or as a module:
 *
 * ``` javascript
 * import GlueWeb from `@glue42/web`;
 * ```
 *
 * When deploying your application in production, we recommend that you always reference a specific **minified** version, e.g.:
 *
 * ```html
 * <script type="text/javascript" src="web.umd.min.js"></script>
 * ```
 *
 * ## Initialization
 * When Glue42 Web is executed, it will attach a factory function to the global (window) object at runtime called **GlueWeb**. This factory function should be invoked with an optional configuration object to init the library and connect to the Glue42 Core Environment. The factory function returns a Promise that resolves with the glue API object.
 *
 * Example:
 * ```javascript
 *  GlueWeb()
 *   .then((glue) => {
 *      window.glue = glue;
 *      // access APIs from glue object
 * })
 * .catch(console.log);
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
         * @ignore
         * @deprecated
         * By default @glue42/web will try to connect to a shared worker located in "/glue/worker.js". Use this ot override the shared worker location.
         * It is recommended to use `worker` to define a custom location for the worker script, if extends has been set to `false`.
         * @default "/glue/worker.js"
         */
        worker?: string;

        /**
         * Change the log level of the internal logger
         * @ignore
         * @default error
         */
        logger?: Glue42Core.LogLevel;

        /**
         * Object used to turn on or off the applications auto-save and auto-restore functionality
         */
        layouts?: LayoutConfig;

        /**
         * @ignore
         * @deprecated
         * Defines a URL to a hosted `glue.config.json` file which the library will fetch and use to extend the built-in config defaults. We recommend setting thi to `false`, if you do not have said configuration file. Also keep in mind that if you define a custom URL, then the library will expect to find a `worker.js` file next to the config.
         * @default true
         */
        extends?: string | boolean;

        /**
         * Connect with GW in memory.
         * Used for testing in node environment, where the GW isn't started by @glue42/worker-web and an inproc GW is used instead.
         * @ignore
         */
        inproc?: Glue42Core.InprocGWSettings;

        /**
         * Whether to initialize the Channels API or not.
         * @default false
         */
        channels?: boolean;

        /**
         * Whether to initialize the Application Manager API or not.
         * @default false
         */
        appManager?: boolean;

        /**
         * Application name. If not specified the Application Manager API won't know about the application and its instances.
         */
        application?: string;

        /**
         * todo: An object exposing settings related to the Glue42 Core resources.
         */
        assets?: WebAssets;

        /**
         * A list of glue libraries which will be initiated internally and provide access to specific functionalities
         */
        libraries?: Array<(glue: Glue42Web.API, config?: Glue42Web.Config) => Promise<void>>;
    }

    /**
     * @docmenuorder 3
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
        workspaces?: Glue42Workspaces.API;
    }

    /**
     * @docmenuorder 4
     */
    export interface LayoutConfig {
        /**
         * If true, the set of windows opened by the application will be saved (in local storage) when the window is closed and restored
         * when the window is started again. The data saved about each window includes URL, bounds and custom window context.
         * It will also save and restore the window context of the current window.
         * @default false
         */
        autoRestore?: boolean;

        /**
         * If set to `true`, will return glue.windows.my().context automatically when asked for layout state.
         * @default false
         */
        autoSaveWindowContext?: boolean;
    }

    /**
     * @docmenuorder 5
     */
    export interface WebAssets {
        /**
         * This defines the location of the Glue42 Core assets bundle (glue.layouts.json, glue.config.json, workspaces app and more).
         * @default "/glue"
         */
        location?: string;

        /**
         * If set to true the initialization logic will fetch the glue.config.json and use the defined glue object there to extend the provided config. We recommend setting this to false if you do not have a glue.config.json.
         * @default true
         */
        extendConfig?: boolean;
    }

    /**
     * @docmenuorder 6
     * @intro
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
            open(name: string, url: string, options?: CreateOptions): Promise<WebWindow>;

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

        export interface CreateOptions extends Settings {
            /** Required. The URL of the app to be loaded in the new window */
            url?: string;
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
        export type LayoutType = "Global" | "Workspace" | "Activity";

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
            get?(name: string, type: LayoutType): Promise<Layout | undefined>;

            /**
             * Returns a lightweight, summarized version of all layouts of the provided type.
             * @param type Type of the layouts to fetch.
             */
            getAll?(type: LayoutType): Promise<LayoutSummary[]>;

            /**
             * Returns all layouts from the provided type.
             * @param type Type of the layouts to export.
             */
            export(layoutType?: LayoutType): Promise<Layout[]>;

            /**
             * Stores a full layout.
             * @param layout The layout object to be stored.
             */
            import(layouts: Layout[]): Promise<void>;

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
        }

        export type ComponentType = "application" | "activity";

        export interface WindowComponent {
            type: "window";

            /** Type of the component - can be application or activity. */
            componentType: ComponentType;

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
            context: any;

            /** Metadata passed when the layout was saved. */
            metadata: any;
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
     * @docmenuorder 6
     * @intro
     */
    export namespace Notifications {
        export interface API {
            /**
             * Raises a new notification
             * @param notification notification options
             */
            raise(notification: Glue42NotificationOptions): Promise<Notification>;
        }

        export interface Glue42NotificationOptions extends NotificationOptions {
            /** the title of the notification */
            title: string;
            /** set to make the notification click invoke an interop method with specific arguments */
            clickInterop?: InteropActionSettings;
        }

        export interface Glue42NotificationAction extends NotificationAction {
            /** set to make the action invoke an interop method with specific arguments */
            interop: InteropActionSettings;
        }

        export interface InteropActionSettings {
            method: string;
            arguments?: any;
            target?: "all" | "best";
        }
    }

    /**
     * @docmenuorder 7
     * @intro
     * The **Channels** are globally accessed named contexts that allow users to dynamically group applications, instructing them to work over the same shared data object.
     *
     * When two applications are on the same channel, they share a context data object, which they can monitor and/or update.
     *
     * The **Channels** API can be accessed through the `glue.channels` object.
     *
     * See also the [**Channels**](../../../../core/capabilities/channels/index.html) documentation for more details.
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
     * @docmenuorder 8
     * @intro
     * The **Application Management** API provides a way to manage Glue42 Core applications. It offers abstractions for:
     *
     * - **Application** - a program as a logical entity, registered in Glue42 Core with some metadata (name, description, icon, etc.) and with all the configuration needed to spawn one or more instances of it. The **Application Management** API provides facilities for retrieving application metadata and for detecting when an application is started.
     *
     * - **Instance** - a running copy of an application. The **Application Management** API provides facilities for starting/stopping application instances and for managing its windows.
     *
     * The **Application Management** API can be accessed through `glue.appManager`.
     *
     * See the the [AppManager](../../../../core/capabilities/application-management/index.html) documentation for more details.
     */
    namespace AppManager {
        /**
         * Application Management API.
         */
        export interface API {
            /** The instance of the application. */
            myInstance: Instance;

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

        /** Object describing an application. */
        export interface Application {
            /** Application name. */
            name: string;

            /** Application title. */
            title: string;

            /** Application version. */
            version: string;

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
             * @param callback Callback function to handle the newly started instance.
             * @returns Unsubscribe function.
             */
            onInstanceStarted: (callback: (instance: Instance) => any) => void;

            /**
             * Subscribes for the event which fires when an application instance is stopped.
             * @param callback Callback function to handle the newly started instance.
             * @returns Unsubscribe function.
             */
            onInstanceStopped: (callback: (instance: Instance) => any) => void;
        }

        /**
         * Object with options for starting an application.
         */
        export import ApplicationStartOptions = Glue42Web.Windows.Settings;

        /** Generic object for passing properties, settings, etc., in the for of key/value pairs. */
        export interface PropertiesObject {
            [key: string]: any;
        }

        /** Object describing an application instance. */
        export interface Instance {
            /** Instance ID. */
            id: string;

            /** The application object of that instance. */
            application: Application;

            /** The starting context of the instance. */
            context: object;

            /** Interop instance. Use this to invoke Interop methods for that instance. */
            agm: Interop.Instance;

            /** Stops the instance.
             * @returns Promise that resolves when the instance has been stopped.
            */
            stop(): Promise<void>;
        }
    }
}
