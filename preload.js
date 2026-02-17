const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => ipcRenderer.send('go-url', url),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  goHome: () => ipcRenderer.send('go-home'),
  hideHomepage: () => ipcRenderer.send('hide-homepage'),
  showHomepage: () => ipcRenderer.send('show-homepage'),
  onUrlUpdate: (callback) => ipcRenderer.on('url-updated', (_event, value) => callback(value)),
  onShowHomepage: (callback) => ipcRenderer.on('show-homepage', (_event, value) => callback(value)),
  setFontMode: (mode) => ipcRenderer.send('set-font-mode', mode)
});
