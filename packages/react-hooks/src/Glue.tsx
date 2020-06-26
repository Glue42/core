import React, { createContext, memo } from "react";
import { node, object, func } from "prop-types";
import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import { useGlueInit } from "./useGlueInit";
import { GlueProviderProps, Glue42ReactFactory } from "../react-hooks";

export const GlueContext = createContext<Glue42Web.API | Glue42.Glue>(null);

const getGlueFactory = (): Glue42ReactFactory => {
    return (window as any).GlueWeb || (window as any).Glue;
};

export const GlueProvider: React.FC<GlueProviderProps> = memo(
    ({ children, fallback = null, config = {}, glueFactory }) => {
        const factory = glueFactory || getGlueFactory();
        const glue = useGlueInit(config, factory);
        return glue ? (
            <GlueContext.Provider value={glue}>{children}</GlueContext.Provider>
        ) : (
            <>{fallback}</>
        );
    }
);

GlueProvider.propTypes = {
    children: node,
    config: object,
    glueFactory: func,
    fallback: node,
};

GlueProvider.displayName = "GlueProvider";
