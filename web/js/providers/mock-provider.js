import { mockActions } from '../mock/mock-actions.js?v=6cc5c71119';
import { mockData } from '../mock/mock-data.js?v=6cc5c71119';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

