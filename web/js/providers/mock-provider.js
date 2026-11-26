import { mockActions } from '../mock/mock-actions.js?v=45f73ef3e0';
import { mockData } from '../mock/mock-data.js?v=45f73ef3e0';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

