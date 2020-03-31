import React, { useContext, useEffect, useState } from 'react';
import { useGlue, GlueContext } from '@glue42/react-hooks';
import { REQUEST_OPTIONS } from './constants';
import {
    createInstrumentStream,
    openStockDetails,
    registerSetClientMethod,
    subscribeForSharedContext,
    subscribeForInstrumentStream,
    setClientPortfolioSharedContext,
} from './glue';

function Stocks() {
    const [portfolio, setPortfolio] = useState([]);
    const [prices, setPrices] = useState({});
    const [{ clientId, clientName }, setClient] = useState({});
    useGlue(registerSetClientMethod(setClient));
    useGlue(subscribeForSharedContext(setClient));
    useGlue(createInstrumentStream);
    const subscription = useGlue(
        (glue, portfolio) => {
            if (portfolio.length > 0) {
                return subscribeForInstrumentStream(setPrices)(glue, portfolio);
            }
        },
        [portfolio]
    );
    const onClick = useGlue(openStockDetails);
    const updateClientContext = useGlue(setClientPortfolioSharedContext);
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                subscription && typeof subscription.close === 'function' && subscription.close();
                const url = clientId ? `/api/portfolio/${clientId}` : '/api/portfolio';
                const response = await fetch(url, REQUEST_OPTIONS).then(r => r.json());
                setPortfolio(response);
            } catch (e) {
                console.log(e);
            }
        };
        fetchPortfolio();
    }, [clientId]);

    const glue = useContext(GlueContext);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2">
                    {!glue && (
                        <span id="glueSpan" className="badge badge-warning">
                            Glue is unavailable
                        </span>
                    )}
                    {glue && (
                        <span id="glueSpan" className="badge badge-success">
                            Glue is available
                        </span>
                    )}
                </div>
                <div className="col-md-8">
                    <h1 id="title" className="text-center">
                        Stocks
                    </h1>
                </div>
            </div>
            <button
                type="button"
                className="mb-3 btn btn-primary"
                onClick={() => updateClientContext({})}
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
