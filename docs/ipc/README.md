# IPC Event Stream Docs
The IPC stream uses the id of `mikep3` and is served through `/tmp/svc.mikep3` on Mac, Linux, or other UNIX-based systems; and `C:\Windows\System32\Temp\svc.mikep3`/`%TEMP%\svc.mikep3` on Windows.

## Sending a command
Commands are formatted by using the `command` event, with a JSON object containing optional arguments, the command to execute, and a request ID.
Here is an example of the data sent:
```json
{
  "cmd": "p3.commandName",
  "args": {"arg":1,"text": "some data"},
  "id": "b3af-946684800000"
}
```
The request ID consists of a 4-to-5 character randomly-generated hexidecimal number, followed by a hyphen and then the timestamp represented in milliseconds since the UNIX Epoch.
(Fun fact: you can get the amount of milliseconds in Node.JS or browser JavaScript using `Date.now()` or `(new Date).getTime()`);

You'll then recieve a response using the `cmd-{id}` event. For example, for the demo event above, the response would be listened to on `cmd-b3af-946684800000`.

## Subscriptions
A subscription is when the client recieves events from the server on demand. They can always unsubscribe.
Events are mainly used for recieving messages from a P3 client or server, or telling if a client disconnects or connects.
They're also used to tell the app if the client they created was kicked from the server.
Subscriptions are sent using the `subscription-...` event. With real subscriptions, the `...` is replaced with a subscription ID, identifying which subscription is being broadcast.
An example of the data sent is:
```json
{
  "end": false,
  "data": { }
}
```
The `data` can be any valid JSON data. The `end` paramater is something that tells the app to unsubscribe from the channel.

## System Subscriptions
System subscriptions are subscriptions broadcasted to all sockets to tell them information about the system state. Some of them are highly recommended to be subscribed to.

### `state-change`
> Highly recommended
This fires whenever the connection state of P3 changes. It's data object looks like this:
```json
{
  "state": "online",
  "address": "x9wwpq0d8ed94a.ppp"
}
```
The `state` paramater is a string that is either `online`, `connecting`, or `offline`. It represents the state of the P3 network connection.
The `address` paramater represents your P3 address. It may be empty.

### `ports-freed`
This fires whenever a port is available for use.
```json
{
  "port": 1234
}
```

### `port-claimed`
This fires whenever a port is being listened to by another app.
```json
{
  "port": 4321
}
```

## Initalizing
In order for lots of commands to work, you need to initalize your socket. Do this by sending the `p3.Socket` command.
You'll recieve and event with similar data:
```json
{
  "state": "connected",
  "connected": true,
  "address": "duway4y02c.ppp",
  "connectsOnStart": false,
  "portsInUse": [737,18404,9]
}
```

## Creating a client
A huge part of P3 is connecting to a server. You can't do that without a client! Use the `p3.client` event with the following arguments:
* `dest` is the P3 address of the server you're connecting to
* `port` is which port of the server you're going to connect to

It'll then send back this JSON:
```json
{
  "id": "ff83-946684809300"
}
```
The request ID for this message is now associated with the client.

### Recieving messages from the server
You need to be subscribed to (for example) `subscription-ff83-946684809300` (or `subscription-<request id>`) to listen.
You'll get messages with a `type` paramater. The type is either `connect`, `disconnect`, `fail`, or `message`.
The `message` event also has a `message` paramater, containing the JSON data the server sent back.

### Sending messages to the server
Using the `p3.emitToServer` event, you just need the following arguments:
* `id` is the request ID of the command that created the client
* `data` is what is sent to the server (JSON please)

### Disconnecting from the P3 server
We all know the server can kick you. But you can kick the server (at least kick the connection to the server).
Using the `p3.disconnectFromServer` event, you just need to specify the client's ID inside of the `id` paramater, and boom. Client disconnected.

## Hosting a P3 server
Clients are great and all, but servers are _waaaaaaaaay_ more important. Because without servers, you wouldn't have anything to connect all your clients too! Let's learn how to create a server! It starts with the `p3.createServer` command using ~~these arguments~~ this argument:
* `port` is the port of the server.

### Detecting connections
You'll get a subscription event on `subscription-pt<port>`. So if you host on port 123, you'll recieve a `subscription-pt123` on every connection to that port. The data has the following useful information:
* `address` is the P3 address of the client that connected
* `id` is the peer ID - in most cases of the NodeJS `mikesoftp3` library its used as an internal, but here it identifies a connection to be reused
* `responsePort` is the port to respond to (not really needed - `mikesoftp3` takes care of it for you, but useful for debugging!)

You'll then want to subscribe to the `subscription-fc<peer id>` channel. For example, if the peer Id is `q9eEcx9eBe+3bHwk2LxO8sTt6==`, you'd subscribe to `subscription-fcq9eEcx9eBe+3bHwk2LxO8sTt6==`.

### Getting Messages
You'll recieve messages on the subscription mentioned in the `Detecting connections` section.
They have the following data:
* `type`, which can either be `message` or `disconnect`
* `message`, which is only present on an event with a type of `message`

### Sending messages to the client
Using the `p3.emitToClient` event, you send the following arguments:
* `data` - you know what it is by now ;)
* `id`, which is the peer ID
* the `port` this connection takes place on (two connections on two different ports may have the same peer ID - *\_gasp\_*)

### Kicking the Client
> The ability to kick clients and users off of your servers or preventing them access is used by everyone, the good, bad, and neutral.
> The neutral use it to kick the bad people off to prevent trolls.
> The bad people use it to kick the US government off their P3 chatrooms, and hack random ones to kick the mods off.
> Good people kick the bad people off of the non-existent banking and email and chatting services all sent through P3.
> People use it to P3A-ban people who try to DDoS their servers or send to many requests (HTTP 429 moment).
> Everyone uses it.

\- Said no one ever

You just need the peer ID in the `id` argument and the port in the `port`, then _kick_ it all off (get it?) by sending that data out using the `p3.kickClient` event.

## Starting/stopping the server
Use the `p3.start` and `p3.stop` events.

## I need to make my own SDK - but it seems _soooooooo_ complicated!
Take a look at the [NodeJS Raw API Source Code](/node-api/rawipcapi.js) - the Raw API (internally known as `RawIPCApi`) is used by the one that actually gets exposed - it basically handles command sending _and_ subscriptions without hastle - by looking at this source seperately, it might make it a bit easier for creating an unoffical SDK. If you've recreated the `RawIPCApi` but still need to add the external API (eg the functions that make it P3-y) then take a look at the [NodeJS CompiledP3 SDK Source Code](/node-api/index.js), internally refferred to as the "Index API" or `cP3NodeSdk`.

Make an unofficial SDK, perhaps a Swift or C++ one for macOS, maybe a Rust one for cross-platform support, or perhaps you want to write one in PHP? Just hit up an issue on this repo - we'll make sure to add it!
