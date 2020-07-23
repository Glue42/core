import fdc3Factory from "./main";

const fdc3 = fdc3Factory();
(window as any).fdc3 = fdc3;
(fdc3 as any).default = fdc3;

export default fdc3;
