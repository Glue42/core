import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("getId() Should", () => {
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
