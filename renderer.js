const ipcRenderer = window.electronAPI;

const urlInput = document.getElementById("url");
const searchInput = document.getElementById("searchInput");
const homepage = document.getElementById("homepage");

function hideHomepage() {
  homepage.style.display = "none";
  ipcRenderer.send("hide-homepage");
}

function showHomepage() {
  homepage.style.display = "flex";
  ipcRenderer.send("show-homepage");
}

function isValidURL(url) {
  // Basic validation for URL
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function openSite(url) {
  hideHomepage();
  urlInput.value = url;
  ipcRenderer.send("go-url", url);
}

// Event listeners

document.getElementById("goBtn").addEventListener("click", () => {
  hideHomepage();
  const url = urlInput.value.trim();
  if (!isValidURL(url)) {
    alert("Please enter a valid URL.");
    return;
  }
  ipcRenderer.send("go-url", url);
});

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    hideHomepage();
    const url = urlInput.value.trim();
    if (!isValidURL(url)) {
      alert("Please enter a valid URL.");
      return;
    }
    ipcRenderer.send("go-url", url);
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("go-back");
});

document.getElementById("forwardBtn").addEventListener("click", () => {
  ipcRenderer.send("go-forward");
});

document.getElementById("reloadBtn").addEventListener("click", () => {
  ipcRenderer.send("reload");
});

document.getElementById("homeBtn").addEventListener("click", () => {
  ipcRenderer.send("go-home");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  hideHomepage();
  ipcRenderer.send("go-url", url);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

ipcRenderer.on("url-updated", (event, url) => {
  urlInput.value = url;
});

ipcRenderer.on("show-homepage", () => {
  showHomepage();
});

// Start at homepage
showHomepage();

// Export openSite for quick links
window.openSite = openSite;
