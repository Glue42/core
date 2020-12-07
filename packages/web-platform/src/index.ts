import { glueWebPlatformFactory } from "./factory";

if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).GlueWebPlatform = glueWebPlatformFactory;
}

export default glueWebPlatformFactory;
