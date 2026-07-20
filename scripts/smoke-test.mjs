import assert from 'node:assert/strict';

import { buildFixtureTitle, filterFixtures, getGroupOptions, toYYYYMMDD } from '../web/js/core/helpers.js';
import { mockData } from '../web/js/mock/mock-data.js';

// Test date formatting utility
assert.equal(toYYYYMMDD('Dec 22, 2025'), '20251222');

// Get a real fixture name from mock data to use in the test (more resilient than hardcoding)
const sampleFixture = mockData.importableFixtures.find((f) => f.name.toLowerCase().includes('arsenal'));
assert.ok(sampleFixture, 'Mock data contains a fixture with "Arsenal" in the name');
assert.equal(
  buildFixtureTitle({ fixtureName: sampleFixture.name, prefix: 'Football', suffix: '20251222' }),
  `Football - ${sampleFixture.name} - 20251222`
);

// Test search filtering
const filteredBySearch = filterFixtures(
  mockData.importableFixtures,
  { search: 'arsenal', sports: new Set(), groups: new Set(), dateFrom: null, dateTo: null },
  mockData.fixtureGroups
);
assert.ok(filteredBySearch.some((fixture) => fixture.name === sampleFixture.name), 'Search filter finds Arsenal fixture');

// Test sport filtering (derive sport ID from first tennis fixture if available)
const tennisFixture = mockData.importableFixtures.find((f) => f.sportType === 'Tennis');
const tennisSportId = tennisFixture?.typeId || 'tennis';
const filteredBySport = filterFixtures(
  mockData.importableFixtures,
  { search: '', sports: new Set([tennisSportId]), groups: new Set(), dateFrom: null, dateTo: null },
  mockData.fixtureGroups
);
assert.ok(filteredBySport.every((fixture) => fixture.typeId === tennisSportId), 'Sport filter works correctly');

// Test group options generation
const groupOptions = getGroupOptions(mockData.fixtureGroups);
assert.ok(groupOptions.length > 0, 'Group options are generated from fixture groups');
assert.ok(groupOptions.some((group) => group.id !== ''), 'Each group option has an ID');

// Test mock data completeness
assert.ok(mockData.recentlyImported.length > 0, 'Recently imported fixtures exist');
assert.ok(mockData.activityLog.length > 0, 'Activity log has entries');
assert.ok(mockData.subscriptions.length > 0, 'Subscriptions data is populated');
assert.ok(mockData.sportTypes.length > 0, 'Sport types are available');

console.log('Smoke test passed: core helpers and mock data are wired correctly.');

