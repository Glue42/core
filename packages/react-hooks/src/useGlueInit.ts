import { useEffect, useState } from "react";
import { UseGlueInitFunc } from "../react-hooks";

export const useGlueInit: UseGlueInitFunc = (settings) => {
    const [glue, setGlue] = useState(null);
    useEffect(() => {
        const initialize = async () => {
            try {
                if (settings.web && settings.web) {
                    throw new Error("Cannot initialize, because the settings are over-specified: defined are both web and webPlatform. Please set one or the other");
                }

                const isEnterprise = typeof (window as any).glue42gd !== "undefined";

                if (isEnterprise) {
                    const factory = settings.desktop?.factory || settings.web?.factory || settings.webPlatform?.factory || (window as any).Glue;
                    const config = settings.desktop?.config || settings.web?.config || settings.webPlatform?.config;

                    const glue = await factory(config);

                    setGlue(glue);
                    return;
                }

                const webFactory = settings.web?.factory || (window as any).GlueWeb;
                const webPlatformFactory = settings.webPlatform?.factory || (window as any).GlueWebPlatform;

                const config = settings.web?.config || settings.webPlatform?.config;
                const factory = webFactory || webPlatformFactory;

                const glue = await factory(config);
                setGlue(glue);
            } catch (e) {
                console.error(e);
            }
        };
        initialize();
    }, []);
    return glue;
};
