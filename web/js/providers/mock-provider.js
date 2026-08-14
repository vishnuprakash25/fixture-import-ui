import { mockActions } from '../mock/mock-actions.js';
import { mockData } from '../mock/mock-data.js';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

