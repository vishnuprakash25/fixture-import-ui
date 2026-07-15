import assert from 'node:assert/strict';

import { buildFixtureTitle, filterFixtures, getGroupOptions, toYYYYMMDD } from '../web/js/core/helpers.js';
import { mockData } from '../web/js/mock/mock-data.js';

assert.equal(toYYYYMMDD('Dec 22, 2025'), '20251222');
assert.equal(
  buildFixtureTitle({ fixtureName: 'Arsenal vs Chelsea', prefix: 'Football', suffix: '20251222' }),
  'Football - Arsenal vs Chelsea - 20251222'
);

const filteredBySearch = filterFixtures(
  mockData.importableFixtures,
  { search: 'arsenal', sports: new Set(), groups: new Set(), dateFrom: null, dateTo: null },
  mockData.fixtureGroups
);
assert.ok(filteredBySearch.some((fixture) => fixture.name === 'Arsenal vs Chelsea'));

const filteredBySport = filterFixtures(
  mockData.importableFixtures,
  { search: '', sports: new Set(['tennis']), groups: new Set(), dateFrom: null, dateTo: null },
  mockData.fixtureGroups
);
assert.ok(filteredBySport.every((fixture) => fixture.typeId === 'tennis'));

const groupOptions = getGroupOptions(mockData.fixtureGroups);
assert.ok(groupOptions.some((group) => group.id === 'premier-league-2025'));
assert.ok(mockData.recentlyImported.length > 0);
assert.ok(mockData.activityLog.length > 0);

console.log('Smoke test passed: core helpers and mock data are wired correctly.');

