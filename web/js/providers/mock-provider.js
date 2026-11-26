import { mockActions } from '../mock/mock-actions.js?v=53a25ac71d';
import { mockData } from '../mock/mock-data.js?v=53a25ac71d';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

