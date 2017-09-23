const electron = require('electron');
const {ipcMain} = electron;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({ frame: false });
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
