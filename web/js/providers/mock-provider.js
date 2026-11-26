import { mockActions } from '../mock/mock-actions.js?v=df7c39027d';
import { mockData } from '../mock/mock-data.js?v=df7c39027d';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

