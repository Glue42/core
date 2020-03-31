import { useEffect, useState } from "react";
import { useGlueInitProps } from "../react-hooks";

export const useGlueInit: useGlueInitProps = (config, glueFactory) => {
    const [glue, setGlue] = useState(null);
    useEffect(() => {
        const initialize = async () => {
            try {
                const glue = await glueFactory(config);
                setGlue(glue);
            } catch (e) {
                console.error(e);
            }
        };
        initialize();
    }, []);
    return glue;
};
