export const mockActions = {
  notify(message) {
    window.alert(message);
  },
  refreshData() {
    window.alert('Refreshing fixture data from Fixture Manager API…');
  },
  confirmSingleImport({ title, fixture }) {
    window.alert(
      'Importing fixture as:\n\n"' + title + '"\n\nFixture ID: ' + fixture.id +
      '\n\n1. Fetch from Fixture Manager\n2. Transform to RightsLogic format\n3. Create Title/Programme'
    );
  },
  confirmBulkImport({ titles }) {
    window.alert('Importing ' + titles.length + ' fixtures:\n\n' + titles.map((title, index) => `${index + 1}. ${title}`).join('\n'));
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

