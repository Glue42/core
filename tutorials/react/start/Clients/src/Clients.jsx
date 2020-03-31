import React, { useEffect, useState } from 'react';
import { REQUEST_OPTIONS } from './constants';

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

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-10">
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
                        {clients.map(({ name, pId, gId, accountManager }) => (
                            <tr key={pId}>
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
