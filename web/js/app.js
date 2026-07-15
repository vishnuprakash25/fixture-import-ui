import { createFixtureImportApp } from './core/createFixtureImportApp.js';
import { mockActions } from './mock/mock-actions.js';
import { mockData } from './mock/mock-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = createFixtureImportApp({
    data: mockData,
    actions: mockActions
  });

  app.init();
});
