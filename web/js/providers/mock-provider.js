import { mockActions } from '../mock/mock-actions.js?v=7fb7d89d3a';
import { mockData } from '../mock/mock-data.js?v=7fb7d89d3a';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

