const RawIPC = require('./rawipcapi');
const EventEmitter = require('events');

const Gem = new EventEmitter();

RawIPC.onConnected = function () {
    RawIPC.Subscription(
        'state-change',
        function (state) {
            Gem.emit('state-change',{
                state: state.state,
                address: state.address,
                connected: state.state === 'online'
            });
        }
    );
    RawIPC.Subscription('ports-freed', function (port) {
        Gem.emit(port);
    });
    RawIPC.Subscription('port-claimed', function (port) {
        Gem.emit(port);
    });
    try {
        Gem.emit('socket-init')
    } catch (error) {
        return false
    }
}

var Clean = {
    on: function (d,o) {
        return Gem.on(d,o);
    },
    off: function (d,o) {
        return Gem.off(d,o);
    },
    addListener: function (d,o) {
        return Gem.on(d,o);
    },
    removeListener: function (d,o) {
        return Gem.off(d,o);
    },
    getState: async () => {
        return await RawIPC.execute('p3.getState');
    },
    getAddress: async () => {
        return await RawIPC.execute('p3.address');
    },
    getPortsInUse: async () => {
        return await RawIPC.execute('p3.portsInUse');
    },
    isActive: async () => {
        return await RawIPC.execute('p3.active');
    },
    createClient: (dest, port) => {
        var id = "";
        RawIPC.execute('p3.client',{
            dest: dest,
            port: port
        }).then(reply => {
            if(reply.error) {
                var error = new Error(reply.message);
                error.name = reply.message;
                emitter.emit('error', error);
                return
            }
            id = reply.id;
            sub = RawIPC.Subscription(`fs${id}`, data => {
                if(data.type == 'connect') {
                    emitter.emit('connect');
                } else if(data.type == 'disconnect') {
                    emitter.emit('disconnect')
                } else if(data.type == 'error') {
                    emitter.emit('error', new Error('unknown error'));
                } else if(data.type == 'message') {
                    emitter.emit('message', data.message);
                }
            });
            emitter.emit('init');
        });
        var emitter = new EventEmitter();
        var client = {
            on: function (event, func) {
                emitter.on(event, func);
            },
            off: function (event, func) {
                emitter.off(event, func);
            },
            addListener: function (event, func) {
                emitter.on(event, func);
            },
            removeListener: function (event, func) {
                emitter.off(event, func);
            },
            emit: async function (data) {
                await RawIPC.execute(
                    'p3.emitToServer',
                    {
                        id: id,
                        data: data
                    }
                );
            },
            disconnect: async function () {
                await RawIPC.execute(
                    'p3.disconnectFromServer',
                    {
                        id: id
                    }
                );
                sub.end();
            }
        };
        console.log('sub fs'+id)
        var sub;
        return client;
    },
    stopPort: async function (port) {
        var reply = await RawIPC.execute('p3.killPort',{ port: port });
        if(reply.error) {
            throw new Error(reply.error);
        }
    },
    listen: function (port,func) {
        RawIPC.execute('p3.createServer',{
            port: port
        }).then(_ => {
            if(_ !== true) { return false; }
            RawIPC.Subscription(
                `pt${port}`,
                function (raw) {
                    var emitter = new EventEmitter();
                    RawIPC.Subscription(
                        `fc${raw.id}`,
                        data => {
                            if(data.type == 'message') {
                                emitter.emit('message',data.message);
                            } else if(data.type == 'disconnect') {
                                emitter.emit('disconnect');
                            }
                        }
                    );
                    var client = {
                        id: raw.id,
                        peer: {
                            id: raw.id,
                            address: raw.address,
                            port: raw.responsePort,
                            rpt: raw.responsePort,
                            kick: async function () {
                                await client.kill();
                            }
                        },
                        on: function (event, handler) {
                            emitter.on(event,handler)
                        },
                        off: function (event, handler) {
                            emitter.off(event,handler)
                        },
                        addListener: function (event, handler) {
                            emitter.on(event,handler)
                        },
                        removeListener: function (event, handler) {
                            emitter.off(event,handler)
                        },
                        emit: async function (data) {
                            await RawIPC.execute(
                                'p3.emitToClient',
                                {
                                    id: raw.id,
                                    port: port,
                                    data: data
                                }
                            );
                        },
                        kill: async function () {
                            await RawIPC.execute(
                                'p3.kickClient',
                                {
                                    id: raw.id,
                                    port: port
                                }
                            );
                        },
                        kick: async function () {
                            await client.kill();
                        }
                    };
                    func(client);
                }
            );
        });
    },
    stop: async function () {
        await RawIPC.execute('p3.stop');
    },
    start: async function () {
        await RawIPC.execute('p3.start');
    }
}

module.exports = Clean;