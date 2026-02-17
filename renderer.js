const { navigate, goBack, goForward, reload, goHome, onUrlUpdate, onShowHomepage, hideHomepage: sendHideHomepage, showHomepage: sendShowHomepage, setFontMode } = window.electronAPI;

let currentFontMode = 'auto'; // auto, unicode, zawgyi

const urlInput = document.getElementById("url");
const searchInput = document.getElementById("searchInput");
const homepage = document.getElementById("homepage");

// Helper to hide homepage and tell main process
function hideHomepage() {
  homepage.style.display = "none";
  sendHideHomepage();
}

// Helper to show homepage
function showHomepage() {
  homepage.style.display = "flex";
  sendShowHomepage();
}

// Smart navigation handler
function handleNavigation(input) {
  if (!input) return;
  hideHomepage();
  navigate(input); // Send raw input to main process, let it decide
}

// Main Toolbar Events
document.getElementById("goBtn").addEventListener("click", () => {
  handleNavigation(urlInput.value.trim());
});

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleNavigation(urlInput.value.trim());
  }
});

document.getElementById("backBtn").addEventListener("click", goBack);
document.getElementById("forwardBtn").addEventListener("click", goForward);
document.getElementById("reloadBtn").addEventListener("click", reload);
document.getElementById("homeBtn").addEventListener("click", goHome);

document.getElementById("fontBtn").addEventListener("click", () => {
  const btn = document.getElementById("fontBtn");
  if (currentFontMode === 'auto') {
    currentFontMode = 'unicode';
    // Unicode Icon (U)
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">U</text><circle cx="12" cy="12" r="10"/></svg>`;
    btn.title = "Current: Unicode (Click for Zawgyi)";
    setFontMode('unicode');
  } else if (currentFontMode === 'unicode') {
    currentFontMode = 'zawgyi';
    // Zawgyi Icon (Z)
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">Z</text><circle cx="12" cy="12" r="10"/></svg>`;
    btn.title = "Current: Zawgyi (Click for Auto)";
    setFontMode('zawgyi');
  } else {
    currentFontMode = 'auto';
    // Auto Icon (A)
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">A</text><circle cx="12" cy="12" r="10"/></svg>`;
    btn.title = "Current: Auto (Click for Unicode)";
    setFontMode('auto');
  }
});

// Theme Toggle
const themeBtn = document.getElementById("themeBtn");

// Check local storage or default to dark
let savedTheme = localStorage.getItem('theme');
let isDarkMode = savedTheme ? (savedTheme === 'dark') : true;

// Apply initial state
// SVG Icons for Theme
const moonIcon = `<svg class="moon-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunIcon = `<svg class="sun-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

// Apply initial state
if (!isDarkMode) {
  document.documentElement.setAttribute("data-theme", "light");
  themeBtn.innerHTML = sunIcon;
  themeBtn.title = "Switch to Dark Mode";
} else {
  document.documentElement.removeAttribute("data-theme");
  themeBtn.innerHTML = moonIcon;
  themeBtn.title = "Switch to Light Mode";
}

themeBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.documentElement.removeAttribute("data-theme");
    themeBtn.innerHTML = moonIcon;
    themeBtn.title = "Switch to Light Mode";
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeBtn.innerHTML = sunIcon;
    themeBtn.title = "Switch to Dark Mode";
    localStorage.setItem('theme', 'light');
  }
});

// Homepage Events
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    handleNavigation(query); // Treat as search query
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

// IPC Listeners
onUrlUpdate((url) => {
  urlInput.value = url;
});

onShowHomepage(() => {
  showHomepage();
});

// Start at homepage
showHomepage();

// Expose openSite for quick links (used in HTML onclick)
window.openSite = (url) => {
  handleNavigation(url);
};
