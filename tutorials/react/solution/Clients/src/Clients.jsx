import React, { useEffect, useState, useContext } from 'react';
import { useGlue, GlueContext } from '@glue42/react-hooks';
import { REQUEST_OPTIONS } from './constants';
// eslint-disable-next-line no-unused-vars
import { setClientPortfolioInterop, setClientPortfolioSharedContext } from './glue';

function Clients() {
    const [clients, setClients] = useState([]);
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/clients', REQUEST_OPTIONS).then(r => r.json());
                setClients(response);
            } catch (e) {
                console.log(e);
            }
        };
        fetchClients();
    }, []);

    const onClick = useGlue(setClientPortfolioInterop);
    // const onClick = useGlue(setClientPortfolioSharedContext);
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
                    <h1 className="text-center">Clients</h1>
                </div>
            </div>
            <div className="row">
                <table id="clientsTable" className="table table-hover">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>PID</th>
                            <th>GID</th>
                            <th>Account Manager</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(({ name, pId, gId, accountManager, portfolio }) => (
                            <tr
                                key={pId}
                                onClick={() =>
                                    onClick({ clientId: gId, clientName: name, portfolio })
                                }
                            >
                                <td>{name}</td>
                                <td>{pId}</td>
                                <td>{gId}</td>
                                <td>{accountManager}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Clients;
