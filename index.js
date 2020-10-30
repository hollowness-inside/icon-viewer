const { app, BrowserWindow } = require('electron');

function createWindow () {
	const win = new BrowserWindow({
		width: 780,
		height: 525,
		minWidth: 780,
		minHeight: 525,
		webPreferences: {
			enableRemoteModule : true,
			nodeIntegration: true,
		}
	})

	win.loadFile('src/index.html');
	win.removeMenu();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})