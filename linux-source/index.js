var fs = require('./fs');
var IPC = require('node-ipc').IPCModule;
var P3 = require('./node-p3');
var Util=require('./util');
var os = require('os');
var $Home = os.homedir();
var argv = process.argv.slice(2);

(async () => {
    var ipc = new IPC();
    ipc.config.retry = 1500;
    ipc.config.id = 'mikep3';
    var ports = {};
    var clients = {};
    var notifiers = {};
    if(!await fs.exists(`${$Home}/.mikep3`)) {
        await fs.mkdir(`${$Home}/.mikep3`);
    }
    if(!await fs.exists(`${$Home}/.mikep3/config.json`)) {
        await fs.writestr(
            `${$Home}/.mikep3/config.json`,
            JSON.stringify({
                secret: null,
                auto_connect: false
            })
        );
    };
    var config=JSON.parse(await fs.readstr(`${$Home}/.mikep3/config.json`));
    var p3 = new P3({
        secret: config.secret,
        autoinit: Boolean(config.auto_connect||false)
    });
    if(!config.secret) {
        config.secret = p3.key;
        await fs.writestr(
            `${$Home}/.mikep3/config.json`,
            JSON.stringify(config)
        );
    }
    ipc.serve(
        '/tmp/svc.mikep3',
        function () {
            ipc.server.on('SetP3Key', async function (data) {
                if(p3.active) { return }
                p3.key = data;
                config.secret = p3.key;
                await fs.writestr(
                    `${$Home}/.mikep3/config.json`,
                    JSON.stringify(config)
                );
            });
            ipc.server.on('GetConfig', function(data,socket) {
                if(!data.reqid) { return; }
                if(data.prop == 'p3_address') {
                    ipc.server.emit(
                        socket,
                        'GetConfig_'+data.reqid,
                        {
                            address: p3.adr,
                            connected: p3.active,
                            success: true
                        }
                    );
                } else if(data.prop == 'secret_key') {
                    ipc.server.emit(
                        socket,
                        'GetConfig_'+data.reqid,
                        {
                            secret: p3.key,
                            success: true
                        }
                    )
                } else if(data.prop == 'all_settings') {
                    ipc.server.emit(
                        socket,
                        'GetConfig_'+data.reqid,
                        {
                            secret: p3.key,
                            success: true,
                            connected: p3.active,
                            address: p3.adr
                        }
                    );
                } else {
                    ipc.server.emit(
                        socket,
                        'GetConfig_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'InvalidRequest',
                                code: 400,
                                message: 'The specified setting does not exist'
                            }
                        }
                    )
                }
            });
            ipc.server.on('NewClient', function (data,socket) {
                if(!data.reqid) { return; }
                if(!(
                    data.dest &&
                    (data.dest.address && data.dest.port)
                )) {
                    ipc.server.emit(
                        socket,
                        'NewClient_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'InvalidRequest',
                                code: 400,
                                message: 'The destination address and/or port were not specified'
                            }
                        }
                    )
                    return;
                }
                ipc.server.emit(
                    socket,
                    'NewClient_'+data.reqid,
                    {
                        success: true,
                        type: 'preperation',
                        data: null,
                        state: 0
                    }
                );
                var clientId = data.reqid;
                var client = p3.createClient(data.dest.address, data.dest.port);
                clients[data.reqid] = {
                    socket: socket,
                    client: client
                };
                client.on('fail',error => {
                    ipc.server.emit(
                        socket,
                        'Client_'+data.reqid,
                        {
                            success: false,
                            type: 'rejected',
                            data: null,
                            state: -1,
                            error: {
                                type: 'ServerError',
                                code: 500,
                                message: 'An error occurred connecting to the P3 server',
                                details: error
                            }
                        }
                    );
                    clients[clientId] = undefined;
                    delete clients[clientId];
                });
                client.on('connect', () => {
                    ipc.server.emit(
                        socket,
                        'Client_'+data.reqid,
                        {
                            success: true,
                            type: 'connected',
                            data: null,
                            state: 1
                        }
                    )
                });
                client.on('message', msg => {
                    ipc.server.emit(
                        socket,
                        'Client_'+data.reqid,
                        {
                            success: true,
                            type: 'message',
                            data: msg,
                            state: 1
                        }
                    )
                });
                client.on('disconnect', () => {
                    ipc.server.emit(
                        socket,
                        'Client_'+data.reqid,
                        {
                            success: true,
                            type: 'disconnect',
                            data: null,
                            state: 2
                        }
                    );
                    clients[clientId] = undefined;
                    delete clients[clientId];
                });
            });
            ipc.server.on('ClientEmit', function (data, socket) {
                if(!data.reqid) { return; }
                if(!clients[data.id]) {
                    ipc.server.emit(
                        socket,
                        'ClientEmit_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'NoClient',
                                code: 404,
                                message: 'The client you requested to emit to does not exist'
                            }
                        }
                    );
                } else {
                    ipc.server.emit(
                        socket,
                        'ClientEmit_'+data.reqid,
                        {
                            success: true
                        }
                    );
                    clients[data.id].emit(
                        data.data
                    );
                }
            });
            ipc.server.on('ClientKill', function (data, socket) {
                if(!data.reqid) { return; }
                if(!clients[data.id]) {
                    ipc.server.emit(
                        socket,
                        'ClientKill_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'NoClient',
                                code: 404,
                                message: 'The client you requested to emit to does not exist'
                            }
                        }
                    );
                } else {
                    ipc.server.emit(
                        socket,
                        'ClientKill_'+data.reqid,
                        {
                            success: true
                        }
                    );
                    clients[data.id].disconnect();
                    clients[data.id] = undefined;
                    delete clients[data.id];
                }
            });
            ipc.server.on('StartHosting', function (data, socket) {
                if(!data.reqid) { return; }
                if(isNaN(data.port)) {
                    ipc.server.emit(
                        socket,
                        'StartHosting_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'InvalidRequest',
                                code: 400,
                                message: 'The port specified must be a valid number'
                            }
                        }
                    );
                    return;
                }
                if(p3.portInUse(data.port)) {
                    ipc.server.emit(
                        socket,
                        'StartHosting_'+data.reqid,
                        {
                            success: false,
                            error: {
                                type: 'PortInUse',
                                code: 503,
                                message: 'The port specified is already in use'
                            }
                        }
                    );
                    return
                }
                ports[data.port] = {
                    reqid: data.reqid,
                    socket: socket,
                    clients: {},
                    evt: {}
                };
                var Port = ports[data.port];
                p3.listen(data.port, function (client) {
                    ipc.server.emit(
                        socket,
                        'Server.ClientConnected_'+data.reqid,
                        {
                            peerId: client.peerId,
                            address: client.peer.adr,
                            rpt: client.peer.port
                        }
                    );
                    ports[data.port].clients[client.peerId] = client;
                    ports[data.port].evt[client.peerId]=[]
                    client.on('message', message => {
                        setTimeout(() => {
                            ipc.server.emit(
                                socket,
                                'Server.ClientMessage_'+data.reqid,
                                {
                                    peerId: client.peerId,
                                    message: message
                                }
                            );
                        },1000);
                    });
                    var _EmToCl = function (dat, sock) {
                        if(socket!=sock) { return; }
                        client.emit(dat);
                    };
                    Port.evt[client.peerId].push({
                        name: `Server.EmitToClient:${client.peerId}`,
                        func: _EmToCl
                    });
                    console.log(`Server.EmitToClient:${client.peerId}`);
                    ipc.server.on(`Server.EmitToClient:${client.peerId}`, _EmToCl);
                    client.on('disconnect', () => {
                        ipc.server.emit(
                            socket,
                            'Server.ClientDisconnect_'+data.reqid,
                            {
                                peerId: client.peerId,
                            }
                        );
                        Port.evt[client.peerId].forEach(event => {
                            ipc.server.off(event.name,event.func);
                        });
                        Port.evt[client.peerId] = undefined;
                        delete Port.evt[client.peerId];
                    });
                });
            });
            ipc.server.on('SystemStart', function () {
                console.log('Starting P3.');
                p3.start();
            });
            ipc.server.on('SystemStop', function () {
                console.log('Stopping P3.');
                p3.kill();
            });
            ipc.server.on('socket.disconnected', function (socket) {
                Object.keys(ports).forEach(id => {
                    var port = ports[id];
                    if(port.socket === socket) {
                        p3.endPort(id);
                        Object.values(port.clients).forEach(client => {
                            client.peer.disconnect();
                        });
                        Object.values(port.evt).forEach(events => {
                            events.forEach(event => {
                                ipc.server.off(event.name, event.func);
                            });
                        });
                        ports[id] = undefined;
                        delete ports[id];
                    }
                });
                Object.keys(clients).forEach(id => {
                    var client = clients[id];
                    if(clients.socket === socket) {
                        client.disconnect();
                        clients[id] = undefined;
                        delete clients[id];
                    }
                });
                Object.keys(notifiers).forEach(id => {
                    var notifier = notifiers[id];
                    if(notifier.socket === socket) {
                        notifiers[id] = undefined;
                        delete notifiers[id];
                    }
                });
            });
        }
    );
    ipc.server.start();
})();