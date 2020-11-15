import { GlueContext } from "@glue42/react-hooks";
import React, { useContext } from "react"

const withGlueInstance = <T extends { glue?: any }>(WrappedComponent: React.ComponentType<T>) => {
    return (props: T) => {
        const glue = props.glue || (window as any).glue || useContext(GlueContext);
        if (!glue) {
            throw new Error("An instance of Glue is not provided");
        }
        return (
            <WrappedComponent {...Object.assign({}, props, { glue })} />
        )
    }
}

export default withGlueInstance;