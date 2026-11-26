import { mockActions } from '../mock/mock-actions.js?v=babb946dd4';
import { mockData } from '../mock/mock-data.js?v=babb946dd4';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

