var fs = require('./fs');
var IPC = require('node-ipc').IPCModule;
var P3 = require('./node-p3');
var Util=require('./util');
var os = require('os');
var child_process = require('child_process');
var { Tray,app,BrowserWindow } = require('electron');
var $Home = os.homedir();
var argv = process.argv.slice(2);
/**
 * @type {P3}
 */
var p3;
var Intern = {
    CfgWindow: null
}
app.whenReady().then(() => {
    _main();
    var tray = new Tray('./p3_tray.png');
    tray.on('click', () => {
        ShowP3Settings();
    });
    app.on('window-all-closed', () => { return null });
});


function ShowP3Settings() {
    if(Intern.CfgWindow) {
        if(Intern.CfgWindow.isMinimized()) {
            Intern.CfgWindow.restore();
        } else {
            Intern.CfgWindow.focus();
        }
        return false;
    }
    Intern.CfgWindow = new BrowserWindow({
        width: 380,
        height: 625,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            navigateOnDragDrop: false,
            devTools: true,
            contextIsolation: false
        },
        title: 'P3 Configuration'
    });
    Intern.CfgWindow.loadFile('./p3_settings.html');
    Intern.CfgWindow.on('closed', () => Intern.CfgWindow = null);
}


var _main = (async () => {
    var ipc = new IPC();
    ipc.config.retry = 1500;
    ipc.config.id = 'mikep3';
    var sockets = [];
    if(!await fs.exists(`${$Home}/.mikep3`)) {
        await fs.mkdir(`${$Home}/.mikep3`);
    }
    if(!await fs.exists(`${$Home}/.mikep3/config.json`)) {
        await fs.writestr(
            `${$Home}/.mikep3/config.json`,
            JSON.stringify({
                secret: null,
                autoconnect: false,
                relayServer: 'wss://p3.windows96.net'
            })
        );
    };
    var config=JSON.parse(await fs.readstr(`${$Home}/.mikep3/config.json`));
    p3 = new P3({
        secret: config.secret,
        autoinit: Boolean(config.autoconnect||false),
        url: config.relayServer || 'wss://p3.windows96.net'
    });
    var GetSocketAssociations = function (socket) {
        for(var i = 0; i < sockets.length; i++) {
            if(sockets[i].id == socket) {
                return sockets[i];
            }
        }
        return null;
    };
    var GetAllClientsFromSocket = function (socket) {
        var socket = GetSocketAssociations(socket);
        if(!socket) { return null; }
        var _sAk = [];
        Object.keys(socket.clients).forEach(key => {
            _sAk.push({
                id: key,
                client: socket.clients[key]
            });
        });
        return _sAk
    };
    var GetAllPortsFromSocket = function (socket) {
        var socket = GetSocketAssociations(socket);
        if(!socket) { return null; }
        var _sAk = [];
        Object.keys(socket.ports).forEach(key => {
            _sAk.push({
                id: key,
                port: socket.ports[key]
            });
        });
        return _sAk
    };
    var GetClientFromSocket = function (socket, id) {
        var socket = GetSocketAssociations(socket);
        if(!socket) { return null; }
        if(!socket.clients[id]) { return null; }
        return socket.clients[id];
    };
    var GetPortFromSocket = function (socket, id) {
        var socket = GetSocketAssociations(socket);
        if(!socket) { return null; }
        if(!socket.ports[id]) { return null; }
        return socket.ports[id];
    };
    if(!config.secret) {
        config.secret = p3.key;
        await fs.writestr(
            `${$Home}/.mikep3/config.json`,
            JSON.stringify(config)
        );
    }
    function SendSubscription (socket,id, data, end) {
        ipc.server.emit(
            socket,
            `subscription-${id}`,
            {
                end: Boolean(end||false),
                data: data
            }
        );
    }
    ipc.serve(
        '/tmp/svc.mikep3',
        function () {
            ipc.server.on(
                'command',
                function (data, socket) {
                    var cmd = data.cmd;
                    var args = data.args;
                    var reqid = data.id;
                    var reply = function (dat) {
                        ipc.server.emit(
                            socket,
                            'cmd-'+reqid,
                            dat
                        );
                    }
                    if(!(cmd && reqid)) { return; }
                    if(cmd == 'p3.Socket') {
                        if(!sockets.includes(socket)) {
                            sockets.push({
                                id: socket,
                                clients: {},
                                ports: {}
                            });
                        }
                        reply({
                            connected: p3.active,
                            address: p3.adr,
                            state: p3.getState(),
                            portsInUse: p3.getPortsInUse(),
                            connectsOnStart: config.autoconnect
                        });
                    } else if(cmd == 'p3.active') {
                        reply(p3.active());
                    } else if(cmd == 'p3.state') {
                        reply(p3.getState());
                    } else if(cmd == 'p3.portsInUse') {
                        reply(p3.getPortsInUse());
                    } else if(cmd == 'p3.address') {
                        reply(p3.adr);
                    } else if(cmd == 'p3.connectsOnStart') {
                        reply(config.connectsOnStart);
                    } else if(cmd == 'p3.emitToServer') {
                        reply(true);
                        if(!(args.data && args.id)) { return false; }
                        var client = GetClientFromSocket(socket, args.id);
                        if(!client) { return false; }
                        client.emit(args.data);
                    } else if(cmd == 'p3.emitToClient') {
                        reply(true);
                        if(!(args.data && args.id && args.port)) {
                            return false;
                        }
                        var port = GetPortFromSocket(socket, args.port);
                        if(!port) { return false; }
                        if(!port.clients[args.id]) { return false; }
                        port.clients[args.id].emit(args.data);
                    } else if(cmd == 'p3.createServer') {
                        if(!args.port) {
                            reply({
                                error: 'TypeError',
                                message: 'Port must be specified'
                            });
                            return false;
                        }
                        if(isNaN(args.port)) {
                            reply({
                                error: 'TypeError',
                                message: 'Port must be a positive integer'
                            });
                        }
                        var sock = GetSocketAssociations(socket);
                        if(!sock) {
                            reply({
                                error: 'ReferenceError',
                                message: 'The socket is not registered, have you initalized it first?'
                            });
                            return;
                        }
                        sock.ports[args.port] = {
                            clients: {}
                        };
                        p3.listen(args.port, function (client) {
                            sock[args.port].clients[client.peerId] = client;
                            SendSubscription(
                                socket,
                                `pt${args.port}`,
                                {
                                    id: client.peerId,
                                    address: client.peer.adr,
                                    responePort: client.peer.port
                                }
                            );
                            client.on('message', data => {
                                SendSubscription(
                                    socket,
                                    `fc${client.peerId}`,
                                    {
                                        message: data,
                                        type: 'message'
                                    }
                                )
                            });
                            client.on('disconnect', _ => {
                                sock.ports[args.port].clients[client.peerID] = undefined;
                                delete sock.ports[args.port].clients[client.peerID];
                                SendSubscription(
                                    socket,
                                    `fc${client.peerID}`,
                                    {
                                        type: 'disconnect'
                                    },
                                    true
                                );
                            });
                        });
                        reply(true);
                    } else if(cmd == 'p3.kickClient') {
                        if(!(args.id && args.port)) {
                            return reply(false);
                        }
                        var port = GetPortFromSocket(socket, args.port);
                        if(!port) { return reply(false); }
                        if(!port.clients[args.id]) { return reply(false); }
                        port.clients[args.id].peer.disconnect();
                        reply(true);
                    } else if(cmd == 'p3.disconnectFromServer') {
                        if(!args.id) { return reply(false); }
                        var client = GetClientFromSocket(socket, id);
                        if(!client) { return reply(false); }
                        client.end();
                    } else if(cmd == 'p3.start') {
                        p3.start();
                        reply(true);
                    } else if(cmd == 'p3.stop') {
                        sockets.forEach(sock => {
                            var assoc = GetSocketAssociations(sock);
                            var ports = GetAllPortsFromSocket(sock);
                            var clients = GetAllPortsFromSocket(sock);
                            if(ports) {
                                ports.forEach(port => {
                                    Object.values(port.port.clients).forEach(client => {
                                        SendSubscription(
                                            sock,
                                            `fc${client.peerId}`,
                                            {
                                                type: 'disconnect'
                                            },
                                            true
                                        );
                                        client.peer.disconnect();
                                    });
                                    assoc.ports[port.id] = undefined;
                                    delete assoc.ports[port.id];
                                    p3.endPort(port.id);
                                });
                            }
                            if(clients) {
                                clients.forEach(client => {
                                    SendSubscription(
                                        sock,
                                        `fs${client.id}`,
                                        {
                                            type: 'disconnect'
                                        },
                                        true
                                    );
                                    client.client.end();
                                    assoc.clients[client.id] = undefined;
                                    delete assoc.clients[client.id];
                                });
                            }
                        });
                        p3.stop();
                        reply(true);
                    } else if(cmd == 'p3.client') {
                        if(!(args.port && args.dest)) {
                            reply({
                                error: 'TypeError',
                                message: 'Requires destination and port'
                            });
                            return false;
                        }
                        reply({
                            id: reqid
                        });
                        var _C = p3.createClient(args.dest, args.port);
                        GetSocketAssociations(socket).clients[reqid] = _C;
                        _C.on('disconnect', _ => {
                            GetSocketAssociations(socket).clients[reqid] = undefined;
                            delete GetSocketAssociations(socket).clients[reqid];
                            SendSubscription(
                                socket,
                                `fs${reqid}`,
                                {
                                    type: 'disconnect'
                                },
                                true
                            );
                        });
                        _C.on('fail', _ => {
                            GetSocketAssociations(socket).clients[reqid] = undefined;
                            delete GetSocketAssociations(socket).clients[reqid];
                            SendSubscription(
                                socket,
                                `fs${reqid}`,
                                {
                                    type: 'error'
                                },
                                true
                            );
                        });
                        _C.on('message', data => {
                            SendSubscription(
                                socket,
                                `fs${reqid}`,
                                {
                                    type: 'message',
                                    message: data
                                }
                            );
                        });
                        _C.on('connect', _ => {
                            SendSubscription(
                                socket,
                                `fs${reqid}`,
                                {
                                    type: 'connect'
                                }
                            );
                        });
                    }
                }
            );
            ipc.server.on('socket.disconnect', socket => {
                var ports = GetAllPortsFromSocket(socket);
                var clients = GetAllClientsFromSocket(socket);
                if(ports) {
                    ports.forEach(port => {
                        Object.values(port.port.clients).forEach(client => {
                            client.peer.disconnect();
                        });
                        p3.endPort(port.id);
                    });
                }
                if(clients) {
                    clients.forEach(client => {
                        client.client.end();
                    });
                }
                sockets = Util.Array.Rm(sockets,sockets.indexOf(socket));
            });
        }
    );
    ipc.server.start();
});