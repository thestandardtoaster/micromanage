const {ipcMain, app, BrowserWindow} = require("electron");

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({ frame: false, webPreferences: { devTools: true }});
    mainWindow.on('close', function(){ mainWindow = null });
    mainWindow.setMinimizable(true);
    mainWindow.loadURL("file:///" + __dirname + "/../client/index.html");
    mainWindow.show();
}
app.on('ready', function(){
    createWindow();
});

ipcMain.on("reload", e => {
    mainWindow.loadURL("file:///" + __dirname + "/../client/index.html");
});
