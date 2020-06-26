describe("it should work", () => {
    it("should have Glue42 core version", async () => {
        const glue = await GlueWeb();
        expect(glue.version).to.be.a('string');
    });
});