import React, { useState, useContext } from 'react';
import { useGlue, GlueContext } from '@glue42/react-hooks';
import {
    subscribeForInstrumentStream,
    getMyWindowContext,
    subscribeForSharedContext,
} from './glue';

function StockDetails() {
    const [{ clientId, clientName, portfolio }, setClient] = useState({});
    const [{ Bid, Ask }, setPrices] = useState({});
    const glue = useContext(GlueContext);
    const windowContext = useGlue(getMyWindowContext);
    const { symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues } = {} } =
        windowContext || {};
    useGlue(subscribeForInstrumentStream(setPrices), [RIC]);
    useGlue(subscribeForSharedContext(setClient));

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
                <div className="col-md-10">
                    <h1 className="text-center">Stock {RIC} Details</h1>
                </div>
            </div>
            <div className="row">
                {clientId && (
                    <>
                        <h2 className="p-3">
                            Client {clientName} - {clientId}{' '}
                        </h2>
                        {RIC && portfolio.length && !portfolio.includes(RIC) && (
                            <h4 className="p-3">
                                Client does not have this instrument in the portfolio
                            </h4>
                        )}
                    </>
                )}
                <div className="col-md-12">
                    <table id="clientsTable" className="table table-hover">
                        <tbody>
                            <tr>
                                <th>RIC</th>
                                <td>{RIC}</td>
                            </tr>
                            <tr>
                                <th>BPOD</th>
                                <td>{BPOD}</td>
                            </tr>
                            <tr>
                                <th>Bloomberg</th>
                                <td>{Bloomberg}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{Description && Description.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <th>Exchange</th>
                                <td>{Exchange}</td>
                            </tr>
                            <tr>
                                <th>Venues</th>
                                <td>{Venues}</td>
                            </tr>
                            <tr>
                                <th>Bid</th>
                                <td>{Bid}</td>
                            </tr>
                            <tr>
                                <th>Ask</th>
                                <td>{Ask}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StockDetails;
