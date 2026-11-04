import { mockActions } from '../mock/mock-actions.js?v=520eddcdb3';
import { mockData } from '../mock/mock-data.js?v=520eddcdb3';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

