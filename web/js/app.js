import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=b4e6e85b9a';
import { loadAppProvider } from './providers/index.js?v=b4e6e85b9a';

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

// <html data-fixture-columns="fixture,group,…"> sets the Import Fixtures table columns.
function getFixtureColumns() {
  const raw = document.documentElement.dataset.fixtureColumns || '';
  const columns = raw.split(',').map((value) => value.trim()).filter(Boolean);
  return columns.length ? columns : null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({
    data: provider.data,
    actions: provider.actions,
    enabledPages: getEnabledPages(),
    importFilterMode: getImportFilterMode(),
    fixtureColumns: getFixtureColumns()
  });

  app.init();
});
