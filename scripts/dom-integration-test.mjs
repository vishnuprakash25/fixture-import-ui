import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { JSDOM } from 'jsdom';

import { createFixtureImportApp } from '../web/js/core/createFixtureImportApp.js';
import { mockData } from '../web/js/mock/mock-data.js';

const htmlPath = new URL('../web/index.html', import.meta.url);
let html = await fs.readFile(htmlPath, 'utf8');
html = html.replace(/<script type="module" src="js\/app\.js"><\/script>/, '');

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
  getComputedStyle: window.getComputedStyle,
  alert: window.alert,
  confirm: window.confirm
});

// ─── Derive test data from mock data to reduce hardcoding ───
const recentlyImportedCount = mockData.recentlyImported.length;
const pageSize = 12; // pagination.pageSize from createFixtureImportApp.js line 56
const availableFixtures = mockData.importableFixtures.filter((f) => f.status !== 'Imported');
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

assert.equal(document.querySelectorAll('#dashboardStats .stat-card').length, 3, 'dashboard stats render');
assert.equal(document.querySelectorAll('#recentlyImportedBody tr').length, recentlyImportedCount, `recently imported table renders ${recentlyImportedCount} rows from mock data`);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, pageSize, `fixture table renders first page of ${pageSize} mock fixtures`);

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
searchInput.value = 'arsenal';
input(searchInput);
const arsenalMatches = mockData.importableFixtures.filter((f) => f.name.toLowerCase().includes('arsenal'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, arsenalMatches.length, `search narrows fixture rows to ${arsenalMatches.length} match(es) for 'arsenal'`);
searchInput.value = '';
input(searchInput);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, pageSize, `search clear restores ${pageSize} paginated rows`);

const tennisCheckbox = document.querySelector('#sportOptions input[value="tennis"]');
tennisCheckbox.checked = true;
change(tennisCheckbox);
const tennisFixturesCount = mockData.importableFixtures.filter((f) => f.typeId === 'tennis').length;
const expectedPages = Math.ceil(tennisFixturesCount / pageSize);
const expectedRowsOnPage1 = Math.min(tennisFixturesCount, pageSize);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, expectedRowsOnPage1, `sport filter narrows to tennis fixtures (${expectedRowsOnPage1} rows on first page)`);
assert.equal(document.getElementById('sportFilterLabel').textContent, 'Tennis', 'sport filter label updates');
click(document.getElementById('sportClearBtn'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, pageSize, `sport filter clears to ${pageSize} rows`);

const groupCheckbox = document.querySelector(`#groupOptions input[value="${sampleGroupId}"]`);
groupCheckbox.checked = true;
change(groupCheckbox);
const wimbledonFixtures = mockData.importableFixtures.filter((f) => f.groupId === sampleGroupId);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, wimbledonFixtures.length, `group filter narrows to ${wimbledonFixtures.length} ${sampleGroupName} fixtures`);
click(document.getElementById('groupClearBtn'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, pageSize, `group filter clears to ${pageSize} rows`);

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
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, pageSize, `date filter clears to ${pageSize} rows`);

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
assert.equal(window.navigator.clipboard.written.at(-1), mockData.importableFixtures[0].id, 'copied fixture id matches the clicked cell');
assert.match(document.querySelector('.copy-toast').textContent, /Copied ID:/, 'copy toast appears');

console.log('DOM integration checks passed.');


