var P3 = require('./p3cNode');
P3.on('socket-init', async () => {
    if(!await P3.isActive()) {
        console.log('You are not connected to the P3 network, now initiating!');
        await P3.start();
        await new Promise(y => setTimeout(
            ()=>y(),1000
        ));
    }
    console.log(await P3.getAddress());
    console.log(`Your P3 address is ${await P3.getAddress()}`);
    console.log(
        'Connect on SuperTerm to '
        + await P3.getAddress() +
        ':121'
    );
    P3.listen(121, function(client) {
        client.emit(
            [
                'text',
                'Welcome! You are connecting to the official Node P3.Compiled Ipc SDK Test Server!'
                + '\n' +
                'I will now attempt to connect to your Remote Console port.'
                + '\n' +
                "Don't worry, this software is not malicious. You'll see a dialog displaying your P3 address."
                + '\n' +
                'If your password is not \'1234\', we\'ll prompt you for it.'
                + '\n' + '\n' +
                'For debugging purposes, some information is displayed here:'
                + '\n' +
                `P3 Address: ${client.peer.address}`
                + '\n' +
                `Response Port: ${client.peer.rpt}\n`
            ]
        );
        var remote = P3.createClient(
            client.peer.address,
            140
        );
        remote.on('error', async (error) => {
            await client.emit([
                'text',
                '\nUh oh, looks like someone threw an error at us! (Get it?)'
                + '\n' +
                'Don\'t worry - it wasn\'t you ;)'
                + '\n' +
                'Let\'s see what this error has to say for itself:'
                + '\n' + '\n' +
                error.stack
                + '\n' + '\n' +
                'Well, my work here is done. There is nothing more I can do.'
                + ' ' +
                'Goodbye!'
            ]);
            client.kick();
        });
        client.on('message', message => {
            if(message[0] == 'input') {
                remote.emit(
                    [
                        'input',
                        message[1]
                    ]
                );
            }
        });
        remote.on('connect', _ => {
            console.log('connect')
            setTimeout(()=>{
                remote.emit([
                    'input',
                    '1234'
                ]);
            },5000)
        });
        remote.on('message', message => {
            if(!message[1]) { return }
            client.emit(message)
            if(message[1].includes('Wrong username/password.')) {
                client.emit([
                    'text',
                    '\nHey there! We noticed uh... 1234 isn\'t your password.'
                    + '\n' +
                    'We need you to enter your password in the text box below.'
                    + '\n' +
                    'Then you\'ll see an alert dialog shortly!'
                ]);
            } else if(message[1].includes('script')) {
                remote.emit([
                    'input',
                    `alert("your P3 address is " + ${JSON.stringify(client.peer.address)})`
                ]);
                setTimeout(() => {
                    remote.disconnect();
                    client.kill();
                },1000);
            }
        })
    });
});