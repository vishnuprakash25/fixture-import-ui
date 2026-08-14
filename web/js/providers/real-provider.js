function createEmptyData() {
  return {
    dashboardStats: [],
    fixtureGroups: {},
    importableFixtures: [],
    recentlyImported: [],
    subscriptions: [],
    activityLog: [],
    sportTypes: []
  };
}

function createRealActions() {
  return {
    notify(message) {
      window.alert(message);
    }
  };
}

export async function loadRealProvider() {
  // Placeholder provider used to keep production wiring independent from mock modules.
  return {
    mode: 'real',
    data: createEmptyData(),
    actions: createRealActions()
  };
}

