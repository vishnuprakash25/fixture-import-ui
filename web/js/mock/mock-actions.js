import { getFixtureGroupsForCriteria } from '../core/helpers.js?v=6cc5c71119';

// Simulated network latency for the mocked Fixture Manager/SDH API calls.
const MOCK_API_LATENCY_MS = 600;

export const mockActions = {
  notify(message) {
    window.alert(message);
  },
  refreshData() {
    window.alert('Refreshing fixture data from Fixture Manager API…');
  },
  login({ displayName }) {
    // Login feedback is handled by an in-app toast to avoid blocking modals.
    void displayName;
  },
  signOut({ displayName }) {
    // Sign-out feedback is handled by in-app toast and login modal transition.
    void displayName;
  },
  confirmSingleImport({ title, fixture }) {
    window.alert(
      'Queued 1 fixture for import:\n\nTitle: "' + title + '"\nFixture ID: ' + fixture.id +
      '\n\nThe fixture will be processed automatically by the queue.'
    );
  },
  confirmBulkImport({ titles }) {
    window.alert(
      'Queued ' + titles.length + ' fixtures for import:\n\n' + titles.map((title, index) => `${index + 1}. ${title}`).join('\n') +
      '\n\nThe fixtures will be processed automatically by the queue.'
    );
  },
  addSubscription() {
    window.alert('Opening subscription dialog…');
  },
  showActivity(subscription) {
    // Activity drill-down is handled in core UI by switching to Activity Log with filters.
    void subscription;
  },
  editSubscription(subscription) {
    window.alert('Settings for: ' + subscription.activityKey);
  },
  unsubscribe(subscription) {
    if (window.confirm('Unsubscribe from ' + subscription.activityKey + '?')) {
      window.alert('Unsubscribed from ' + subscription.activityKey);
    }
  },
  exportLog() {
    window.alert('Exporting activity log to CSV…');
  },
  viewActivityDetails(entry) {
    // Details are rendered in the Activity details modal by core UI.
    void entry;
  },
  // Mocks GET /fixture-groups?sports=…&from=…&to=… on Fixture Manager/SDH.
  // Resolves to [{ id, label, sport, startDate, endDate }] for groups with importable
  // fixtures of the selected sports in the date range.
  fetchFixtureGroups({ sportIds, dateFrom, dateTo, data }) {
    const available = (data?.importableFixtures || []).filter((fixture) => fixture.status !== 'Imported');
    const groups = getFixtureGroupsForCriteria(available, { sports: sportIds, dateFrom, dateTo }, data?.fixtureGroups);
    return new Promise((resolve) => setTimeout(() => resolve(groups), MOCK_API_LATENCY_MS));
  }
};

