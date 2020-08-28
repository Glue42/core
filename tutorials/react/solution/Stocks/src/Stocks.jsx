import React, { useContext, useEffect, useState } from 'react';
import { useGlue, GlueContext } from '@glue42/react-hooks';
import { REQUEST_OPTIONS, NO_CHANNEL_VALUE } from './constants';
import {
    createInstrumentStream,
    subscribeForInstrumentStream,
    getChannelNamesAndColors,
    joinChannel,
    subscribeForChannels,
    getMyWindowContext,
    setClientFromWorkspace,
    openStockDetailsInWorkspace
} from './glue';
import ChannelSelectorWidget from './ChannelSelectorWidget';

function Stocks() {
    const [portfolio, setPortfolio] = useState([]);
    const [prices, setPrices] = useState({});
    const [{ clientId, clientName }, setClient] = useState({});
    const [currentChannel, setCurrentChannel] = useState({});
    const setDefaultClient = () => setClient({ clientId: "", clientName: "" });
    const [channelWidgetState, setChannelWidgetState] = useState(false);
    const windowContext = useGlue(getMyWindowContext) || {};
    useGlue(subscribeForChannels(setClient));
    useGlue(createInstrumentStream);
    const subscription = useGlue(
        (glue, portfolio) => {
            if (portfolio.length > 0) {
                return subscribeForInstrumentStream(setPrices)(glue, portfolio);
            }
        },
        [portfolio]
    );
    const onClick = useGlue(openStockDetailsInWorkspace);
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                subscription && typeof subscription.close === 'function' && subscription.close();
                const url = 'http://localhost:8080' + (clientId ? `/api/portfolio/${clientId}` : '/api/portfolio');
                const response = await fetch(url, REQUEST_OPTIONS);
                const portfolio = await response.json();
                setPortfolio(portfolio);
            } catch (e) {
                console.log(e);
            }
        };
        fetchPortfolio();
    }, [clientId]);

    const glue = useContext(GlueContext);
    useGlue(setClientFromWorkspace(setClient));
    // Get the channel names and colors and pass them as props to the ChannelSelectorWidget component.
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    // The callback that will join the newly selected channel. Pass it as props to the ChannelSelectorWidget component to be called whenever a channel is selected.
    const onChannelSelected = useGlue(joinChannel); 
    useEffect(() => {
        if (windowContext.channel) {
            setCurrentChannel(windowContext.channel);
            if (onChannelSelected) {
                onChannelSelected({ value: windowContext.channel.name });
            }
        } else {
            setCurrentChannel({ value: NO_CHANNEL_VALUE, label: NO_CHANNEL_VALUE });
        }
    }, [windowContext.channel, onChannelSelected]);
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2">
                    {!glue && (
                        <span id="glueSpan" className="badge badge-warning">
                            Glue42 is unavailable
                        </span>
                    )}
                    {glue && (
                        <span id="glueSpan" className="badge badge-success">
                            Glue42 is available
                        </span>
                    )}
                </div>
                <div className="col-md-8">
                    <h1 id="title" className="text-center">
                        Stocks
                    </h1>
                </div>
                <div className="col-md-2 align-self-center">
                    <ChannelSelectorWidget
                        value={currentChannel}
                        key={channelWidgetState}
                        channelNamesAndColors={channelNamesAndColors}
                        onChannelSelected={channel => {
                            onChannelSelected(channel);
                            setCurrentChannel(channel);
                        }}
                        onDefaultChannelSelected={channel => {
                            setDefaultClient();
                            onChannelSelected(channel);
                            setCurrentChannel({ value: NO_CHANNEL_VALUE, label: NO_CHANNEL_VALUE });
                        }}
                    />
                </div>
            </div>
            <button
                type="button"
                className="mb-3 btn btn-primary"
                onClick={() => {
                    setChannelWidgetState(!channelWidgetState);
                    setDefaultClient();
                }}
            >
                Show All
            </button>
            <div className="row">
                {clientId && (
                    <h2 className="p-3">
                        Client {clientName} - {clientId}
                    </h2>
                )}
                <div className="col-md-12">
                    <table id="portfolioTable" className="table table-hover">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Description</th>
                                <th className="text-right">Bid</th>
                                <th className="text-right">Ask</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
                                <tr
                                    onClick={() => onClick({ ...rest, RIC, Description })}
                                    key={RIC}
                                >
                                    <td>{RIC}</td>
                                    <td>{Description && Description.toUpperCase()}</td>
                                    <td className="text-right">
                                        {prices[RIC] ? prices[RIC].Bid : Bid}
                                    </td>
                                    <td className="text-right">
                                        {prices[RIC] ? prices[RIC].Ask : Ask}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Stocks;
