export const mockActions = {
  notify(message) {
    window.alert(message);
  },
  refreshData() {
    window.alert('Refreshing fixture data from Fixture Manager API…');
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
  }
};

