import React, { createContext, memo } from 'react';
import { node, object } from 'prop-types';
import { Glue42Web } from '@glue42/web';
import { Glue42 } from '@glue42/desktop';
import { useGlueInit } from './useGlueInit';
import { GlueProviderProps } from '../react-hooks';

export const GlueContext = createContext<Glue42Web.API | Glue42.Glue>(null);

export const GlueProvider: React.FC<GlueProviderProps> = memo(
    ({ children, fallback = null, settings = {} }) => {
        
        const glue = useGlueInit(settings);

        return glue ? (
            <GlueContext.Provider value={glue}>{children}</GlueContext.Provider>
        ) : (
            <>{fallback}</>
        );
    }
);

GlueProvider.propTypes = {
    children: node,
    settings: object,
    fallback: node,
};

GlueProvider.displayName = 'GlueProvider';
