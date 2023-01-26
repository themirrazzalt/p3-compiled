var IPC = require('node-ipc').IPCModule;
var ipc = new IPC();
ipc.config.retry = 1500;
ipc.config.id = 'mikep3';
ipc.config.appspace = 'svc.';
var oKey = "";
var global_api = {
    onConnected: null,
    getConfig: P3_GetConfig,
    start: P3_Start,
    stop: P3_Stop,
    createClient: function (dest, port) {
        var Id = generate_req_id();
        var client = {
            onKilled: null,
            onMessage: null,
            onError: null,
            kill: function () {}
        };
        ipc.of.mikep3.once(`Client_${id}`, data => {
            try {
                if(data.type == 'rejected') {
                    client.onError(data.error);
                } else if(data.type == 'connected') {
                    client.onConnected();
                } else if(data.type == 'message') {
                    client.onMessage(data.data);
                } else if(data.type == 'disconnect') {
                    client.onKilled();
                }
            } catch {
                return;
            }
        });
        ipc.of.mikep3.emit(`NewClient`, {
            dest: {
                address: dest,
                port: port
            },
            reqid: Id
        });
    },
    listenOnServer: function (port, cb) {
        var Id = generate_req_id();
        if(isNaN(port)) {
            throw new Error('port needs to be a number')
        }
        ipc.of.mikep3.emit(`StartHosting`, {
           reqid: Id,
           port: port 
        });
        ipc.of.mikep3.on(`Server.ClientConnected_${Id}`, function (client) {
            var pid = client.peerId;
            var _c = {
                emit: function (data) {
                    ipc.of.mikep3.emit(
                        `Server.EmitToClient:${pid}`,
                        data
                    );
                },
                onmessage: null,
                ondisconnect: null,
                address: client.address,
                id: pid,
                response_port: client.rpt,
                rpt: client.rpt,
                kill: function () {
                    throw new Error('to-do');
                }
            };
            var _gm = function (data) {
                if(data.peerId !== pid) { return; }
                try {
                    _c.onmessage(data.message)
                } catch (error) {
                    null;
                }
            };
            var _dk = function (data) {
                if(data.peerId !== pid) { return; }
                try {
                    _c.ondisconnect()
                } catch (error) {
                    null;
                }
                ipc.of.mikep3.off(`Server.ClientMessage_${Id}`,_dk);
                ipc.of.mikep3.off(`Server.ClientDisconnect_${Id}`,_gm);
            };
            ipc.of.mikep3.on(`Server.ClientMessage_${Id}`,_dk);
            ipc.of.mikep3.on(`Server.ClientDisconnect_${Id}`,_gm);
        });
    }
}
ipc.connectTo(
    'mikep3',
    '/tmp/svc.mikep3',
    function () {
        try {
            global_api.onConnected()
        } catch {
            return 0
        }
    }
);


function P3_GetConfig() {
    return new Promise((ack,dny) => {
        var Id = generate_req_id();
        ipc.of.mikep3.once(`GetConfig_${Id}`, function (data) {
            if(data.success) {
                ack({
                    address: data.address,
                    secret: data.secret,
                    connected: data.connected
                });
            } else {
                dny(data.error);
            }
        });
        ipc.of.mikep3.emit('GetConfig',{
            prop:'all_settings',
            reqid: Id
        });
    });
}

function generate_req_id() {
    var _IdLets = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f'];
    var out = "";
    for(var i = 0; i < 20; i++) {
        out += _IdLets[Math.floor(Math.random() * _IdLets.length)];
    }
    return out;
}

function P3_Start() {
    ipc.of.mikep3.emit('SystemStart');
}

function P3_Stop() {
    ipc.of.mikep3.emit('SystemStop');
}

module.exports = global_api;