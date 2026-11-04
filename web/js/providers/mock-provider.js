import { mockActions } from '../mock/mock-actions.js?v=987c722c04';
import { mockData } from '../mock/mock-data.js?v=987c722c04';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

