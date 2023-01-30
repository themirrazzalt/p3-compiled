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
async stopPort (port: number)
```
Paramaters
   `port` The port to stop

Removes the listeners from a port
