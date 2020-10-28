import fdc3Factory from "./main";
import { WindowType } from "./types/windowtype";

const fdc3 = fdc3Factory();

if (typeof (window as WindowType).fdc3 === "undefined") {
    (window as WindowType).fdc3 = fdc3;
} else {
    console.warn("Defaulting to using the auto-injected fdc3.");
}

export default fdc3;
