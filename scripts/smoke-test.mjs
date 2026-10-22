import assert from 'node:assert/strict';

import { buildFixtureTitle, filterFixtures, getGroupOptions, parseInputDate, sanitizeInlineSvg, toLocalISODate, toYYYYMMDD } from '../web/js/core/helpers.js';
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

// Date helpers must work on a LOCAL day basis. toISOString() would roll a date
// logged just after local midnight back into the previous UTC day, which
// silently drops matching rows from the Activity Log date filter.
assert.equal(toLocalISODate(new Date(2026, 5, 15, 0, 30)), '2026-06-15', 'toLocalISODate keeps the local day for times just after midnight');
assert.equal(toLocalISODate(new Date(2026, 5, 15, 23, 30)), '2026-06-15', 'toLocalISODate keeps the local day for times just before midnight');
assert.equal(toLocalISODate(null), '', 'toLocalISODate returns an empty string for no date');
assert.equal(toLocalISODate(parseInputDate('05/03/2024')), '2024-03-05', 'typed DD/MM/YYYY round-trips to the same local day');
assert.equal(parseInputDate('31/02/2029'), null, 'impossible dates are rejected rather than rolled over');
assert.equal(parseInputDate('5/3/2024').getMonth(), 2, 'single-digit day/month parses as DD/MM');

// Stat card icons are the only provider-supplied value rendered as raw markup,
// so the allow-list filter must drop anything executable.
assert.equal(sanitizeInlineSvg('<svg><script>alert(1)</script></svg>'), '', 'script tags are blocked');
assert.equal(sanitizeInlineSvg('<svg onload="alert(1)"><path d="M0 0"/></svg>'), '', 'inline event handlers are blocked');
assert.equal(sanitizeInlineSvg('<svg><a href="javascript:alert(1)">x</a></svg>'), '', 'javascript: URLs are blocked');
assert.equal(sanitizeInlineSvg('<svg><foreignObject><img src=x onerror=alert(1)></foreignObject></svg>'), '', 'foreignObject is blocked');
assert.equal(sanitizeInlineSvg('<img src=x onerror=alert(1)>'), '', 'non-SVG tags are blocked');
const safeIcon = '<svg viewBox="0 0 24 24"><path d="M3 3h18"/></svg>';
assert.equal(sanitizeInlineSvg(safeIcon), safeIcon, 'legitimate inline SVG icons pass through unchanged');

// The shipped mock icons must survive the filter, or the dashboard loses them.
mockData.dashboardStats.filter((stat) => stat.iconSvg).forEach((stat) => {
  assert.equal(sanitizeInlineSvg(stat.iconSvg), stat.iconSvg, `mock dashboard icon survives sanitising: ${stat.label}`);
});

console.log('Smoke test passed: core helpers and mock data are wired correctly.');

