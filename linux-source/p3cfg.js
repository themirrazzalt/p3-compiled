const { app, BrowserWindow } = require('electron');
app.once('ready', async () => {
    const win = new BrowserWindow({
        width: 380,
        height: 625,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            navigateOnDragDrop: false,
            devTools: true,
            contextIsolation: false
        }
    });
    win.loadFile('./p3_settings.html');
});