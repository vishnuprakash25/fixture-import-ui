import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=987c722c04';
import { loadAppProvider } from './providers/index.js?v=987c722c04';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({ data: provider.data, actions: provider.actions });

  app.init();
});
