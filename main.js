const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");

let win;
let view;

function resizeView(showHomepage) {
  if (!win || !view) return;

  const [width, height] = win.getSize();

  if (showHomepage) {
    // hide browser view
    view.setBounds({ x: 0, y: 60, width: width, height: 0 });
  } else {
    // show browser view under navbar
    view.setBounds({ x: 0, y: 60, width: width, height: height - 60 });
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Shwe Browser",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: require('path').join(__dirname, 'preload.js'),
    },
  });

  win.loadFile("index.html");

  view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
    },
  });

  win.setBrowserView(view);

  // Start with homepage visible (browser hidden)
  resizeView(true);

  // Resize view when window resizes
  win.on("resize", () => {
    resizeView(false);
  });

  // URL updates
  view.webContents.on("did-navigate", (event, url) => {
    win.webContents.send("url-updated", url);
  });

  view.webContents.on("did-navigate-in-page", (event, url) => {
    win.webContents.send("url-updated", url);
  });
}

// Go URL
ipcMain.on("go-url", (event, url) => {
  url = url.trim();
  if (!url) return;

  // Basic URL validation
  try {
    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    new URL(url);
  } catch (e) {
    event.sender.send("url-updated", "Invalid URL");
    return;
  }

  resizeView(false);
  view.webContents.loadURL(url);
});

// Back / Forward (Electron v40 safe)
ipcMain.on("go-back", () => {
  if (view && view.webContents.navigationHistory.canGoBack()) {
    view.webContents.navigationHistory.goBack();
  } else if (win) {
    win.webContents.send("show-homepage");
    resizeView(true);
  }
});

ipcMain.on("go-forward", () => {
  if (view && view.webContents.navigationHistory.canGoForward()) {
    view.webContents.navigationHistory.goForward();
  }
});
ipcMain.on("go-home", () => {
  if (!win) return;

  // tell renderer to show homepage UI
  win.webContents.send("show-homepage");

  // hide BrowserView
  resizeView(true);
});
ipcMain.on("reload", () => {
  view.webContents.reload();
});

// Homepage show/hide
ipcMain.on("show-homepage", () => {
  resizeView(true);
});

ipcMain.on("hide-homepage", () => {
  resizeView(false);
});

app.whenReady().then(createWindow);