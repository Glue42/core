import { useContext, useEffect, useState } from "react";
import { GlueContext } from "./Glue";
import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";

export const useGlue = <K = Glue42Web.API | Glue42.Glue, T = void>(
    cb: (glue: K, ...dependencies: any[]) => Promise<T> | T,
    dependencies: any[] = []
): T => {
    const [result, setResult] = useState<T>();
    const glue: any = useContext(GlueContext);
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
