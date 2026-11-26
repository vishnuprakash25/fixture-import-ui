import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=babb946dd4';
import { parseEnabledPages, parseListAttribute } from './core/helpers.js?v=babb946dd4';
import { loadAppProvider } from './providers/index.js?v=babb946dd4';

const rootData = document.documentElement.dataset;

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({
    data: provider.data,
    actions: provider.actions,
    // <html data-enabled-pages="1" data-import-filter-mode="guided" data-fixture-columns="…"> (used by /mvp1/).
    enabledPages: parseEnabledPages(rootData.enabledPages),
    importFilterMode: rootData.importFilterMode === 'guided' ? 'guided' : 'standard',
    fixtureColumns: parseListAttribute(rootData.fixtureColumns)
  });

  app.init();
});
