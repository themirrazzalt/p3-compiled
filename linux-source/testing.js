var IPC = require('node-ipc').IPCModule;
var ipc = new IPC();
ipc.config.retry = 1500;
ipc.config.id = 'mikep3';
ipc.config.appspace = 'svc.';
ipc.connectTo(
    'mikep3',
    '/tmp/svc.mikep3',
    function () {
        ipc.of.mikep3.emit('SystemStart');
        console.log('Connected to P3 socket! Attempting to get P3 address/connection details');
        var Id0 = generate_req_id();
        var Id1 = generate_req_id();
        ipc.of.mikep3.on(`Server.ClientConnected_${Id1}`, function (client) {
            ipc.of.mikep3.emit(
                `Server.EmitToClient:${client.peerId}`,
                ['text', 'SuperTerm test 1.0']
            )
        })
        ipc.of.mikep3.on('GetConfig_'+Id0, function (data) {
            console.log('Attempting to start P3 and host a server...');
            console.log(data);
            setTimeout(_ => {
                ipc.of.mikep3.emit('StartHosting', {
                    reqid: Id1,
                    port: 121
                });
            }, 1000);
        });
        ipc.of.mikep3.emit(
            'GetConfig',
            {
                reqid: Id0,
                prop: 'p3_address'
            }
        );
    }
);

function generate_req_id() {
    var _IdLets = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f'];
    var out = "";
    for(var i = 0; i < 20; i++) {
        out += _IdLets[Math.floor(Math.random() * _IdLets.length)];
    }
    return out;
}