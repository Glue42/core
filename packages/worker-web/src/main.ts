import { GatewayConfig } from "./glue.config";
import { defaultConfigLocation, defaultLocation } from "./defaults";
import { startGateway } from "./gateway";
import { glue42CoreConfigDecoder } from "./validation";
import { Err } from "@mojotech/json-type-validation/dist/types/result";
import { DecoderError } from "@mojotech/json-type-validation/dist/types/decoder";
import { Gateway } from "./gateway.d";

declare let onconnect: (e: MessageEvent) => void;

const fetchTimeout = (url: string, timeoutMilliseconds = 3000): Promise<Response> => {
    return new Promise((resolve, reject) => {
        let timeoutHit = false;
        const timeout = setTimeout(() => {
            timeoutHit = true;
            reject(new Error(`Fetch request for: ${url} timed out at: ${timeoutMilliseconds} milliseconds`));
        }, timeoutMilliseconds);

        fetch(url)
            .then((response) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    resolve(response);
                }
            })
            .catch((err) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });
    });
};

const getConfig = async (): Promise<GatewayConfig> => {
    const response = await fetchTimeout(defaultConfigLocation);

    if (!response.ok) {
        console.warn(`Fetching Glue42 Config from: ${response.url} failed with status: ${response.statusText}. Falling back to defaults`);
        return {
            location: defaultLocation
        };
    }

    const json: unknown = await response.json();

    const decoderResult = glue42CoreConfigDecoder.run(json);

    if (!decoderResult.ok) {
        console.warn(`Error validating the provided Glue42 Config: ${(decoderResult as Err<DecoderError>).error.message}, falling back to defaults`);
        return {
            location: defaultLocation
        };
    }

    const config = decoderResult.result;

    const gatewayConfig: GatewayConfig = Object.assign({}, { location: defaultLocation }, config.gateway);

    return gatewayConfig;
};

export const start = (): void => {
    const gwReadyPromise = getConfig()
        .catch((error) => {
            console.warn("Error building the Glue42 Worker Config, falling back to defaults. Inner error:");
            console.warn(error);
            return {
                location: defaultLocation
            };
        })
        .then(startGateway)
        .catch((error) => {
            console.error("Gateway initialization failed. Inner error:");
            console.error(error);
        });

    onconnect = (e): void => {
        gwReadyPromise.then((gateway: Gateway) => {
            if (!gateway) {
                return;
            }
            const port = e.ports[0];

            const clientConnection = gateway.connect((_client: object, msg: string) => port.postMessage(msg));

            port.onmessage = (e): void => {
                clientConnection.then((client) => client.send(e.data));
            };
        });

    };

};
