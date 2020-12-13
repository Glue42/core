describe('initialization', () => {
    before(() => {
        return coreReady;
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

    it("Should be initialized correctly.", async () => {
        expect(glue.channels).to.not.be.undefined;

        const registeredChannelsAPIProperties = [];
        for (const property in glue.channels) {
            registeredChannelsAPIProperties.push(property);
        }

        for (const channelsAPIMethod of channelsAPIMethods) {
            expect(registeredChannelsAPIProperties).to.include(channelsAPIMethod);
        }
    });
});
