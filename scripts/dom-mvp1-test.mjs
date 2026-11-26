import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { JSDOM } from 'jsdom';

import { createFixtureImportApp } from '../web/js/core/createFixtureImportApp.js';
import { getFixtureGroupsForCriteria } from '../web/js/core/helpers.js';
import { mockData } from '../web/js/mock/mock-data.js';

// Exercises the generated /mvp1/ shell: same app, Import Fixtures page only.
const htmlPath = new URL('../mvp1/index.html', import.meta.url);
let html = await fs.readFile(htmlPath, 'utf8');
html = html.replace(/<script type="module" src="js\/app\.js(?:\?v=[^"]*)?"><\/script>/, '');

const dom = new JSDOM(html, { url: 'http://localhost/mvp1/', pretendToBeVisual: true });
const { window } = dom;
window.alert = () => {};

Object.defineProperty(globalThis, 'window', { value: window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
Object.assign(globalThis, {
  Node: window.Node,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  getComputedStyle: window.getComputedStyle
});

const click = (element) => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const activePage = () => document.querySelector('.page.active')?.dataset.pageIndex;

assert.equal(document.querySelector('base')?.getAttribute('href'), '../web/', 'MVP1 resolves shared assets from /web/');
assert.equal(document.documentElement.dataset.enabledPages, '1', 'MVP1 enables only the Import Fixtures page');

const enabledPages = document.documentElement.dataset.enabledPages.split(',').map(Number);
assert.equal(document.documentElement.dataset.importFilterMode, 'guided', 'MVP1 uses the guided import filters');

// Controllable mock of the fixture-group API so loading/error states can be asserted.
const apiCalls = [];
let failNextGroupFetch = false;
const fetchFixtureGroups = async (criteria) => {
  apiCalls.push(criteria);
  if (failNextGroupFetch) {
    failNextGroupFetch = false;
    throw new Error('API down');
  }
  return getFixtureGroupsForCriteria(
    criteria.data.importableFixtures.filter((fixture) => fixture.status !== 'Imported'),
    { sports: criteria.sportIds, dateFrom: criteria.dateFrom, dateTo: criteria.dateTo },
    criteria.data.fixtureGroups
  );
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const fixtureColumns = document.documentElement.dataset.fixtureColumns.split(',');
createFixtureImportApp({ data: mockData, actions: { fetchFixtureGroups }, enabledPages, importFilterMode: 'guided', fixtureColumns }).init();

assert.equal(activePage(), '1', 'MVP1 opens on Import Fixtures');
const visibleNav = [...document.querySelectorAll('.nav-item[data-page-index]')].filter((item) => !item.hidden);
assert.deepEqual(visibleNav.map((item) => item.dataset.pageIndex), ['1'], 'only the Import Fixtures nav item is visible');
const visibleSections = [...document.querySelectorAll('.nav-section')].filter((section) => !section.hidden);
assert.equal(visibleSections.length, 1, 'nav sections without visible items are hidden');

click(document.querySelector('.nav-item[data-page-index="0"]'));
click(document.querySelector('.nav-item[data-page-index="2"]'));
click(document.querySelector('.nav-item[data-page-index="3"]'));
assert.equal(activePage(), '1', 'disabled pages cannot be navigated to');

document.getElementById('loginEmailInput').value = 'tester@skysports.com';
document.getElementById('loginPasswordInput').value = 'password';
document.getElementById('loginForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.equal(activePage(), '1', 'signing in lands on Import Fixtures, not the dashboard');

// ─── Guided filters ───
const toolbar = document.querySelector('.toolbar-guided');
const sportTrigger = document.getElementById('sportTriggerBtn');
const dateTrigger = document.getElementById('dateTriggerBtn');
const groupTrigger = document.getElementById('groupTriggerBtn');
const hint = document.getElementById('guidedFilterHint');
const rows = () => document.querySelectorAll('#fixturesTableBody tr');
const selectOption = (container, value, checked = true) => {
  const input = document.querySelector(`#${container} input[value="${value}"]`);
  input.checked = checked;
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
};

assert.ok(document.getElementById('fixtureSearchInput').hidden, 'free-text search is hidden');
const fieldOrder = [...toolbar.querySelectorAll('.guided-field')].map((field) => field.querySelector('.multiselect-wrapper, .daterange-wrapper').id);
assert.deepEqual(fieldOrder, ['sportTypeMultiselect', 'dateRangeWrapper', 'fixtureGroupMultiselect'], 'filters are ordered Sport, Date range, Fixture group');
assert.equal(toolbar.querySelectorAll('.guided-field .sr-only').length, 3, 'each filter has an accessible required label');
[sportTrigger, dateTrigger, groupTrigger].forEach((trigger) => assert.equal(trigger.getAttribute('aria-required'), 'true'));
assert.ok(groupTrigger.disabled, 'fixture group selector is disabled until sport and dates are chosen');
assert.match(document.getElementById('groupFilterLabel').textContent, /sport & dates first/i);
assert.ok(hint.hidden, 'no hint message by default; the group placeholder guides the user');

click(document.getElementById('searchFixturesBtn'));
assert.equal(apiCalls.length, 0, 'no API call before sport and dates are chosen');
assert.ok(toolbar.querySelectorAll('.guided-field.is-invalid').length === 3, 'Search with nothing selected flags all three required fields');
assert.match(rows()[0].textContent, /Select a sport, date range and fixture group/);
assert.ok(!hint.hidden && hint.dataset.tone === 'error', 'Search with missing fields shows a short validation message');

// Selecting a sport defaults the date range to today → today + 365 days and queries groups.
selectOption('sportOptions', 'football');
const today = new Date();
today.setHours(0, 0, 0, 0);
const inAYear = new Date(today);
inAYear.setDate(inAYear.getDate() + 365);
const fmt = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
assert.equal(document.getElementById('dateFromInput').value, fmt(today), 'date range defaults from today');
assert.equal(document.getElementById('dateToInput').value, fmt(inAYear), 'date range defaults to today + 365 days');
assert.notEqual(document.getElementById('dateRangeLabel').textContent, 'Select date range');
assert.equal(apiCalls.length, 1, 'choosing a sport (with the default dates) fires the fixture group query');
assert.deepEqual(apiCalls[0].sportIds, ['football']);
assert.equal(apiCalls[0].dateFrom.getTime(), today.getTime());
assert.equal(apiCalls[0].dateTo.getTime(), inAYear.getTime());
assert.match(document.getElementById('groupFilterLabel').textContent, /loading/i, 'group selector shows loading while groups are fetched');
assert.ok(groupTrigger.disabled, 'group selector stays disabled while loading');

await flush();
assert.ok(!groupTrigger.disabled, 'group selector enabled once groups load');
const footballGroups = [...document.querySelectorAll('#groupOptions input')].map((input) => input.value);
assert.ok(footballGroups.length > 0, 'fixture groups populated from the API');
footballGroups.forEach((id) => assert.equal(mockData.fixtureGroups[id].sport, 'Football', 'only football groups are offered'));
const firstOption = document.querySelector('#groupOptions .multiselect-option');
assert.equal(firstOption.querySelector('.multiselect-option-title').textContent, mockData.fixtureGroups[footballGroups[0]].name);
assert.match(firstOption.querySelector('.multiselect-option-meta').textContent, /^Football · .+ – .+$/, 'group option shows sport and season dates');
assert.ok(!document.querySelector('.multiselect-option-count'), 'no fixture counts in the group dropdown');
assert.ok(document.getElementById('groupDropdown').classList.contains('multiselect-dropdown-wide'));
assert.equal(rows().length, 1, 'no fixtures shown until a fixture group is chosen');

// Adding a second sport re-queries; the date range the user has is kept.
selectOption('sportOptions', 'tennis');
assert.equal(apiCalls.length, 2, 'changing sports re-queries fixture groups');
assert.deepEqual([...apiCalls[1].sportIds].sort(), ['football', 'tennis']);
assert.equal(apiCalls[1].dateTo.getTime(), inAYear.getTime(), 'second sport does not reset the date range');
await flush();

selectOption('groupOptions', footballGroups[0]);
assert.ok(hint.hidden, 'hint hidden once all filters are set');
assert.equal(rows().length, 1, 'selecting a group does not list fixtures by itself');
assert.match(rows()[0].textContent, /Click Search/, 'user is prompted to click Search');
click(document.getElementById('searchFixturesBtn'));
assert.ok(rows().length > 0 && !rows()[0].querySelector('.empty-state'), 'fixtures shown after Search once all three filters are set');
const headers = [...document.querySelectorAll('#fixturesTable thead th')].map((th) => th.getAttribute('aria-label') || th.textContent.trim());
assert.deepEqual(headers, ['', 'Fixture', 'Fixture Group', 'Type', 'Scheduled Start Date', 'Elapsed Time', 'Fixture ID', ''], 'MVP1 fixture columns');
const firstCells = [...rows()[0].children].map((td) => td.textContent.trim());
assert.equal(firstCells.length, headers.length, 'row cells line up with headers');
assert.match(firstCells[5], /^\d{2}:\d{2}:\d{2}$/, 'elapsed time is HH:MM:SS');
const audit = rows()[0].querySelector('.fixture-audit').textContent.match(/^Created (.+) · Updated (.+)$/);
assert.ok(audit, 'created/updated dates shown under the fixture name');
assert.ok(new Date(audit[1]) <= new Date(audit[2]), 'created date is not after updated date');
assert.ok(new Date(audit[2]) < new Date(firstCells[4]), 'updated before scheduled start');
[...rows()].forEach((row) => assert.ok(row.textContent.includes(mockData.fixtureGroups[footballGroups[0]].name), 'rows belong to the selected group'));

// The user can change the period; a narrower range re-queries and prunes groups.
click(dateTrigger);
document.querySelector('[data-date-preset="today"]').click();
document.getElementById('applyDatePickerBtn').click();
assert.equal(apiCalls.length, 3, 'changing the date range re-queries fixture groups');
assert.match(rows()[0].textContent, /Click Search|Select a sport/, 'changing filters hides results until the next Search');
await flush();
assert.equal(document.getElementById('dateFromInput').value, fmt(today), 'user-chosen range is applied');
assert.equal(document.getElementById('dateToInput').value, fmt(today));
assert.equal(document.querySelectorAll('#groupOptions input:checked').length, 0, 'groups outside the new criteria are deselected');

// Clearing the date range locks the group selector again.
document.getElementById('dateClearBtn').click();
assert.ok(groupTrigger.disabled, 'clearing dates disables the group selector');
assert.match(document.getElementById('groupFilterLabel').textContent, /sport & dates first/i);

// Re-applying dates after an API failure shows a retry affordance.
failNextGroupFetch = true;
click(dateTrigger);
document.querySelector('[data-date-preset="quarter"]').click();
document.getElementById('applyDatePickerBtn').click();
await flush();
assert.equal(hint.dataset.tone, 'error', 'API failure is surfaced');
assert.ok(groupTrigger.disabled);
const callsBeforeRetry = apiCalls.length;
hint.querySelector('[data-action="retry-groups"]').click();
assert.equal(apiCalls.length, callsBeforeRetry + 1, 'Retry re-queries fixture groups');
await flush();
assert.ok(!hint.querySelector('[data-action="retry-groups"]'), 'retry recovers');
assert.doesNotMatch(hint.textContent, /couldn.t load/i);

// Clearing sports resets everything downstream.
document.getElementById('sportClearBtn').click();
assert.ok(groupTrigger.disabled, 'clearing sports disables the group selector');
assert.match(rows()[0].textContent, /Select a sport, date range and fixture group/);

console.log('MVP1 DOM checks passed.');
