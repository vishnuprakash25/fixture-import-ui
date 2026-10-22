import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { JSDOM } from 'jsdom';

import { createFixtureImportApp } from '../web/js/core/createFixtureImportApp.js';
import { mockData } from '../web/js/mock/mock-data.js';

const htmlPath = new URL('../web/index.html', import.meta.url);
let html = await fs.readFile(htmlPath, 'utf8');
// Tolerates the ?v=<hash> cache-bust stamp added by scripts/cache-bust.mjs.
html = html.replace(/<script type="module" src="js\/app\.js(?:\?v=[^"]*)?"><\/script>/, '');

const dom = new JSDOM(html, {
  url: 'http://localhost/web/',
  pretendToBeVisual: true
});

const { window } = dom;
Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
Object.defineProperty(window.navigator, 'clipboard', {
  value: {
    written: [],
    async writeText(text) {
      this.written.push(text);
    }
  },
  configurable: true
});
window.alert = () => {};
window.confirm = () => true;

Object.defineProperty(globalThis, 'window', { value: window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
Object.assign(globalThis, {
  Node: window.Node,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  getComputedStyle: window.getComputedStyle,
  alert: window.alert,
  confirm: window.confirm
});

// ─── Derive test data from mock data to reduce hardcoding ───
const recentlyImportedPreviewLimit = 5; // dashboard shows a capped preview, see renderRecentlyImported
const recentlyImportedCount = Math.min(mockData.recentlyImported.length, recentlyImportedPreviewLimit);
const pageSize = 12; // pagination.pageSize from createFixtureImportApp.js
const sportIds = new Set(mockData.sportTypes.map((sport) => sport.id));
// The Import Fixtures table only lists fixtures that have not been imported yet.
const availableFixtures = mockData.importableFixtures.filter((f) => f.status !== 'Imported');
// Import Fixtures is search-first: nothing renders until a search or filter is applied.
// Selecting every sport is the broadest filter available, so it stands in for "show all".
const allSportFixtures = availableFixtures.filter((f) => sportIds.has(f.typeId));
const allSportRowsOnPage1 = Math.min(allSportFixtures.length, pageSize);

// Mirrors the searchable text built by filterFixtures() in web/js/core/helpers.js
const searchTextFor = (f) => [
  f.name, f.shortId, f.id, f.sportType, f.venue, f.date, mockData.fixtureGroups[f.groupId]?.name ?? ''
].join(' ').toLowerCase();
const searchTerm = String(availableFixtures[0]?.name ?? '').split(' ')[0];
const expectedSearchRows = Math.min(
  availableFixtures.filter((f) => searchTextFor(f).includes(searchTerm.toLowerCase())).length,
  pageSize
);
const uniqueSearchId = availableFixtures[0]?.id;
const firstAvailableName = availableFixtures[0]?.name;
const secondAvailableName = availableFixtures[1]?.name;
const sampleGroupId = mockData.importableFixtures.find((f) => f.name.toLowerCase().includes('wimbledon'))?.groupId || 'wimbledon-2026';
const sampleGroupName = mockData.fixtureGroups[sampleGroupId]?.name || 'Wimbledon 2026';

assert.ok(firstAvailableName, 'Mock data has at least one available fixture');
assert.ok(secondAvailableName, 'Mock data has at least two available fixtures for bulk import test');

const calls = {
  refreshData: 0,
  confirmSingleImport: [],
  confirmBulkImport: [],
  showActivity: [],
  exportLog: 0,
  viewActivityDetails: []
};

const actions = {
  notify() {},
  refreshData() { calls.refreshData += 1; },
  confirmSingleImport(payload) { calls.confirmSingleImport.push(payload); },
  confirmBulkImport(payload) { calls.confirmBulkImport.push(payload); },
  showActivity(payload) { calls.showActivity.push(payload); },
  exportLog() { calls.exportLog += 1; },
  viewActivityDetails(payload) { calls.viewActivityDetails.push(payload); }
};

const app = createFixtureImportApp({ data: mockData, actions });
app.init();

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (el) => {
  assert.ok(el, 'Expected element to exist before clicking');
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
};
const change = (el) => el.dispatchEvent(new window.Event('change', { bubbles: true }));
const input = (el) => el.dispatchEvent(new window.Event('input', { bubbles: true }));
const keydown = (el, key, init = {}) => el.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

const fixtureRowCount = () => document.querySelectorAll('#fixturesTableBody tr').length;
const assertFixturePrompt = (context) => {
  assert.equal(fixtureRowCount(), 1, `${context}: fixture table falls back to a single prompt row`);
  assert.match(
    document.querySelector('#fixturesTableBody .empty-state').textContent,
    /Use the search bar or filters above/i,
    `${context}: search-first prompt is shown`
  );
};
// Broadest available filter: tick every sport so the full fixture set is paginated.
const showAllFixtures = () => {
  mockData.sportTypes.forEach((sport) => {
    const checkbox = document.querySelector(`#sportOptions input[value="${sport.id}"]`);
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      change(checkbox);
    }
  });
};

assert.equal(document.querySelectorAll('#dashboardStats .stat-card').length, 3, 'dashboard stats render');
assert.equal(document.querySelectorAll('#recentlyImportedBody tr').length, recentlyImportedCount, `recently imported table renders ${recentlyImportedCount} rows from mock data`);
assertFixturePrompt('initial load');

click(document.querySelector('.nav-item[data-page-index="2"]'));
assert.ok(document.querySelector('.page[data-page-index="2"]').classList.contains('active'), 'subscriptions page becomes active');
click(document.getElementById('viewAllBtn'));
assert.ok(document.querySelector('.page[data-page-index="2"]').classList.contains('active'), 'view all keeps published fixtures view active');

click(document.getElementById('themeToggleBtn'));
assert.ok(document.body.classList.contains('dark'), 'dark theme toggles on');
assert.match(document.getElementById('themeToggleBtn').title, /light mode/i, 'theme toggle tooltip updates in dark mode');
click(document.getElementById('themeToggleBtn'));
assert.ok(!document.body.classList.contains('dark'), 'dark theme toggles off');

click(document.getElementById('refreshDataBtn'));
assert.equal(calls.refreshData, 1, 'refresh action is invoked');

const searchInput = document.getElementById('fixtureSearchInput');
searchInput.value = searchTerm;
input(searchInput);
assert.equal(fixtureRowCount(), expectedSearchRows, `search for '${searchTerm}' narrows fixture rows to ${expectedSearchRows}`);
searchInput.value = uniqueSearchId;
input(searchInput);
assert.equal(fixtureRowCount(), 1, 'search by fixture id matches exactly one row');
searchInput.value = '';
input(searchInput);
assertFixturePrompt('search cleared');

const tennisCheckbox = document.querySelector('#sportOptions input[value="tennis"]');
tennisCheckbox.checked = true;
change(tennisCheckbox);
const tennisFixturesCount = availableFixtures.filter((f) => f.typeId === 'tennis').length;
const expectedRowsOnPage1 = Math.min(tennisFixturesCount, pageSize);
assert.equal(fixtureRowCount(), expectedRowsOnPage1, `sport filter narrows to tennis fixtures (${expectedRowsOnPage1} rows on first page)`);
assert.equal(document.getElementById('sportFilterLabel').textContent, 'Tennis', 'sport filter label updates');
click(document.getElementById('sportClearBtn'));
assertFixturePrompt('sport filter cleared');

const groupCheckbox = document.querySelector(`#groupOptions input[value="${sampleGroupId}"]`);
groupCheckbox.checked = true;
change(groupCheckbox);
const wimbledonFixtures = availableFixtures.filter((f) => f.groupId === sampleGroupId);
assert.equal(fixtureRowCount(), wimbledonFixtures.length, `group filter narrows to ${wimbledonFixtures.length} ${sampleGroupName} fixtures`);
click(document.getElementById('groupClearBtn'));
assertFixturePrompt('group filter cleared');

click(document.getElementById('dateTriggerBtn'));
const monthLabel = document.getElementById('calMonth1');
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let guard = 0;
while (monthLabel.textContent !== 'July 2026' && guard < 36) {
  const [monthName, yearText] = monthLabel.textContent.split(' ');
  const currentIndex = Number(yearText) * 12 + monthNames.indexOf(monthName);
  const targetIndex = 2026 * 12 + monthNames.indexOf('July');
  click(document.getElementById(currentIndex < targetIndex ? 'datePickerNextBtn' : 'datePickerPrevBtn'));
  guard += 1;
}
assert.equal(monthLabel.textContent, 'July 2026', 'date picker can navigate to July 2026');
click(Array.from(document.querySelectorAll('#calGrid1 .cal-day')).find((el) => el.textContent.trim() === '2'));
click(Array.from(document.querySelectorAll('#calGrid1 .cal-day')).find((el) => el.textContent.trim() === '13'));
click(document.getElementById('applyDatePickerBtn'));
assert.ok(document.querySelectorAll('#fixturesTableBody tr').length >= 1, 'date range filter narrows fixtures to July range');
assert.match(document.getElementById('dateRangeLabel').textContent, /Jul 2, 2026/, 'date filter label updates');
click(document.getElementById('dateClearBtn'));
assertFixturePrompt('date filter cleared');

// ─── Typed From/To inputs handle ranges spanning several years ───
click(document.getElementById('dateTriggerBtn'));
const dateFromInput = document.getElementById('dateFromInput');
const dateToInput = document.getElementById('dateToInput');
assert.ok(document.getElementById('dateFromField').classList.contains('is-active'), 'From field is active when the picker opens');
dateFromInput.value = '12042017';
input(dateFromInput);
assert.equal(dateFromInput.value, '12/04/2017', 'typed digits are masked into DD/MM/YYYY');
assert.equal(monthLabel.textContent, 'April 2017', 'calendar jumps to the typed From month');
dateToInput.value = '22/05/2028';
input(dateToInput);
assert.equal(monthLabel.textContent, 'May 2028', 'calendar jumps to the typed To month');
assert.match(document.getElementById('dateRangeText').textContent, /Apr 12, 2017 → May 22, 2028/, 'footer shows the multi-year range');
// Out-of-order entry is normalised rather than rejected.
dateFromInput.value = '01/01/2030';
input(dateFromInput);
assert.equal(dateFromInput.value, '22/05/2028', 'out-of-order dates are swapped so From stays earliest');
assert.equal(dateToInput.value, '01/01/2030', 'swapped To date keeps the later value');
// Impossible dates are rejected with an inline message instead of rolling over.
dateToInput.value = '31/02/2029';
input(dateToInput);
const dateInputError = document.getElementById('dateInputError');
assert.ok(!dateInputError.hidden, 'invalid typed date surfaces an inline error');
dateToInput.value = '01/01/2030';
input(dateToInput);
assert.ok(dateInputError.hidden, 'inline error clears once a valid date is typed');
click(document.getElementById('datePickerPrevYearBtn'));
assert.equal(monthLabel.textContent, 'January 2029', 'year step buttons move a full year at a time');
click(document.getElementById('datePickerNextYearBtn'));
assert.equal(monthLabel.textContent, 'January 2030', 'year step buttons move forward a full year');
click(document.getElementById('applyDatePickerBtn'));
assert.match(document.getElementById('dateRangeLabel').textContent, /2028.*2030/, 'typed multi-year range applies to the filter label');
click(document.getElementById('dateClearBtn'));
assert.equal(dateFromInput.value, '', 'clearing the range empties the typed inputs');
assert.equal(dateToInput.value, '', 'clearing the range empties the To input');
assertFixturePrompt('typed date filter cleared');

// ─── Month/year quick jump inside the date picker calendar ───
click(document.getElementById('dateTriggerBtn'));
const calJump = document.getElementById('calJump1');
click(monthLabel);
assert.ok(calJump.classList.contains('open'), 'clicking the month label opens the month/year jump panel');
assert.equal(calJump.querySelectorAll('[data-cal-jump-month]').length, 12, 'jump panel lists all 12 months');
click(calJump.querySelector('[data-cal-jump-mode="year"]'));
assert.equal(calJump.querySelectorAll('[data-cal-jump-year]').length, 12, 'jump panel switches to a 12-year grid');
let yearGuard = 0;
while (!calJump.querySelector('[data-cal-jump-year="2030"]') && yearGuard < 30) {
  const firstYear = Number(calJump.querySelector('[data-cal-jump-year]').dataset.calJumpYear);
  click(calJump.querySelector(`[data-cal-jump-step="${firstYear < 2030 ? 1 : -1}"]`));
  yearGuard += 1;
}
click(calJump.querySelector('[data-cal-jump-year="2030"]'));
click(calJump.querySelector('[data-cal-jump-month="3"]'));
assert.equal(monthLabel.textContent, 'April 2030', 'jump panel navigates straight to April 2030');
assert.ok(!calJump.classList.contains('open'), 'jump panel closes after picking a month');
assert.ok(document.getElementById('datePickerPopup').classList.contains('open'), 'date picker stays open while jumping');
assert.ok(document.querySelectorAll('#calGrid1 .cal-day').length >= 28, 'calendar grid re-renders for the jumped month');
click(document.getElementById('dateTriggerBtn'));

// Jump panel is available in the Imported Fixtures and Activity Log pickers too.
click(document.getElementById('pubDateTriggerBtn'));
click(document.getElementById('pubCalMonth1'));
assert.ok(document.getElementById('pubCalJump1').classList.contains('open'), 'Imported Fixtures calendar exposes the jump panel');
click(document.getElementById('pubDateTriggerBtn'));
click(document.getElementById('activityDateTriggerBtn'));
click(document.getElementById('activityCalMonth1'));
assert.ok(document.getElementById('activityCalJump1').classList.contains('open'), 'Activity Log calendar exposes the jump panel');
click(document.getElementById('activityDateTriggerBtn'));

// ─── Imported Fixtures: typed multi-year range ───
click(document.getElementById('pubDateTriggerBtn'));
const pubFromInput = document.getElementById('pubDateFromInput');
const pubToInput = document.getElementById('pubDateToInput');
const pubMonthLabel = document.getElementById('pubCalMonth1');
pubFromInput.value = '01012015';
input(pubFromInput);
assert.equal(pubFromInput.value, '01/01/2015', 'Imported Fixtures From input masks typed digits');
assert.equal(pubMonthLabel.textContent, 'January 2015', 'Imported Fixtures calendar follows the typed From date');
pubToInput.value = '31/12/2029';
input(pubToInput);
assert.match(document.getElementById('pubDateRangeText').textContent, /Jan 1, 2015 → Dec 31, 2029/, 'Imported Fixtures footer shows the multi-year range');
click(document.getElementById('pubDatePickerPrevYearBtn'));
assert.equal(pubMonthLabel.textContent, 'December 2028', 'Imported Fixtures year step works');
click(document.getElementById('pubDatePickerNextYearBtn'));
click(document.getElementById('pubApplyDatePickerBtn'));
assert.match(document.getElementById('pubDateRangeLabel').textContent, /Jan 1, 2015.*Dec 31, 2029/, 'Imported Fixtures typed range applies to the filter label');
click(document.getElementById('pubDateClearBtn'));
assert.equal(document.getElementById('pubDateRangeLabel').textContent, 'All Dates', 'Imported Fixtures date filter clears');
assert.equal(pubFromInput.value, '', 'Imported Fixtures typed inputs clear with the filter');

// ─── Activity Log: typed multi-year range ───
click(document.getElementById('activityDateTriggerBtn'));
const activityFromInput = document.getElementById('activityDateFromInput');
const activityToInput = document.getElementById('activityDateToInput');
const activityMonthLabel = document.getElementById('activityCalMonth1');
activityFromInput.value = '05/03/2024';
input(activityFromInput);
assert.equal(activityMonthLabel.textContent, 'March 2024', 'Activity Log calendar follows the typed From date');
activityToInput.value = '30/02/2024';
input(activityToInput);
assert.ok(!document.getElementById('activityDateInputError').hidden, 'Activity Log rejects an impossible typed date');
activityToInput.value = '18/09/2027';
input(activityToInput);
assert.ok(document.getElementById('activityDateInputError').hidden, 'Activity Log clears the error once a valid date is typed');
click(document.getElementById('applyActivityDatePickerBtn'));
assert.match(document.getElementById('activityDateRangeLabel').textContent, /Mar 5, 2024.*Sep 18, 2027/, 'Activity Log typed range applies without an off-by-one day');
click(document.getElementById('activityDateClearBtn'));
assert.equal(document.getElementById('activityDateRangeLabel').textContent, 'All Dates', 'Activity Log date filter clears');
assert.equal(activityFromInput.value, '', 'Activity Log typed inputs clear with the filter');

showAllFixtures();
assert.equal(fixtureRowCount(), allSportRowsOnPage1, `selecting all sports paginates to ${allSportRowsOnPage1} rows`);

click(document.querySelector('[data-action="open-import"]'));
assert.ok(document.getElementById('importModal').classList.contains('visible'), 'single import confirmation modal opens');
assert.equal(document.getElementById('importConfirmMessage').textContent.trim(), 'Are you sure you want to import the selected fixture?', 'single import confirmation copy renders');
assert.equal(document.getElementById('importFixtureSummary').textContent.trim(), firstAvailableName, `single import confirmation shows first available fixture: ${firstAvailableName}`);
click(document.getElementById('confirmImportBtn'));
assert.equal(calls.confirmSingleImport.length, 1, 'single import action is invoked');
assert.equal(calls.confirmSingleImport[0].title, firstAvailableName, `single import action uses fixture name as title: ${firstAvailableName}`);

const selectAvailable = (n) => Array.from(document.querySelectorAll('.fixture-checkbox')).filter((cb) => !cb.disabled)[n];
let box = selectAvailable(0);
box.checked = true;
change(box);
box = selectAvailable(1); // re-query after re-render
box.checked = true;
change(box);
click(document.getElementById('importSelectedBtn'));
assert.ok(document.getElementById('bulkImportModal').classList.contains('visible'), 'bulk import confirmation modal opens');
assert.equal(document.getElementById('bulkConfirmMessage').textContent.trim(), 'Are you sure you want to import the selected fixtures?', 'bulk import confirmation copy renders');
assert.equal(document.querySelectorAll('#bulkFixtureList .bulk-fixture-item').length, 2, 'bulk confirmation lists selected fixtures');
click(document.getElementById('confirmBulkImportBtn'));
assert.equal(calls.confirmBulkImport.length, 1, 'bulk import action is invoked');
assert.equal(calls.confirmBulkImport[0].titles.length, 2, 'bulk import receives two titles');
assert.deepEqual(calls.confirmBulkImport[0].titles, [firstAvailableName, secondAvailableName], `bulk import uses fixture names as titles: [${firstAvailableName}, ${secondAvailableName}]`);

click(document.querySelector('[data-action="open-group"]'));
assert.ok(document.getElementById('groupModal').classList.contains('visible'), 'group modal opens');
assert.equal(document.getElementById('groupModalTitle').textContent, 'Premier League 2025/26', 'group modal title renders');
assert.ok(document.getElementById('groupFixturesList').textContent.includes('Arsenal vs Chelsea'), 'group modal lists fixtures');
click(document.getElementById('closeGroupModalFooterBtn'));
assert.ok(!document.getElementById('groupModal').classList.contains('visible'), 'group modal closes');

click(document.querySelector('#recentlyImportedBody [data-action="view-imported"]'));
assert.ok(document.getElementById('importedFixtureModal').classList.contains('visible'), 'imported fixture modal opens');
assert.equal(document.getElementById('impFixtureTitle').textContent, mockData.recentlyImported[0].name, 'imported fixture modal title renders');
assert.ok(document.getElementById('impGroupDetails').textContent.includes(mockData.fixtureGroups[mockData.recentlyImported[0].groupId].name), 'imported fixture group details render');
click(document.getElementById('closeImportedFixtureFooterBtn'));
assert.ok(!document.getElementById('importedFixtureModal').classList.contains('visible'), 'imported fixture modal closes');

click(document.querySelector('.nav-item[data-page-index="2"]'));
assert.equal(document.querySelectorAll('#subscriptionsTableBody tr.subscription-row').length, pageSize, `subscription groups render first page of ${pageSize} rows`);
const subscriptionsSearchInput = document.getElementById('subscriptionsSearchInput');
subscriptionsSearchInput.value = 'wimbledon';
input(subscriptionsSearchInput);
assert.equal(document.querySelectorAll('#subscriptionsTableBody tr.subscription-row').length, 1, 'subscription search matches by imported fixture name');
subscriptionsSearchInput.value = '';
input(subscriptionsSearchInput);
assert.equal(document.querySelectorAll('#subscriptionsTableBody tr.subscription-row').length, pageSize, `subscription search clear restores paginated ${pageSize} rows`);

const expandToggle = Array.from(document.querySelectorAll('#subscriptionsTableBody [data-action="toggle-subscription-details"]')).at(0);
click(expandToggle);
assert.equal(document.querySelectorAll('#subscriptionsTableBody tr.subscription-details-row').length, 1, 'subscription details row expands inline');
assert.ok(document.querySelector('#subscriptionsTableBody tr.subscription-details-row').textContent.includes('Title ID'), 'expanded subscription details show title metadata');
click(Array.from(document.querySelectorAll('#subscriptionsTableBody [data-action="toggle-subscription-details"]')).at(0));
assert.equal(document.querySelectorAll('#subscriptionsTableBody tr.subscription-details-row').length, 0, 'subscription details row collapses');

click(document.querySelector('#subscriptionsTableBody [data-action="show-activity"]'));
assert.equal(calls.showActivity.length, 1, 'show activity action is invoked');
assert.ok(document.querySelector('.page[data-page-index="3"]').classList.contains('active'), 'show activity redirects to activity log');
assert.ok(document.querySelectorAll('#activityLogTableBody tr').length >= 1, 'activity log shows filtered rows after redirect');

click(document.getElementById('clearActivityFiltersBtn'));
click(document.getElementById('exportLogBtn'));
click(document.querySelector('#activityLogTableBody [data-action="view-activity-details"]'));
assert.equal(calls.exportLog, 1, 'export log action is invoked');
assert.ok(document.getElementById('activityDetailsModal').classList.contains('visible'), 'activity details modal opens');
click(document.getElementById('closeActivityDetailsFooterBtn'));
assert.ok(!document.getElementById('activityDetailsModal').classList.contains('visible'), 'activity details modal closes');

click(document.querySelector('#fixturesTableBody .fixture-id'));
await wait();
assert.ok(window.navigator.clipboard.written.length >= 1, 'clipboard write is called');
assert.equal(window.navigator.clipboard.written.at(-1), allSportFixtures[0].id, 'copied fixture id matches the clicked cell');
assert.match(document.querySelector('.copy-toast').textContent, /Copied ID:/, 'copy toast appears');

// ─── Accessibility: keyboard navigation and focus management ───

// The app is gated behind a login modal, so sign in first. Escape must NOT
// dismiss that gate, which is asserted before logging in.
const loginModal = document.getElementById('loginModal');
assert.ok(loginModal.classList.contains('visible'), 'login modal gates the app while signed out');
keydown(document.body, 'Escape');
assert.ok(loginModal.classList.contains('visible'), 'Escape does not dismiss the login gate');

document.getElementById('loginEmailInput').value = 'tester@skysports.com';
document.getElementById('loginPasswordInput').value = 'password';
document.getElementById('loginForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.ok(!loginModal.classList.contains('visible'), 'submitting the login form closes the gate');
assert.match(document.getElementById('userDisplayName').textContent, /\w/, 'signed-in user name is shown');

// Calendar grids are exposed as grids with a single roving tab stop.
click(document.getElementById('dateTriggerBtn'));
const calGrid = document.getElementById('calGrid1');
assert.equal(calGrid.getAttribute('role'), 'grid', 'calendar grid exposes role=grid');
assert.equal(calGrid.querySelectorAll('.cal-day[tabindex="0"]').length, 1, 'exactly one calendar day is tabbable');

const startCell = calGrid.querySelector('.cal-day[tabindex="0"]');
const startDate = new Date(startCell.dataset.date);
keydown(startCell, 'ArrowRight');
const afterRight = calGrid.querySelector('.cal-day[tabindex="0"]');
assert.equal(new Date(afterRight.dataset.date).getDate(), new Date(startDate.getTime() + 86400000).getDate(), 'ArrowRight moves focus one day forward');
keydown(afterRight, 'ArrowDown');
const afterDown = calGrid.querySelector('.cal-day[tabindex="0"]');
assert.equal(new Date(afterDown.dataset.date).getDate(), new Date(startDate.getTime() + 8 * 86400000).getDate(), 'ArrowDown moves focus one week forward');

// Enter selects the focused day, same as clicking it.
const monthBeforeEnter = document.getElementById('calMonth1').textContent;
keydown(calGrid.querySelector('.cal-day[tabindex="0"]'), 'Enter');
assert.equal(calGrid.querySelectorAll('.cal-start').length, 1, 'Enter selects the focused day as the range start');

// PageDown steps a whole month without leaving the grid.
keydown(calGrid.querySelector('.cal-day[tabindex="0"]'), 'PageDown');
assert.notEqual(document.getElementById('calMonth1').textContent, monthBeforeEnter, 'PageDown advances the calendar a month');

// Escape closes the open picker.
assert.ok(document.getElementById('datePickerPopup').classList.contains('open'), 'date picker is open before Escape');
keydown(document.body, 'Escape');
assert.ok(!document.getElementById('datePickerPopup').classList.contains('open'), 'Escape closes the date picker');
click(document.getElementById('dateClearBtn'));

// Escape closes an open modal, and focus returns to whatever opened it.
showAllFixtures();
const importTrigger = document.querySelector('[data-action="open-import"]');
importTrigger.focus();
click(importTrigger);
const importModal = document.getElementById('importModal');
assert.ok(importModal.classList.contains('visible'), 'import modal opens');
assert.ok(importModal.contains(document.activeElement), 'focus moves into the modal on open');
keydown(document.body, 'Escape');
assert.ok(!importModal.classList.contains('visible'), 'Escape closes the import modal');
assert.equal(document.activeElement, importTrigger, 'focus returns to the element that opened the modal');

// Tab is trapped inside an open modal.
click(importTrigger);
const focusable = [...importModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
focusable.at(-1).focus();
keydown(document.body, 'Tab');
assert.equal(document.activeElement, focusable[0], 'Tab from the last control wraps to the first');
focusable[0].focus();
keydown(document.body, 'Tab', { shiftKey: true });
assert.equal(document.activeElement, focusable.at(-1), 'Shift+Tab from the first control wraps to the last');
keydown(document.body, 'Escape');

console.log('DOM integration checks passed.');


