/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42API } from "./src/common/types";

export namespace Glue42WebPlatform {

    export interface RemoteStore {
        /**
         * The url of the remote source of application definitions. The remote source needs to follow the [FDC3 AppDirectory standard](https://github.com/finos/FDC3). The applications provided by the remote need to either be Glue42CoreApplicationConfig or FDC3ApplicationConfig.
         */
        url: string;

        /**
         * The polling interval for fetching from the remote source. If no pollingInterval is provided, the platform will fetch the definitions just once during startup.
         */
        pollingInterval?: number;

        /**
        * The request timeout for fetching application definitions from the remote source in milliseconds.
        * @default 3000
         */
        requestTimeout?: number;
    }

    export interface Supplier<T> {
        fetch(): Promise<T>;
        save?(elements: T): Promise<void>;
        delete?(elements: T): Promise<void>;
        timeout?: number;
        pollingInterval?: number;
    }

    export namespace Applications {

        export interface FDC3Definition {
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
            images?: Image[];

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
        export interface Image {
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
            [key: string]: unknown;
        }

        export interface Config {
            local?: Array<Glue42Web.AppManager.Definition | FDC3Definition>;
        }
    }

    export namespace Layouts {
        export interface Config {
            mode?: "idb" | "session";
            local?: Glue42Web.Layouts.Layout[];
        }
    }

    export namespace Channels {
        export interface ChannelMeta {
            color: string;
            [key: string]: any;
        }

        export interface ChannelDefinition {
            name: string;
            meta: ChannelMeta;
            data?: any;
        }

        export interface Config {
            definitions: ChannelDefinition[];
        }
    }

    export namespace Plugins {

        export interface PluginDefinition {
            name: string;
            config: unknown;
            start: (glue: Glue42Web.API, config: unknown) => void;
        }

        export interface Config {
            definitions: PluginDefinition[];
        }
    }

    export namespace Gateway {

        export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

        export type LogAppender = (logInfo: LogInfo) => void;

        export interface LogInfo {
            time: Date;
            output: string;
            level: string;
            line: number;
            message: string;
            namespace: string;
            stacktrace: string;
        }

        export interface Config {
            logging?: {
                level?: LogLevel;
                appender?: LogAppender;
            };
        }
    }

    export namespace Workspaces {
        export interface Config {
            src: string;
        }
    }

    export namespace Windows {
        export interface Config {
            windowResponseTimeoutMs?: number;
            defaultWindowOpenBounds?: Glue42Web.Windows.Bounds;
        }
    }

    export interface Config {
        clientOnly?: boolean;
        windows?: Windows.Config;
        applications?: Applications.Config;
        layouts?: Layouts.Config;
        channels?: Channels.Config;
        plugins?: Plugins.Config;
        gateway?: Gateway.Config;
        glue?: Glue42Web.Config;
        workspaces?: Workspaces.Config;
        glueFactory?: (config?: Glue42Web.Config) => Promise<Glue42Web.API>;
    }

    export interface API {
        version: string;
    }
}

export type Glue42WebPlatformFactoryFunction = (config?: Glue42WebPlatform.Config) => Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }>;

declare const WebPlatformFactory: Glue42WebPlatformFactoryFunction;

export default WebPlatformFactory;
