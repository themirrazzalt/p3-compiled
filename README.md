# P3.Compiled
A system-wide P3 library built using IPC for Windows, Mac, Linux, and UNIX

## What is this?
You can use my `mikesoftp3` package with Electron for creating apps that use P3. But the system doesn't share the same P3 address. That's what this is: seamless OS integration almost identical to the type in Windows 96.

## Why does this exist?
So you can use P3 anywhere. On your PC running Windows 11 or 7, your Linux or UNIX machine, which might be the latest, most powerful Macintosh, or a 4GB Raspberry Pi. Run the Windows edition on Linux using WINE, and even run it on ChromeOS.
The possibilites are endless. Plus, someone has to re-create SuperTerm. It's easier with this.

## How does it work?
It's an Electron app (technically 2). One is the "host" - it uses Electron to display a tray icon in your system to launch the P3 settings.
And yep - that's the other one - the P3 settings. It uses my NodeJS P3 API (I improved it a bit - find it in [/linux-source/node-p3.js](/linux-source/node-p3.js)) and pipes it through IPC using `node-ipc`.
Note that when compiling from source, it's going to add some `WITH-LOVE-FROM-AMERICA.txt` file to your desktop (it's empty) - this is because `node-ipc` requires some package called `peacenotwar` which does this.
It's going to be removed in the compiled version (even I'm kindof annoyed that it exists on my desktop).

## How do I access the settings?
Just press the P3 icon in your system tray!

## What programming languages can I use with this?
I'm planning on writing a NodeJS SDK, Python SDK, and C/C++ (.NET) API. Also feel free to look through the source and make your own!

## SDK Development Process
NodeJS: Partially Complete [/root/node_api.js](node_api.js)<br>
C/C++: Not Started
Python: Not Started
