import { Glue42Web } from "../../../packages/web/web";
import { Gtf } from "./types";

export class GtfWindows implements Gtf.Windows {
    private counter = 0;

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

    public async closeAllOtherWindows(): Promise<void> {
        const myWindowsId = this.glue.windows.my().id;

        const allWindows = this.glue.windows.list();
        const otherWindows = allWindows.filter((windows) => windows.id !== myWindowsId);

        console.log(otherWindows.length > 0 ? `Closing windows: ${otherWindows.map(windows => windows.id)}` : "No windows to close!");

        await Promise.all(otherWindows.map((windows) => windows.close().then(() => console.log(`Closed window ${windows.id}`))));
    }
}
