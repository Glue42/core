import { Glue42Web } from "../../../packages/web/web";
import { Gtf } from "./types";

export class GtfWindows implements Gtf.Windows {
    private counter = 0;
    public readonly PLATFORM_DIMENSIONS = {
        top: 395,
        left: 405,
        width: 390,
        height: 410
    };
    public readonly PLATFORM_DETAILS = Object.freeze({
        name: "Platform",
        title: "Platform",
        url: "http://localhost:9999/context.html",
        ...this.PLATFORM_DIMENSIONS
    });
    public readonly SUPPORT_DIMENSIONS = {
        top: 195,
        left: 205,
        width: 190,
        height: 210
    };
    public readonly SUPPORT_DETAILS = Object.freeze({
        title: "Core Support",
        url: "http://localhost:4242/coreSupport/index.html",
        ...this.SUPPORT_DIMENSIONS
    });

    constructor(private readonly glue: Glue42Web.API) {
    }

    public getWindowName(): string {
        this.counter++;
        return `windows.integration.tests.window.${Date.now()}.${this.counter}`;
    }

    public async compareWindows(actualWindow: Glue42Web.Windows.WebWindow, expectedWindow: Glue42Web.Windows.WebWindow): Promise<boolean> {
        const [
            actualUrl, actualTitle, actualBounds, actualContext,
            expectedUrl, expectedTitle, expectedBounds, expectedContext
        ] = await Promise.all([
            actualWindow.getURL(), actualWindow.getTitle(), actualWindow.getBounds(), actualWindow.getContext(),
            expectedWindow.getURL(), expectedWindow.getTitle(), expectedWindow.getBounds(), expectedWindow.getContext()
        ]);

        return actualWindow.id === expectedWindow.id &&
            actualWindow.name === expectedWindow.name &&
            actualUrl === expectedUrl &&
            actualTitle === expectedTitle &&
            JSON.stringify(actualBounds) === JSON.stringify(expectedBounds) &&
            JSON.stringify(actualContext) === JSON.stringify(expectedContext);
    }

    public async compareClosedWindows(actualWindow: Glue42Web.Windows.WebWindow, expectedWindow: Glue42Web.Windows.WebWindow): Promise<boolean> {
        return actualWindow.id === expectedWindow.id &&
            actualWindow.name === expectedWindow.name
    }

    public async closeAllOtherWindows(): Promise<void> {
        const myWindowId = this.glue.windows.my().id;
        const platformWindowId = (await this.getPlatformWindow()).id;

        const allWindows = this.glue.windows.list();
        const otherWindows = allWindows.filter((window) => window.id !== myWindowId && window.id !== platformWindowId);

        await Promise.all(otherWindows.map((window) => window.close()));
    }

    public async getPlatformWindow(): Promise<Glue42Web.Windows.WebWindow> {
        const allWindows = await this.glue.windows.list();

        return allWindows.find((window) => window.name === this.PLATFORM_DETAILS.name);
    }

    public async resetTitles(): Promise<void> {
        const myWindow = this.glue.windows.my();
        const platformWindow = await this.getPlatformWindow();

        const promisesToAwait = [platformWindow.setTitle(this.PLATFORM_DETAILS.title)];

        if (this.glue.windows.my().id !== platformWindow.id) {
            promisesToAwait.push(myWindow.setTitle(this.SUPPORT_DETAILS.title));
        }

        await Promise.all(promisesToAwait);
    }

    public async resetWindowContexts(): Promise<void> {
        const myWindow = this.glue.windows.my();
        const platformWindow = await this.getPlatformWindow();

        const promisesToAwait = [platformWindow.setContext({})];

        if (this.glue.windows.my().id !== platformWindow.id) {
            promisesToAwait.push(myWindow.setContext({}));
        }

        await Promise.all(promisesToAwait);
    }

    public async resetWindowDimensions(): Promise<void> {
        const myWindow = this.glue.windows.my();
        const platformWindowId = (await this.getPlatformWindow()).id;

        if (this.glue.windows.my().id !== platformWindowId) {
            await myWindow.moveResize(this.SUPPORT_DIMENSIONS);
        }
    }
}
