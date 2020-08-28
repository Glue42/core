import React, { useEffect, useState, useContext } from 'react';
import { useGlue, GlueContext } from '@glue42/react-hooks';
import { REQUEST_OPTIONS } from './constants';
// eslint-disable-next-line no-unused-vars
import { setClientPortfolioInterop, setClientPortfolioSharedContext, getChannelNamesAndColors, joinChannel, setClientPortfolioChannels, startApp, startAppWithWorkspace } from './glue';
import ChannelSelectorWidget from './ChannelSelectorWidget';

function Clients() {
    const [clients, setClients] = useState([]);
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/clients', REQUEST_OPTIONS);
                const clients = await response.json();
                setClients(clients);
            } catch (e) {
                console.log(e);
            }
        };
        fetchClients();
    }, []);

    // Get the channel names and colors and pass them as props to the ChannelSelectorWidget component.
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    // The callback that will join the newly selected channel. Pass it as props to the ChannelSelectorWidget component to be called whenever a channel is selected.
    const onChannelSelected = useGlue(joinChannel);
    
    // const onClick = useGlue(setClientPortfolioInterop);

    const onClickContext = useGlue(setClientPortfolioSharedContext);

    const onClick = useGlue(setClientPortfolioChannels);

    const startStocksApp = useGlue(startApp);
    const glue = useContext(GlueContext);
    const openWorkspace = useGlue(startAppWithWorkspace);

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
                    <h1 className="text-center">Clients</h1>
                </div>
                <div className="col-md-2 align-self-center">
                    <ChannelSelectorWidget
                        channelNamesAndColors={channelNamesAndColors}
                        onChannelSelected={onChannelSelected}
                        onDefaultChannelSelected={onChannelSelected}
                    />
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
                        {clients.map(({ name, pId, gId, accountManager, portfolio, ...rest }) => (
                            <tr
                                key={pId}
                                onClick={() => {
                                        openWorkspace({ clientId: gId, clientName: name, accountManager, portfolio, ...rest });
                                    }
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
