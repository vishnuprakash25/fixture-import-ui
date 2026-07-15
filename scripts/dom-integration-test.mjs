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

const calls = {
  refreshData: 0,
  confirmSingleImport: [],
  confirmBulkImport: [],
  addSubscription: 0,
  showActivity: [],
  editSubscription: [],
  unsubscribe: [],
  exportLog: 0,
  viewActivityDetails: []
};

const actions = {
  notify() {},
  refreshData() { calls.refreshData += 1; },
  confirmSingleImport(payload) { calls.confirmSingleImport.push(payload); },
  confirmBulkImport(payload) { calls.confirmBulkImport.push(payload); },
  addSubscription() { calls.addSubscription += 1; },
  showActivity(payload) { calls.showActivity.push(payload); },
  editSubscription(payload) { calls.editSubscription.push(payload); },
  unsubscribe(payload) { calls.unsubscribe.push(payload); },
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
assert.equal(document.querySelectorAll('#recentlyImportedBody tr').length, 4, 'recently imported table renders');
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, mockData.importableFixtures.length, 'fixture table renders all mock fixtures');

click(document.querySelector('.nav-item[data-page-index="2"]'));
assert.ok(document.querySelector('.page[data-page-index="2"]').classList.contains('active'), 'subscriptions page becomes active');
click(document.getElementById('viewAllBtn'));
assert.ok(document.querySelector('.page[data-page-index="1"]').classList.contains('active'), 'view all navigates to import fixtures');

click(document.getElementById('themeToggleBtn'));
assert.ok(document.body.classList.contains('dark'), 'dark theme toggles on');
assert.equal(document.querySelector('#themeToggleBtn .theme-toggle-label').textContent, 'Light Mode', 'theme label updates');
click(document.getElementById('themeToggleBtn'));
assert.ok(!document.body.classList.contains('dark'), 'dark theme toggles off');

click(document.getElementById('refreshDataBtn'));
assert.equal(calls.refreshData, 1, 'refresh action is invoked');

const searchInput = document.getElementById('fixtureSearchInput');
searchInput.value = 'arsenal';
input(searchInput);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, 1, 'search narrows fixture rows');
searchInput.value = '';
input(searchInput);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, mockData.importableFixtures.length, 'search clear restores rows');

const tennisCheckbox = document.querySelector('#sportOptions input[value="tennis"]');
tennisCheckbox.checked = true;
change(tennisCheckbox);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, 3, 'sport filter narrows to tennis fixtures');
assert.equal(document.getElementById('sportFilterLabel').textContent, 'Tennis', 'sport filter label updates');
click(document.getElementById('sportClearBtn'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, mockData.importableFixtures.length, 'sport filter clears');

const groupCheckbox = document.querySelector('#groupOptions input[value="grand-slam-2025"]');
groupCheckbox.checked = true;
change(groupCheckbox);
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, 3, 'group filter narrows fixtures');
click(document.getElementById('groupClearBtn'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, mockData.importableFixtures.length, 'group filter clears');

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
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, 5, 'date range filter narrows fixtures to July range');
assert.match(document.getElementById('dateRangeLabel').textContent, /Jul 2, 2026/, 'date filter label updates');
click(document.getElementById('dateClearBtn'));
assert.equal(document.querySelectorAll('#fixturesTableBody tr').length, mockData.importableFixtures.length, 'date filter clears');

click(document.querySelector('[data-action="open-import"]'));
assert.ok(document.getElementById('importModal').classList.contains('visible'), 'single import modal opens');
assert.equal(document.getElementById('importFixtureName').value, 'Arsenal vs Chelsea', 'single import loads fixture name');
assert.equal(document.getElementById('titlePreview').textContent, 'Football - Arsenal vs Chelsea - 20251222', 'default single import title preview renders');
document.getElementById('prefixType').value = 'custom';
change(document.getElementById('prefixType'));
document.getElementById('prefixCustom').value = 'Sky';
input(document.getElementById('prefixCustom'));
document.getElementById('suffixType').value = 'custom';
change(document.getElementById('suffixType'));
document.getElementById('suffixCustom').value = 'Promo';
input(document.getElementById('suffixCustom'));
assert.equal(document.getElementById('titlePreview').textContent, 'Sky - Arsenal vs Chelsea - Promo', 'single import preview reacts to custom values');
click(document.getElementById('confirmImportBtn'));
assert.equal(calls.confirmSingleImport.length, 1, 'single import action is invoked');
assert.equal(calls.confirmSingleImport[0].title, 'Sky - Arsenal vs Chelsea - Promo', 'single import action receives correct title');

const boxes = document.querySelectorAll('.fixture-checkbox');
boxes[0].checked = true;
change(boxes[0]);
boxes[1].checked = true;
change(boxes[1]);
click(document.getElementById('importSelectedBtn'));
assert.ok(document.getElementById('bulkImportModal').classList.contains('visible'), 'bulk import modal opens');
assert.equal(document.querySelectorAll('#bulkFixtureList .bulk-fixture-item').length, 2, 'bulk import lists selected fixtures');
assert.match(document.getElementById('bulkTitlePreview').textContent, /\(\+ 1 more\)/, 'bulk preview shows +N more');
document.getElementById('bulkPrefixType').value = 'custom';
change(document.getElementById('bulkPrefixType'));
document.getElementById('bulkPrefixCustom').value = 'Batch';
input(document.getElementById('bulkPrefixCustom'));
document.getElementById('bulkSuffixType').value = 'custom';
change(document.getElementById('bulkSuffixType'));
document.getElementById('bulkSuffixCustom').value = 'July';
input(document.getElementById('bulkSuffixCustom'));
click(document.getElementById('confirmBulkImportBtn'));
assert.equal(calls.confirmBulkImport.length, 1, 'bulk import action is invoked');
assert.equal(calls.confirmBulkImport[0].titles.length, 2, 'bulk import receives two titles');

click(document.querySelector('[data-action="open-group"]'));
assert.ok(document.getElementById('groupModal').classList.contains('visible'), 'group modal opens');
assert.equal(document.getElementById('groupModalTitle').textContent, 'Premier League 2025/26', 'group modal title renders');
assert.ok(document.getElementById('groupFixturesList').textContent.includes('Arsenal vs Chelsea'), 'group modal lists fixtures');
click(document.getElementById('closeGroupModalFooterBtn'));
assert.ok(!document.getElementById('groupModal').classList.contains('visible'), 'group modal closes');

click(document.querySelector('#recentlyImportedBody [data-action="view-imported"]'));
assert.ok(document.getElementById('importedFixtureModal').classList.contains('visible'), 'imported fixture modal opens');
assert.equal(document.getElementById('impFixtureTitle').textContent, 'Manchester Derby', 'imported fixture modal title renders');
assert.ok(document.getElementById('impGroupDetails').textContent.includes('Premier League 2025/26'), 'imported fixture group details render');
click(document.getElementById('closeImportedFixtureFooterBtn'));
assert.ok(!document.getElementById('importedFixtureModal').classList.contains('visible'), 'imported fixture modal closes');

click(document.querySelector('.nav-item[data-page-index="2"]'));
click(document.getElementById('addSubscriptionBtn'));
click(document.querySelector('#subscriptionsTableBody [data-action="show-activity"]'));
click(document.querySelector('#subscriptionsTableBody [data-action="edit-subscription"]'));
click(document.querySelector('#subscriptionsTableBody [data-action="remove-subscription"]'));
assert.equal(calls.addSubscription, 1, 'add subscription action is invoked');
assert.equal(calls.showActivity.length, 1, 'show activity action is invoked');
assert.equal(calls.editSubscription.length, 1, 'edit subscription action is invoked');
assert.equal(calls.unsubscribe.length, 1, 'unsubscribe action is invoked');

click(document.querySelector('.nav-item[data-page-index="3"]'));
click(document.getElementById('exportLogBtn'));
click(document.querySelector('#activityLogTableBody [data-action="view-activity-details"]'));
assert.equal(calls.exportLog, 1, 'export log action is invoked');
assert.equal(calls.viewActivityDetails.length, 1, 'activity detail action is invoked');

click(document.querySelector('#fixturesTableBody .fixture-id'));
await wait();
assert.ok(window.navigator.clipboard.written.length >= 1, 'clipboard write is called');
assert.equal(window.navigator.clipboard.written.at(-1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567001', 'copied fixture id matches the clicked cell');
assert.match(document.querySelector('.copy-toast').textContent, /Copied ID:/, 'copy toast appears');

console.log('DOM integration checks passed.');


