const fs = require('node:fs/promises');
var mod = {
    readstr: async function (path) {
        return await fs.readFile(path, {
            encoding: 'utf-8'
        })
    },
    readbin: async function (path) {
        return new Uint8Array(
            await fs.readFile(path)
        )
    },
    readFile: async function (path, det) {
        return await fs.readFile(path, det)
    },
    writestr: async function (path, text) {
        return await fs.writeFile(path, String(text))
    },
    writebin: async function (path, bin) {
        return await fs.writeFile(path, new Buffer(bin));
    },
    stat: async function (path) {
        return await fs.stat(path)
    },
    mkdir: async function (path) {
        return await fs.mkdir(path);
    },
    exists: async function (path) {
        try {
            await mod.stat(path);
            return true;
        } catch (error) {
            if(error.errno != -2) { throw error; }
            return false;
        }
    },
    isFile: async function (path) {
        return ( await mod.stat(path) ).isFile();
    },
    filetype: async function (path) {
        return ( await mod.isFile(path) ) ? 0 : 1;
    },
    touch: async function (path) {
        if(await mod.exists(path)) { return; }
        return await fs.writeFile(path,"")
    },
    cp: async function (path,dest) {
        return await fs.cp(path,dest);
    },
    rm: async function (path,dest) {
        return await fs.rm(path,dest);
    },
    rmdir: async function (path,dest) {
        return await fs.rmdir(path,dest);
    },
    rename: async function (path,dest) {
        return await fs.rename(path,dest);
    }
};
module.exports = mod;