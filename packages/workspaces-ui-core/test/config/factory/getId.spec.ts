import  { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";
import sinon from "sinon";

describe("getId() Should", () => {
    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })
    Array.from({ length: 5 }).forEach((_, i) => {
        it(`return an unique id when invoked ${i + 1} times`, () => {
            const ids = Array.from({ length: i + 1 }).map(() => {
                return factory.getId();
            });
            const uniqueIds = ids.filter((id, i, self) => self.indexOf(id) === i);

            expect(uniqueIds.length).to.eql(ids.length);
        });
    });
});
