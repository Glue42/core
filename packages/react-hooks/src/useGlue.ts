import { useContext, useEffect, useState } from "react";
import { GlueContext } from "./Glue";
import { Glue42Core } from "@glue42/core";

export const useGlue = <T = undefined>(
    cb: (glue: Glue42Core.GlueCore, ...dependencies: any[]) => void | Promise<T> | T,
    dependencies: any[] = []
): T => {
    const [result, setResult] = useState<T>();
    const glue = useContext(GlueContext);
    useEffect(() => {
        const callback = async () => {
            try {
                const result = await cb(glue, ...dependencies);
                typeof result !== "undefined" &&
                    setResult(typeof result === "function" ? () => result : result);
            } catch (e) {
                console.error(e);
            }
        };
        glue && callback();
    }, [glue, ...dependencies]);
    return result;
};
