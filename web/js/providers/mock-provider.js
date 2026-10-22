import { mockActions } from '../mock/mock-actions.js?v=c3c9a04b7a';
import { mockData } from '../mock/mock-data.js?v=c3c9a04b7a';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

