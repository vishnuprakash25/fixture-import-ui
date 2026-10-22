import { mockActions } from '../mock/mock-actions.js?v=54419a171f';
import { mockData } from '../mock/mock-data.js?v=54419a171f';

export async function loadMockProvider() {
  return {
    mode: 'mock',
    data: mockData,
    actions: mockActions
  };
}

