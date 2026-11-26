import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=46a3b20ae3';
import { loadAppProvider } from './providers/index.js?v=46a3b20ae3';

// <html data-enabled-pages="1,2"> limits the app to those pages (used by /mvp1/).
function getEnabledPages() {
  const raw = document.documentElement.dataset.enabledPages || '';
  const pages = raw.split(',').map((value) => Number(value.trim())).filter(Number.isInteger);
  return pages.length ? pages : null;
}

// <html data-import-filter-mode="guided"> switches Import Fixtures to the MVP1 filters.
function getImportFilterMode() {
  return document.documentElement.dataset.importFilterMode === 'guided' ? 'guided' : 'standard';
}

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({
    data: provider.data,
    actions: provider.actions,
    enabledPages: getEnabledPages(),
    importFilterMode: getImportFilterMode()
  });

  app.init();
});
