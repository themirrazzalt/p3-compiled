# Node P3Compiled SDK Docs

## Installing
> Note: you currently cannot install this as a node library.

Run `npm install p3cnodesdk` inside a terminal. Then use the following code:
```js
const P3 = require('p3cnodesdk');
```

## createClient
```ts
createClient (dest: string, port: number) => P3Client
```
Paramaters: <br>
   `dest` The P3 address to connect to
   `port` The port of the server to connect to

Returns a [`P3Client`](#p3client) object representing the client that was created.

## getPortsInUse
```ts
async getPortsInUse () => number[]
```
Returns an array of numbers representing the ports in use

## isActive
```ts
async isActive () => boolean
```
Returns a boolean representing if the device is connected to the P3 network

## stopPort
```ts
async stopPort (port: number) => void
```
Paramaters
   `port` The port to stop

Removes the listeners from a port

## listen
```ts
listen (port: number, callback: (peer: P3Peer) => void) => void
```
Paramaters
   `port` The port to listen on
   `callback` A function called when a peer is connected
      `peer` A [`P3Peer`](#p3peer) representing the connected peer

Listens to incoming connections on a specific port

## stop
```ts
async stop () => void
```

Stops the P3 service

## start
```ts
async start () => void
```

Starts the P3 service

## getState
```ts
async getState () => "online" | "offline" | "error" | "connecting"
```

Gets the state of the P3 system

## getAddress
```ts
async getAddress () => string
```

Gets the P3 address returned by the relay server

## P3Peer
### id
```ts
const id: string
```
The id of the peer
### peer
```ts
const peer: {
  id: string,
  address: string,
  port: number,
  rpt: number
}
```
Properties:
   `id` The id of the peer
     > Deprecated: use `P3Peer.id` instead
   `address` The peer's P3 address
   `port` The peer's response port
   `rpt` The peer's response port (alternate)
