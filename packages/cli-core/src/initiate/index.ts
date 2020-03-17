import { InitiationController } from "./controller";
import { Npm } from "./npm";

const npm = new Npm();
export const initController = new InitiationController(npm);