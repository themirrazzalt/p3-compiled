var IPC = require('./node-ipc').IPCModule;
var os = require('os');
var ipc = new IPC();
ipc.config.retry = 1500;
ipc.config.id = 'mikep3';
ipc.config.appspace = 'svc.';
var oKey = "";
function randomHex() {
    var chars = '0123456789abcdef'.split();
    return chars[Math.floor(Math.random() * chars.length)];
}

function execute(command,args) {
    var id = `${randomHex()+randomHex()+randomHex()+randomHex()}-${Date.now()}`;
    return new Promise ((y,r) => {
        ipc.of.mikep3.once(
            `cmd-${id}`,
            function (data) {
                y(data);
            }
        );
        ipc.of.mikep3.emit(
            'command',
            {
                cmd: command,
                args: args,
                id: id
            }
        );
    });
}

function Subscription (id, cb) {
    var _H = function (data) {
        if(data.end) {
            ipc.of.mikep3.off(`subscription-${id}`,_H);
        }
        cb(data.data);
    };
    ipc.of.mikep3.on(`subscription-${id}`,_H);
    return {
        end: function () {
            ipc.of.mikep3.off(`subscription-${id}`,_H);
        }
    }
}

ipc.connectTo(
    'mikep3',
    `${os.homedir()}/.mikep3/Svc`,
    function () {
        execute('p3.Socket').then(data => {
            RawIPC.connectData = data;
            try {
                RawIPC.onConnected()
            } catch (error) {
                return false;
            }
        });
    }
);

var RawIPC = {
    Subscription: Subscription,
    execute: execute,
    onConnected: null,
    connectData: {
        connected: false,
        address: null,
        state: 'connecting_to_ipc',
        portsInUse: [],
        connectsOnStart: false
    }
};
module.exports = RawIPC