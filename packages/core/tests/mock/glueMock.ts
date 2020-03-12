import { InteropMock } from "./InteropMock";

export class GlueMock {
    public interop: InteropMock;
    constructor() {
        this.interop = new InteropMock();
    }
}
