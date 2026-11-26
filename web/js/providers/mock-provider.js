import { mockActions } from '../mock/mock-actions.js?v=b4e6e85b9a';
import { mockData } from '../mock/mock-data.js?v=b4e6e85b9a';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

