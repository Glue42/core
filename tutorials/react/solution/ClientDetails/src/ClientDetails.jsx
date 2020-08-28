import React, { useState } from 'react';
import { useGlue } from '@glue42/react-hooks';
import { setClientFromWorkspace } from './glue';

function ClientDetails() {
    const [client, setClient] = useState({});
    useGlue(setClientFromWorkspace(setClient));
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <h1 className="text-center">Client Details</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h3 id="clientStatus"></h3>
                </div>
            </div>
            <div className="row">
                <table id="clientsTable" className="table table-hover">
                    <tbody>
                        <tr>
                            <th>Full Name</th>
                            <td data-name>{client && client.clientName}</td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td data-address>{client && client.address}</td>
                        </tr>
                        <tr>
                            <th>Phone Number</th>
                            <td data-phone>{client && client.contactNumbers}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td data-email>{client && client.email}</td>
                        </tr>
                        <tr>
                            <th>Account Manager</th>
                            <td data-manager>{client && client.accountManager}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClientDetails;