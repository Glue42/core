/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "../web";

export interface Glue42CoreConfig {
    glue?: Glue42Web.Config;
    gateway?: any;
    channels?: Glue42Web.Channels.ChannelContext[];
    appManager?: AppManagerConfig;
    layouts?: {
        remoteType: "none" | "json";
    };
}

export interface AppManagerConfig {
    localApplications?: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>;
    remoteSources?: RemoteSource[];
}

export interface ApplicationConfig {
    /**
     * Application name. Should be unique.
     */
    name: string;

    /**
     * The title of the application. Sets the window's title.
     */
    title?: string;

    /**
     * Application version.
     */
    version?: string;
}

/**
 * A Glue42 Core Application config.
 */
export interface Glue42CoreApplicationConfig extends ApplicationConfig {
    /**
     * Detailed configuration.
     */
    details: Glue42Web.Windows.CreateOptions;

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
}

/**
 * A FDC3 Application config.
 */
export interface FDC3ApplicationConfig extends ApplicationConfig {
    /**
     * The unique application identifier located within a specific application directory instance.
     */
    appId: string;

    /**
     * URI or full JSON of the application manifest providing all details related to launch and use requirements as described by the vendor.
     * The format of this manifest is vendor specific, but can be identified by the manifestType attribute.
     */
    manifest: string;

    /**
     * The manifest type which relates to the format and structure of the manifest content. The definition is based on the vendor specific format and definition outside of this specification.
     */
    manifestType: string;

    /**
     * Optional tooltip description e.g. for a launcher.
     */
    tooltip?: string;

    /**
     * Description of the application.This will typically be a 1 - 2 paragraph style blurb about the application.Allow mark up language.
     */
    description?: string;

    /**
     * Optional e - mail to receive queries about the application.
     */
    contactEmail?: string;

    /**
     * Optional e - mail to receive support requests for the application.
     */
    supportEmail?: string;

    /**
     * The name of the company that owns the application.The publisher has control over their namespace / app / signature.
     */
    publisher?: string;

    /**
     * Array of images to show the user when they are looking at app description.Each image can have an optional description / tooltip.
     */
    images?: AppImage[];

    /**
     * Holds Icons used for the application, a Launcher may be able to use multiple Icon sizes or there may be a 'button' Icon.
     */
    icons?: Icon[];

    /**
     * An optional set of name value pairs that can be used to deliver custom data from an App Directory to a launcher.
     */
    customConfig?: PropertiesObject;

    /**
     * The list of intents implemented by the Application
     */
    intents?: Intent[];
}

/** App Image holder */
export interface AppImage {
    /**
     * App Image URL.
     */
    url?: string;
}

/** Icon holder */
export interface Icon {
    /**
     * Icon URL.
     */
    icon?: string;
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

/** Generic object for passing properties, settings, etc., in the for of key/value pairs. */
export interface PropertiesObject {
    [key: string]: any;
}

/**
 * A remote source of application definitions that follows the [FDC3 Application Directory standard](https://github.com/finos/FDC3/blob/master/src/app-directory/specification/appd.yaml).
 * The default pollingInterval is 3000 ms.
 */
export interface RemoteSource {
    /**
     * The url of the remote source of application definitions. The remote source needs to follow the [FDC3 AppDirectory standard](https://github.com/finos/FDC3). The applications provided by the remote need to either be Glue42CoreApplicationConfig or FDC3ApplicationConfig.
     */
    url: string;

    /**
     * The polling interval for fetching from the remote source.
     */
    pollingInterval?: number;
}
