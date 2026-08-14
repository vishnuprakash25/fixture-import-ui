import { createFixtureImportApp } from './core/createFixtureImportApp.js';
import { loadAppProvider } from './providers/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({ data: provider.data, actions: provider.actions });

  app.init();
});
