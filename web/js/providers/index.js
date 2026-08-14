const MODE_KEY = 'fixture-import-ui.app-mode';

function getModeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get('mode') || '').trim().toLowerCase();
  return mode === 'real' || mode === 'mock' ? mode : '';
}

function getAppMode() {
  const urlMode = getModeFromUrl();
  if (urlMode) {
    window.localStorage.setItem(MODE_KEY, urlMode);
    return urlMode;
  }

  const storedMode = (window.localStorage.getItem(MODE_KEY) || '').trim().toLowerCase();
  if (storedMode === 'real' || storedMode === 'mock') return storedMode;

  if (window.__FIXTURE_APP_MODE__ === 'real' || window.__FIXTURE_APP_MODE__ === 'mock') {
    return window.__FIXTURE_APP_MODE__;
  }

  return 'mock';
}

export async function loadAppProvider() {
  const mode = getAppMode();

  if (mode === 'real') {
    const module = await import('./real-provider.js');
    return module.loadRealProvider();
  }

  const module = await import('./mock-provider.js');
  return module.loadMockProvider();
}

