'use strict'

const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const os = require('os')
const BrowserWindow = electron.BrowserWindow

var mainWindow = null
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        show: false,
        frame: false,
        width: 925,
        height: 675,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            defaultEncoding: 'UTF-8'
        }
    })

    mainWindow.loadURL(__dirname + "/client/index.html")

    // Enable keyboard shortcuts for Developer Tools on various platforms.


    // Enable this for debugging.
    /*let platform = os.platform()
    if (platform === 'darwin') {
        globalShortcut.register('Command+Option+I', () => {
            mainWindow.webContents.openDevTools()
        })
    } else if (platform === 'linux' || platform === 'win32') {
        globalShortcut.register('Control+Shift+I', () => {
            mainWindow.webContents.openDevTools()
        })
    }*/

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null)
        mainWindow.show()
    })

    mainWindow.onbeforeunload = (e) => {
        // Prevent Command-R from unloading the window contents.
        e.returnValue = false
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    })
})

app.on('window-all-closed', () => { app.quit() })