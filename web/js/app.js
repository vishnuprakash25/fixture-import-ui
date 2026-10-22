import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=c3c9a04b7a';
import { loadAppProvider } from './providers/index.js?v=c3c9a04b7a';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({ data: provider.data, actions: provider.actions });

  app.init();
});
