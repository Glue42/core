import React, { createContext, memo } from "react";
import { node, object, func } from "prop-types";
import GlueWeb from "@glue42/web";
import { Glue42Core } from "@glue42/core";
import { useGlueInit } from "./useGlueInit";
import { GlueProviderProps } from "../react-hooks";

export const GlueContext = createContext<Glue42Core.GlueCore>(null);

export const GlueProvider: React.FC<GlueProviderProps> = memo(
    ({ children, fallback = null, config = {}, glueFactory = GlueWeb }) => {
        const glue = useGlueInit(config, glueFactory);
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
