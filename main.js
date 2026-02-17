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

let currentFontCssKey = null;

async function applyFontMode(mode) {
  if (!view) return;

  // Remove previous font CSS if any
  if (currentFontCssKey) {
    try {
      await view.webContents.removeInsertedCSS(currentFontCssKey);
    } catch (e) { /* ignore */ }
    currentFontCssKey = null;
  }

  let css = "";
  if (mode === 'zawgyi') {
    // Force Zawgyi fonts
    css = `* { font-family: "Zawgyi-One", "Zawgyi1", "Zawgyi-One-2008", sans-serif !important; }`;
  } else if (mode === 'unicode') {
    // Force Unicode fonts (Pyidaungsu is reliable, Padauk is common)
    css = `* { font-family: "Pyidaungsu", "Padauk", "Myanmar Text", sans-serif !important; }`;
  }

  if (css) {
    try {
      currentFontCssKey = await view.webContents.insertCSS(css);
    } catch (e) {
      console.error("Failed to apply font:", e);
    }
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
// Go URL / Search
ipcMain.on("go-url", (event, input) => {
  let url = input.trim();
  if (!url) return;

  // Smart Omnibox Logic
  // Check if it looks like a domain or URL
  const hasProtocol = url.startsWith("http://") || url.startsWith("https://");
  const hasDomain = url.includes(".") && !url.includes(" "); // strict check: must have dot, no spaces

  if (hasProtocol) {
    // already a valid URL format
  } else if (hasDomain) {
    // "google.com" -> "https://google.com"
    url = "https://" + url;
  } else {
    // Treat as search query
    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  }

  resizeView(false);
  view.webContents.loadURL(url).catch((err) => {
    // Fallback if load fails? For now just log
    console.error("Failed to load:", url, err);
    // Could send error back to renderer
  });
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

ipcMain.on("set-font-mode", (event, mode) => {
  applyFontMode(mode);
});

app.whenReady().then(createWindow);