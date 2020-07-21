export declare namespace FDC3 {
    /*
    Contexts
     */
    interface Context {
        type: string;
        name?: string;
        id?: {
            [x: string]: string;
        };
        [x: string]: any;
    }

    /**
     * Intent schema
     */
    interface Intent {
        /*
        * The name of the intent, default nameing convention is UpperCamelCase
        */
        name: string;
        /*
        * An optional display name for the intent, "name" will be used if left empty
        */
        displayName?: string;
        /*
        * A list of the contexts the intent accepts. This will typically be a set of namespaced context types, e.g. "org.symphony.contact"
        */
        contexts?: string[];
        /*
        * Custom configuration for the intent that may be required for a particular desktop agent.
        */
        customConfig?: object;
    }

    /*
    * Application schema, to be used in the AppDirectory for apps declaring supported intents
    * The full application definiton will be extended with properties defined in the AppDirectory WG
    */
    interface Application {
        /*
        * List of the intents the application supports
        */
        intents: Intent[];
    }

    /**
     * Intent descriptor
     */
    interface IntentMetadata {
        /** The unique name of the intent that can be invoked by the raiseIntent call */
        name: string;

        /** A friendly display name for the intent that should be used to render UI elements */
        displayName: string;
    }

    /**
     * An interface that relates an intent to apps
     */
    interface AppIntent {
        intent: IntentMetadata;
        apps: Array<AppMetadata>;
    }

    /**
     * App definition as provided by the application directory
     */
    interface AppMetadata {

        /** The unique app name that can be used with the open and raiseIntent calls. */
        name: string;

        /** A more user-friendly application title that can be used to render UI elements  */
        title?: string;

        /**  A tooltip for the application that can be used to render UI elements */
        tooltip?: string;

        /** A longer, multi-paragraph description for the application that could include markup */
        description?: string;

        /** A list of icon URLs for the application that can be used to render UI elements */
        icons?: Array<string>;

        /** A list of image URLs for the application that can be used to render UI elements */
        images?: Array<string>;
    }

    /**
     * IntentResolution provides a standard format for data returned upon resolving an intent.
     * ```javascript
     * //resolve a "Chain" type intent
     * var intentR = await agent.raiseIntent("intentName", context);
     * //resolve a "Client-Service" type intent with data response
     * var intentR = await agent.raiseIntent("intentName", context);
     * var dataR = intentR.data;
     * ```
     */
    interface IntentResolution {
        source: string;
        data?: object;
        version: string;
    }

    interface Listener {
        /**
         * Unsubscribe the listener object.
         */
        unsubscribe: () => void;
    }

    const enum OpenError {
        AppNotFound = "AppNotFound",
        ErrorOnLaunch = "ErrorOnLaunch",
        AppTimeout = "AppTimeout",
        ResolverUnavailable = "ResolverUnavailable"
    }

    const enum ResolveError {
        NoAppsFound = "NoAppsFound",
        ResolverUnavailable = "ResolverUnavailable",
        ResolverTimeout = "ResolverTimeout"
    }

    const enum ChannelError {
        NoChannelFound = "NoChannelFound",
        AccessDenied = "AccessDenied",
        CreationFailed = "CreationFailed"
    }


    /**
     * A Desktop Agent is a desktop component (or aggregate of components) that serves as a
     * launcher and message router (broker) for applications in its domain.
     *
     * A Desktop Agent can be connected to one or more App Directories and will use directories for application
     * identity and discovery. Typically, a Desktop Agent will contain the proprietary logic of
     * a given platform, handling functionality like explicit application interop workflows where
     * security, consistency, and implementation requirements are proprietary.
     */
    interface DesktopAgent extends ChannelsAPI {
        /**
         * Launches an app by name.
         *
         * If a Context object is passed in, this object will be provided to the opened application via a contextListener.
         * The Context argument is functionally equivalent to opening the target app with no context and broadcasting the context directly to it.
         *
         * If opening errors, it returns an `Error` with a string from the `OpenError` enumeration.
         *
         *  ```javascript
         *     //no context
         *     agent.open('myApp');
         *     //with context
         *     agent.open('myApp', context);
         * ```
         */
        open(name: string, context?: Context): Promise<void>;

        /**
         * Find out more information about a particular intent by passing its name, and optionally its context.
         *
         * findIntent is effectively granting programmatic access to the Desktop Agent's resolver.
         * A promise resolving to the intent, its metadata and metadata about the apps that registered it is returned.
         * This can be used to raise the intent against a specific app.
         *
         * If the resolution fails, the promise will return an `Error` with a string from the `ResolveError` enumeration.
         *
         * ```javascript
         * // I know 'StartChat' exists as a concept, and want to know more about it ...
         * const appIntent = await agent.findIntent("StartChat");
         *
         * // returns a single AppIntent:
         * // {
         * //     intent: { name: "StartChat", displayName: "Chat" },
         * //     apps: [{ name: "Skype" }, { name: "Symphony" }, { name: "Slack" }]
         * // }
         *
         * // raise the intent against a particular app
         * await agent.raiseIntent(appIntent.intent.name, context, appIntent.apps[0].name);
         * ```
         */
        findIntent(intent: string, context?: Context): Promise<AppIntent>;

        /**
         * Find all the avalable intents for a particular context.
         *
         * findIntents is effectively granting programmatic access to the Desktop Agent's resolver.
         * A promise resolving to all the intents, their metadata and metadata about the apps that registered it is returned,
         * based on the context types the intents have registered.
         *
         * If the resolution fails, the promise will return an `Error` with a string from the `ResolveError` enumeration.
         *
         * ```javascript
         * // I have a context object, and I want to know what I can do with it, hence, I look for for intents...
         * const appIntents = await agent.findIntentsByContext(context);
         *
         * // returns for example:
         * // [{
         * //     intent: { name: "StartCall", displayName: "Call" },
         * //     apps: [{ name: "Skype" }]
         * // },
         * // {
         * //     intent: { name: "StartChat", displayName: "Chat" },
         * //     apps: [{ name: "Skype" }, { name: "Symphony" }, { name: "Slack" }]
         * // }];
         *
         * // select a particular intent to raise
         * const startChat = appIntents[1];
         *
         * // target a particular app
         * const selectedApp = startChat.apps[0];
         *
         * // raise the intent, passing the given context, targeting the app
         * await agent.raiseIntent(startChat.intent.name, context, selectedApp.name);
         * ```
         */
        findIntentsByContext(context: Context): Promise<Array<AppIntent>>;

        /**
         * Raises an intent to the desktop agent to resolve.
         * ```javascript
         * //raise an intent to start a chat with a given contact
         * const intentR = await agent.findIntents("StartChat", context);
         * //use the IntentResolution object to target the same chat app with a new context
         * agent.raiseIntent("StartChat", newContext, intentR.source);
         * ```
         */
        raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;

        /**
         * Adds a listener for incoming Intents from the Agent.
         */
        addIntentListener(intent: string, handler: ContextHandler): Listener;
    }

    interface ChannelsAPI {
        /**
         * Retrieves a list of the System channels available for the app to join
         */
        getSystemChannels(): Promise<Array<Channel>>;

        /**
         * Joins the app to the specified channel.
         * An app can only be joined to one channel at a time.
         * Rejects with error if the channel is unavailable or the join request is denied.
         * `Error` with a string from the `ChannelError` enumeration.
         */
        joinChannel(channelId: string): Promise<void>;

        /**
         * Returns a channel with the given identity. Either stands up a new channel or returns an existing channel.
         *
         * It is up to applications to manage how to share knowledge of these custom channels across windows and to manage
         * channel ownership and lifecycle.
         *
         * `Error` with a string from the `ChannelError` enumeration.
         */
        getOrCreateChannel(channelId: string): Promise<Channel>;

        /**
         * Publishes context to other apps on the desktop.
         * ```javascript
         *  agent.broadcast(context);
         * ```
         */
        broadcast(context: Context): void;

        /**
         * Adds a listener for incoming context broadcast from the Desktop Agent.
         */
        addContextListener(handler: ContextHandler): Listener;

        /**
         * Adds a listener for the broadcast of a specific type of context object.
         */
        addContextListener(contextType: string, handler: ContextHandler): Listener;

        getCurrentChannel(): Promise<Channel>;

        leaveCurrentChannel(): Promise<void>;
    }

    type ChannelId = string;

    type ContextHandler = (context: Context) => void;


    /**
     * Object representing a context channel.
     */
    interface Channel {
        /**
         * Constant that uniquely identifies this channel.
         */
        readonly id: string;

        /**
         * Uniquely defines each channel type.
         */
        readonly type: string;

        /**
         * Channels may be visualized and selectable by users. DisplayMetadata may be used to provide hints on how to see them.
         * For app channels, displayMetadata would typically not be present
         */
        readonly displayMetadata?: DisplayMetadata;

        /**
         * Broadcasts the given context on this channel. This is equivalent to joining the channel and then calling the
         * top-level FDC3 `broadcast` function.
         *
         * Note that this function can be used without first joining the channel, allowing applications to broadcast on
         * channels that they aren't a member of.
         *
         * `Error` with a string from the `ChannelError` enumeration.
         */
        broadcast(context: Context): void;

        /**
         * Returns the last context that was broadcast on this channel. All channels initially have no context, until a
         * context is broadcast on the channel. If there is not yet any context on the channel, this method
         * will return `null`.
         *
         * The context of a channel will be captured regardless of how the context is broadcasted on this channel - whether
         * using the top-level FDC3 `broadcast` function, or using the channel-level {@link broadcast} function on this
         * object.
         *
         * Optionally a {@link contextType} can be provided, in which case the current context of the matching type will
         * be returned (if any). Desktop agent implementations may decide to record contexts by type, in which case it will
         * be possible to get the most recent context of the type specified, but this is not guaranteed.
         *
         * `Error` with a string from the `ChannelError` enumeration.
         */
        getCurrentContext(contextType?: string): Promise<Context | null>;

        /**
         * Adds a listener for incoming contexts whenever a broadcast happens on this channel.
         */
        addContextListener(handler: ContextHandler): Listener;

        /**
         * Adds a listener for incoming contexts of the specified context type whenever a broadcast happens on this channel.
         */
        addContextListener(contextType: string, handler: ContextHandler): Listener;
    }


    /**
     * A system channel will be global enough to have a presence across many apps. This gives us some hints
     * to render them in a standard way. It is assumed it may have other properties too, but if it has these,
     * this is their meaning.
     */
    interface DisplayMetadata {
        /**
         * A user-readable name for this channel, e.g: `"Red"`
         */
        name?: string;

        /**
         * The color that should be associated within this channel when displaying this channel in a UI, e.g: `0xFF0000`.
         */
        color?: string;

        /**
         * A URL of an image that can be used to display this channel
         */
        glyph?: string;
    }
}
