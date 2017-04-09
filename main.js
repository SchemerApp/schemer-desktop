const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
var mysqlspec = require('mysqlspec')
const ipc = require('electron').ipcMain

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1400, height: 800})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

ipc.on('db-connect', function(event, data){
    let config = {
      host     : data.host,
      user     : data.user,
      password : data.pass,
      database : data.db,
    }

    mysqlspec(config, function (err, schema) {
      event.sender.send('connection-made', formatSchema(schema))
    });
})

// Parse the schema returned by `sqlspec` into something friendlier
function formatSchema(schema) {
  let formatted = []

  Object.keys(schema).forEach(function(item){
    formatted.push({"name": item, "columns": formatColumns(schema[item].properties)})
  })
  return formatted
}

// Helper for table columns
function formatColumns(columns){
  let formatted = []

  Object.keys(columns).forEach(function(item){
    formatted.push({"name": item, "type": columns[item].type})
  })
  return formatted
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
