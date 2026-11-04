import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=520eddcdb3';
import { loadAppProvider } from './providers/index.js?v=520eddcdb3';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({ data: provider.data, actions: provider.actions });

  app.init();
});
