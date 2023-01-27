var IPC = require('node-ipc').IPCModule;
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
    '/tmp/svc.mikep3',
    function () {
        execute('p3.Socket');
    }
);


