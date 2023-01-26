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
                returnl
            }
        });
        ipc.of.mikep3.emit(`NewClient`, {
            dest: {
                address: dest,
                port: port
            },
            reqid: Id
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