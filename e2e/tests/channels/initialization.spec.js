describe('initialization', () => {
    before(() => {
        return Promise.all([glueReady, gtfReady]);
    });

    const channelsAPIMethods = [
        "subscribe",
        "subscribeFor",
        "publish",
        "all",
        "list",
        "get",
        "join",
        "leave",
        "current",
        "my",
        "changed",
        "onChanged",
        "add"
    ];

    it("Should not be initialized when Glue42Web is called with an object that has a channels: false property.", async () => {
        const newGlue = await GlueWeb({ channels: false });

        expect(newGlue.channels).to.be.undefined;
    });

    it("Should be initialized when Glue42Web is called with an object that has a channels: true property.", async () => {
        const newGlue = await GlueWeb({ channels: true });

        expect(newGlue.channels).to.not.be.undefined;

        const registeredChannelsAPIProperties = [];
        for (const property in newGlue.channels) {
            registeredChannelsAPIProperties.push(property);
        }

        for (const channelsAPIMethod of channelsAPIMethods) {
            expect(registeredChannelsAPIProperties).to.include(channelsAPIMethod);
        }
    });
});
