# IPC Event Stream Docs
The IPC stream uses the id of `mikep3` and is served through `/tmp/svc.mikep3` on Mac, Linux, or other UNIX-based systems; and `C:\Windows\System32\Temp\svc.mikep3`/`%TEMP%\svc.mikep3` on Windows.

## Sending a command
Commands are formatted by using the `command` event, with a JSON object containing optional arguments, the command to execute, and a request ID.
Here is an example of the data sent:
```json
{
  "cmd": "p3.commandName",
  "args": {"arg":1,"text": "some data"},
  "reqId": "b3af-946684800000"
}
```
The request ID consists of a 4-to-5 character randomly-generated hexidecimal number, followed by a hyphen and then the timestamp represented in milliseconds since the UNIX Epoch.
(Fun fact: you can get the amount of milliseconds in Node.JS or browser JavaScript using `Date.now()` or `(new Date).getTime()`)

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
