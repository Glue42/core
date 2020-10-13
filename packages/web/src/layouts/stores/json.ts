import { RemoteStore } from "../types";
import { Glue42Web } from "../../../web";
import { layoutTypeDecoder, layoutDecoder } from "../validation/";
import { defaultLayoutsName } from "../../config/defaults";
import { fetchTimeout } from "../../utils";

export class JSONStore implements RemoteStore {

    constructor(private readonly storeBaseUrl: string) { }

    public async getAll(layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {

        layoutTypeDecoder.runWithException(layoutType);

        const fetchUrl = `${this.storeBaseUrl}/${defaultLayoutsName}`;

        const response = await fetchTimeout(fetchUrl);

        if (!response.ok) {
            return [];
        }

        let layouts;
        try {
            layouts = await response.json();
        } catch (error) {
            return [];
        }

        if (!layouts) {
            return [];
        }

        const layoutProp = layoutType === "Global" ? "globals" : "workspaces";

        const layoutsToVerify = (layouts[layoutProp] || []) as Glue42Web.Layouts.Layout[];

        return layoutsToVerify.filter((layout) => {
            const decodeResult = layoutDecoder.run(layout);

            if (!decodeResult.ok) {
                // tslint:disable-next-line:no-console
                console.warn(`Fetched layout: ${layout.name} is discarded, because it failed the validation: ${JSON.stringify(decodeResult)}`);
            }

            return decodeResult.ok;
        });
    }

    public async get(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {

        const allLayouts = await this.getAll(layoutType);

        return allLayouts.find((layout) => layout.name === name);
    }
}
