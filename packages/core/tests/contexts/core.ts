import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { dataStore } from "../data";
import { generate } from "shortid";
// tslint:disable:no-unused-expression

describe("contexts.core", () => {

    let glue!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
    });

    afterEach(() => {
        doneAllGlues();
    });

    it("check if set works correctly", (done) => {
        const data: Update[] = dataStore.map((i) => {
            return {
                data: i
            };
        });
        verify(data, done, true);
    });

    it("basic update - adding props", (done) => {
        const data: Update[] = [
            { data: { a: 1 } },
            { data: { b: 2 }, expected: { a: 1, b: 2 } },
            { data: { a: 3, b: 3 }, expected: { a: 3, b: 3 } }];
        verify(data, done);
    });

    it("basic update - removing props", (done) => {
        const data: Update[] = [
            { data: { a: 1, b: 1 } },
            { data: { b: null }, expected: { a: 1 } },
            { data: { a: null }, expected: {} }];
        verify(data, done);
    });

    it("basic update - 2nd level object", (done) => {

        const data: Update[] = [
            { data: { a: { aa: 1 }, b: 1 } },
            { data: { a: { bb: 2 } }, expected: { a: { aa: 1, bb: 2 }, b: 1 } }
        ];
        verify(data, done);
    });

    interface Update {
        data: object;
        expected?: object;
    }

    function verify(data: Update[], done: (err?: any) => void, shouldSet?: boolean) {
        let index = -1;
        const ctxName = getContextName();
        const update = () => {
            index++;
            if (index >= data.length) {
                done();
                return;
            }
            const updateData = data[index].data;
            if (shouldSet) {
                glue.contexts.set(ctxName, updateData);
            } else {
                glue.contexts.update(ctxName, updateData);
            }
        };

        glue.contexts.subscribe(ctxName, ((d) => {
            try {
                const expectedData = data[index].expected || data[index].data;
                expect(d).to.deep.equal(expectedData);
            } catch (e) { done(e); }
            update();
        })).then(() => {
            // trigger initial update
            update();
        });
    }

    function getContextName() {
        return generate();
    }
});
