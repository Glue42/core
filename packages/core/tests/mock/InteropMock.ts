import { WaitForResult, waitForArr } from "../helpers";
import { expect } from "chai";
import isMatch from "lodash.ismatch";

export class InteropMock {
    private methodExpectations: Array<WaitForResult<any>> = [];
    private methodsRepo: Array<{ name: string }> = [];

    public addMethod(name: string) {
        this.methodsRepo.push({ name });
    }

    public invoke(method: any, argumentObj?: object): Promise<any> {
        argumentObj = argumentObj ?? {};
        const methodName = method.name || method;
        const expectation = this.methodExpectations.find((wf) => wf.tag.method === methodName);
        if (expectation) {
            const next = expectation.next();
            if (expectation.tag.check === "strict") {
                expect(next).to.eql(argumentObj);
            } else {
                const matching = isMatch(argumentObj, next);
                expect(matching).to.eql(true);
            }
            expectation.fn(next);
        }
        return Promise.resolve();
    }

    public methods(filter?: any) {
        return this.methods;
    }

    public expectMethodToBeInvokedWith(method: string, args: any[], check: "strict" | "subset" = "strict") {
        this.addMethod(method);
        const wf = waitForArr(args, true, { method, check });
        this.methodExpectations.push(wf);
        return wf.promise;
    }
}
