import { createFixtureImportApp } from './core/createFixtureImportApp.js?v=54419a171f';
import { loadAppProvider } from './providers/index.js?v=54419a171f';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  const app = createFixtureImportApp({ data: provider.data, actions: provider.actions });

  app.init();
});
