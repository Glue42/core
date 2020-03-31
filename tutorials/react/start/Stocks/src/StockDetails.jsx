import React from 'react';

function StockDetails() {
    const { RIC, BPOD, Bloomberg, Description, Exchange, Venues, Bid, Ask } =
        JSON.parse(sessionStorage.getItem('stock')) || {};

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-10">
                    <h1 className="text-center">Stock {RIC} Details</h1>
                </div>
            </div>
            <div className="row">
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
                            <td>{Description}</td>
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
    );
}

export default StockDetails;
