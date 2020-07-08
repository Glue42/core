import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("getWorkspaceTitle() Should", () => {
    it("return an unique title", () => {
        const titles = ["one", "two", "three"];
        const newTitle = factory.getWorkspaceTitle(titles);

        const isTitleUnique = titles.indexOf(newTitle) === -1;

        expect(isTitleUnique).to.be.true;
    });
});
