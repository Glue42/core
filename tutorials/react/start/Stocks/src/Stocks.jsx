import React, { useEffect, useState } from 'react';
import { REQUEST_OPTIONS } from './constants';

function Stocks() {
    const [portfolio, setPortfolio] = useState([]);
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const url = '/api/portfolio';
                const response = await fetch(url, REQUEST_OPTIONS).then(r => r.json());
                setPortfolio(response);
            } catch (e) {
                console.log(e);
            }
        };
        fetchPortfolio();
    }, []);
    const showStockDetails = stock => {
        window.location.href = `http://${window.location.host}/details`;
        sessionStorage.setItem('stock', JSON.stringify(stock));
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-8">
                    <h1 id="title" className="text-center">
                        Stocks
                    </h1>
                </div>
            </div>
            <div className="row">
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
                                    key={RIC}
                                    onClick={() =>
                                        showStockDetails({ RIC, Description, Bid, Ask, ...rest })
                                    }
                                >
                                    <td>{RIC}</td>
                                    <td>{Description}</td>
                                    <td className="text-right">{Bid}</td>
                                    <td className="text-right">{Ask}</td>
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
