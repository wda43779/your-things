const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  searchByFilename: (title, text) => ipcRenderer.invoke("search-by-filename", title, text),
  searchPy: (text) => ipcRenderer.invoke("search-py", text),
  onUpdateIndexerStatusBar: (callback) => {
    ipcRenderer.on('indexer-status-bar', (_event, str) => callback(str))
    const cancel = () => ipcRenderer.removeListener('indexer-status-bar', callback)
    return cancel;
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
