var IPC = require('node-ipc').IPCModule;
var ipc = new IPC();
ipc.config.retry = 1500;
ipc.config.id = 'mikep3';
ipc.config.appspace = 'svc.';
var oKey = "";
var global_config = {}
ipc.connectTo(
    'mikep3',
    '/tmp/svc.mikep3',
    function () {
        setInterval(async () => {
            var config = await P3_GetConfig();
            global_config = config;
            if(config.connected) {
                document.querySelector('.p3-status-light').dataset.connected = 'true';
                document.querySelector('.p3-status').textContent = "Online";
            } else {
                document.querySelector('.p3-status-light').dataset.connected = 'false';
                document.querySelector('.p3-status').textContent = "Not Connected";
            }
            if(oKey != config.secret) {
                oKey = config.secret;
                document.querySelector('.p3-parameters').value = oKey;
            }
            document.querySelector('.p3-address').value = config.address;
            document.querySelector('.p3-connector').textContent = (
                config.connected ? 'Disconnect': 'Connect'
            )
        },1000)
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