import fdc3Factory from "./main";
import { WindowType } from "./types/windowtype";

let globalFdc3 = (window as WindowType).fdc3;

if (typeof globalFdc3 === "undefined") {
    globalFdc3 = fdc3Factory();

    (window as WindowType).fdc3 = globalFdc3;
} else {
    console.warn("Defaulting to using the auto-injected fdc3.");
}

export default globalFdc3;
