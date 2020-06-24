import { Glue42Web } from "../../web";
import { defaultConfigLocation, defaultConfig, defaultWorkerName } from "./defaults";
import { Glue42CoreConfig } from "../glue.config";
import { fetchTimeout } from "../utils";

const getRemoteConfig = async (userConfig: Glue42Web.Config): Promise<Glue42CoreConfig> => {
    // check userConfig, if not there check defaultConfig, if not there use the defaultConfigLocation
    const extend: string | false = userConfig.extends ?? defaultConfig.extends ?? defaultConfigLocation;
    if (extend === false) {
        // user has disabled extending the config
        return {};
    }
    let response: Response;
    try {
        response = await fetchTimeout(extend);
        if (!response.ok) {
            return {};
        }

        const json = await response.json();
        return json ?? {};
    } catch {
        return {};
    }
};

export const buildConfig = async (userConfig?: Glue42Web.Config): Promise<Glue42CoreConfig> => {
    userConfig = userConfig ?? {};
    const remoteConfig = await getRemoteConfig(userConfig);

    // merge user->remote->default
    const resultWebConfig: Glue42Web.Config = {
        ...defaultConfig,
        ...remoteConfig.glue,
        ...userConfig
    };

    // if we have extends options, we need to set the worker location to be the same
    // because worker is always on the same level as custom config
    if (resultWebConfig?.extends) {
        const lastIndex = resultWebConfig.extends.lastIndexOf("/");
        const worker = resultWebConfig.extends.substr(0, lastIndex + 1) + defaultWorkerName;
        resultWebConfig.worker = worker;
    }
    return {
        ...remoteConfig,
        glue: resultWebConfig
    };
};
