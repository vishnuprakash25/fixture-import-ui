import { mockActions } from '../mock/mock-actions.js?v=46a3b20ae3';
import { mockData } from '../mock/mock-data.js?v=46a3b20ae3';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

