import {
  cloneDate,
  escapeHtml,
  filterFixtures,
  formatDisplayDate,
  formatInputDate,
  getGroupOptions,
  maskInputDate,
  normalizeGroupKey,
  parseInputDate,
  sanitizeInlineSvg,
  toLocalISODate
} from './helpers.js?v=54419a171f';

export function createFixtureImportApp({ data, actions = {} }) {
  const notify = actions.notify || ((message) => window.alert(message));
  const AUTH_STORAGE_KEY = 'fixture-import-ui.auth-user';
  const fixtureGroups = data.fixtureGroups || {};
  const importableFixtures = data.importableFixtures || [];
  const recentlyImported = data.recentlyImported || [];
  const subscriptions = data.subscriptions || [];
  const activityLog = data.activityLog || [];
  const sportTypes = data.sportTypes || [];
  const groupOptions = getGroupOptions(fixtureGroups);
  const fixturesById = new Map(importableFixtures.map((fixture) => [fixture.id, fixture]));

  const state = {
    activePage: 0,
    hasSearched: false,
    filters: {
      search: '',
      sports: new Set(),
      groups: new Set(),
      dateFrom: null,
      dateTo: null
    },
    optionSearch: {
      sport: '',
      group: ''
    },
    selectedFixtureIds: new Set(),
    currentImport: null,
    bulkImportFixtures: [],
    currentGroupId: null,
    currentImportedFixture: null,
    expandedSubscriptionId: null,
    subscriptionsSearch: '',
    pubFilters: {
      sports: new Set(),
      groups: new Set(),
      dateFrom: null,
      dateTo: null
    },
    pubOptionSearch: {
      sport: '',
      group: ''
    },
    pubDatePicker: {
      viewDate: new Date(),
      start: null,
      end: null,
      hover: null,
      // Which end of the range the next calendar click fills in ('start' | 'end').
      activeField: 'start',
      // Month/year quick-jump panel state.
      jump: { open: false, mode: 'month', year: new Date().getFullYear(), yearStart: 0 }
    },
    highlightedFixtureName: '',
    activityFilters: {
      groups: new Set(),
      action: '',
      dateFrom: '',
      dateTo: '',
      groupSearch: ''
    },
    activityDatePicker: {
      viewDate: new Date(),
      start: null,
      end: null,
      hover: null,
      // Which end of the range the next calendar click fills in ('start' | 'end').
      activeField: 'start',
      // Month/year quick-jump panel state.
      jump: { open: false, mode: 'month', year: new Date().getFullYear(), yearStart: 0 }
    },
    currentActivityEntry: null,
    auth: {
      isAuthenticated: false,
      email: '',
      displayName: ''
    },
    pagination: {
      pageSize: 12,
      fixturesPage: 1,
      subscriptionsPage: 1,
      activityPage: 1
    },
    datePicker: {
      viewDate: new Date(),
      start: null,
      end: null,
      hover: null,
      // Which end of the range the next calendar click fills in ('start' | 'end').
      activeField: 'start',
      // Month/year quick-jump panel state.
      jump: { open: false, mode: 'month', year: new Date().getFullYear(), yearStart: 0 }
    }
  };

  const dom = {};
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  let copyToastEl = null;
  let copyToastTimer = null;
  let authToastTimer = null;

  function init() {
    cacheDom();
    registerModalClosers();
    restoreAuthSession();
    bindEvents();
    switchPage(0);
    syncFilterLabels();
    renderAll();
    updateThemeToggle();
    syncAuthUi();
    updateDashboardGreeting();
    markRefreshTime();
  }

  function cacheDom() {
    Object.assign(dom, {
      navItems: Array.from(document.querySelectorAll('.nav-item[data-page-index]')),
      pages: Array.from(document.querySelectorAll('.page[data-page-index]')),
      userMenu: document.getElementById('userMenu'),
      userMenuBtn: document.getElementById('userMenuBtn'),
      userMenuDropdown: document.getElementById('userMenuDropdown'),
      userAvatar: document.getElementById('userAvatar'),
      userAvatarLg: document.getElementById('userAvatarLg'),
      userDisplayName: document.getElementById('userDisplayName'),
      userDisplayRole: document.getElementById('userDisplayRole'),
      userMenuName: document.getElementById('userMenuName'),
      userMenuEmail: document.getElementById('userMenuEmail'),
      signOutBtn: document.getElementById('signOutBtn'),
      loginModal: document.getElementById('loginModal'),
      loginForm: document.getElementById('loginForm'),
      loginEmailInput: document.getElementById('loginEmailInput'),
      loginPasswordInput: document.getElementById('loginPasswordInput'),
      passwordToggleBtn: document.getElementById('passwordToggleBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      refreshDataBtn: document.getElementById('refreshDataBtn'),
      dashboardGreeting: document.getElementById('dashboardGreeting'),
      dashboardSubtitle: document.getElementById('dashboardSubtitle'),
      lastRefreshedLabel: document.getElementById('lastRefreshedLabel'),
      quickActions: document.getElementById('quickActions'),
      viewAllBtn: document.getElementById('viewAllBtn'),
      dashboardStats: document.getElementById('dashboardStats'),
      recentlyImportedBody: document.getElementById('recentlyImportedBody'),
      searchInput: document.getElementById('fixtureSearchInput'),
      searchBtn: document.getElementById('searchFixturesBtn'),
      sportTypeMultiselect: document.getElementById('sportTypeMultiselect'),
      sportTriggerBtn: document.getElementById('sportTriggerBtn'),
      sportClearBtn: document.getElementById('sportClearBtn'),
      sportDropdown: document.getElementById('sportDropdown'),
      sportOptions: document.getElementById('sportOptions'),
      sportFilterLabel: document.getElementById('sportFilterLabel'),
      sportOptionsSearch: document.getElementById('sportOptionsSearch'),
      groupTriggerBtn: document.getElementById('groupTriggerBtn'),
      groupClearBtn: document.getElementById('groupClearBtn'),
      groupDropdown: document.getElementById('groupDropdown'),
      groupOptions: document.getElementById('groupOptions'),
      groupFilterLabel: document.getElementById('groupFilterLabel'),
      groupOptionsSearch: document.getElementById('groupOptionsSearch'),
      dateRangeWrapper: document.getElementById('dateRangeWrapper'),
      dateTriggerBtn: document.getElementById('dateTriggerBtn'),
      dateClearBtn: document.getElementById('dateClearBtn'),
      dateRangeLabel: document.getElementById('dateRangeLabel'),
      datePickerPopup: document.getElementById('datePickerPopup'),
      dateRangeText: document.getElementById('dateRangeText'),
      dateFromField: document.getElementById('dateFromField'),
      dateToField: document.getElementById('dateToField'),
      dateFromInput: document.getElementById('dateFromInput'),
      dateToInput: document.getElementById('dateToInput'),
      dateInputError: document.getElementById('dateInputError'),
      calMonth1: document.getElementById('calMonth1'),
      calGrid1: document.getElementById('calGrid1'),
      calJump1: document.getElementById('calJump1'),
      fixturesBody: document.getElementById('fixturesTableBody'),
      fixtureBulkBar: document.getElementById('fixtureBulkBar'),
      selectAll: document.getElementById('selectAll'),
      importSelectedBtn: document.getElementById('importSelectedBtn'),
      clearSelectionBtn: document.getElementById('clearSelectionBtn'),
      fixturesPagination: document.getElementById('fixturesPagination'),
      subscriptionsBody: document.getElementById('subscriptionsTableBody'),
      subscriptionsSearchInput: document.getElementById('subscriptionsSearchInput'),
      clearSubscriptionsSearchBtn: document.getElementById('clearSubscriptionsSearchBtn'),
      subscriptionsResultCount: document.getElementById('subscriptionsResultCount'),
      subscriptionsSummary: document.getElementById('subscriptionsSummary'),
      subscriptionsPagination: document.getElementById('subscriptionsPagination'),
      pubSportTypeMultiselect: document.getElementById('pubSportTypeMultiselect'),
      pubSportTriggerBtn: document.getElementById('pubSportTriggerBtn'),
      pubSportClearBtn: document.getElementById('pubSportClearBtn'),
      pubSportDropdown: document.getElementById('pubSportDropdown'),
      pubSportOptions: document.getElementById('pubSportOptions'),
      pubSportFilterLabel: document.getElementById('pubSportFilterLabel'),
      pubSportOptionsSearch: document.getElementById('pubSportOptionsSearch'),
      pubFixtureGroupMultiselect: document.getElementById('pubFixtureGroupMultiselect'),
      pubGroupTriggerBtn: document.getElementById('pubGroupTriggerBtn'),
      pubGroupClearBtn: document.getElementById('pubGroupClearBtn'),
      pubGroupDropdown: document.getElementById('pubGroupDropdown'),
      pubGroupOptions: document.getElementById('pubGroupOptions'),
      pubGroupFilterLabel: document.getElementById('pubGroupFilterLabel'),
      pubGroupOptionsSearch: document.getElementById('pubGroupOptionsSearch'),
      pubDateRangeWrapper: document.getElementById('pubDateRangeWrapper'),
      pubDateTriggerBtn: document.getElementById('pubDateTriggerBtn'),
      pubDateClearBtn: document.getElementById('pubDateClearBtn'),
      pubDateRangeLabel: document.getElementById('pubDateRangeLabel'),
      pubDatePickerPopup: document.getElementById('pubDatePickerPopup'),
      pubDateRangeText: document.getElementById('pubDateRangeText'),
      pubDateFromField: document.getElementById('pubDateFromField'),
      pubDateToField: document.getElementById('pubDateToField'),
      pubDateFromInput: document.getElementById('pubDateFromInput'),
      pubDateToInput: document.getElementById('pubDateToInput'),
      pubDateInputError: document.getElementById('pubDateInputError'),
      pubCalMonth1: document.getElementById('pubCalMonth1'),
      pubCalGrid1: document.getElementById('pubCalGrid1'),
      pubCalJump1: document.getElementById('pubCalJump1'),
      activityGroupMultiselect: document.getElementById('activityGroupMultiselect'),
      activityGroupTriggerBtn: document.getElementById('activityGroupTriggerBtn'),
      activityGroupClearBtn: document.getElementById('activityGroupClearBtn'),
      activityGroupDropdown: document.getElementById('activityGroupDropdown'),
      activityGroupOptions: document.getElementById('activityGroupOptions'),
      activityGroupFilterLabel: document.getElementById('activityGroupFilterLabel'),
      activityGroupOptionsSearch: document.getElementById('activityGroupOptionsSearch'),
      activityActionFilter: document.getElementById('activityActionFilter'),
      activityDateRangeWrapper: document.getElementById('activityDateRangeWrapper'),
      activityDateTriggerBtn: document.getElementById('activityDateTriggerBtn'),
      activityDateClearBtn: document.getElementById('activityDateClearBtn'),
      activityDateRangeLabel: document.getElementById('activityDateRangeLabel'),
      activityDatePickerPopup: document.getElementById('activityDatePickerPopup'),
      activityDateRangeText: document.getElementById('activityDateRangeText'),
      activityDateFromField: document.getElementById('activityDateFromField'),
      activityDateToField: document.getElementById('activityDateToField'),
      activityDateFromInput: document.getElementById('activityDateFromInput'),
      activityDateToInput: document.getElementById('activityDateToInput'),
      activityDateInputError: document.getElementById('activityDateInputError'),
      activityCalMonth1: document.getElementById('activityCalMonth1'),
      activityCalGrid1: document.getElementById('activityCalGrid1'),
      activityCalJump1: document.getElementById('activityCalJump1'),
      clearActivityFiltersBtn: document.getElementById('clearActivityFiltersBtn'),
      activityLogBody: document.getElementById('activityLogTableBody'),
      activityPagination: document.getElementById('activityPagination'),
      exportLogBtn: document.getElementById('exportLogBtn'),
      importModal: document.getElementById('importModal'),
      importConfirmMessage: document.getElementById('importConfirmMessage'),
      importFixtureSummary: document.getElementById('importFixtureSummary'),
      closeImportModalBtn: document.getElementById('closeImportModalBtn'),
      cancelImportBtn: document.getElementById('cancelImportBtn'),
      confirmImportBtn: document.getElementById('confirmImportBtn'),
      bulkImportModal: document.getElementById('bulkImportModal'),
      bulkFixtureList: document.getElementById('bulkFixtureList'),
      bulkConfirmMessage: document.getElementById('bulkConfirmMessage'),
      closeBulkImportModalBtn: document.getElementById('closeBulkImportModalBtn'),
      cancelBulkImportBtn: document.getElementById('cancelBulkImportBtn'),
      confirmBulkImportBtn: document.getElementById('confirmBulkImportBtn'),
      groupModal: document.getElementById('groupModal'),
      groupModalTitle: document.getElementById('groupModalTitle'),
      groupModalSubtitle: document.getElementById('groupModalSubtitle'),
      groupDetailsGrid: document.getElementById('groupDetailsGrid'),
      groupFixturesList: document.getElementById('groupFixturesList'),
      closeGroupModalBtn: document.getElementById('closeGroupModalBtn'),
      closeGroupModalFooterBtn: document.getElementById('closeGroupModalFooterBtn'),
      importAllFromGroupBtn: document.getElementById('importAllFromGroupBtn'),
      importedFixtureModal: document.getElementById('importedFixtureModal'),
      impFixtureTitle: document.getElementById('impFixtureTitle'),
      impFixtureDetails: document.getElementById('impFixtureDetails'),
      impGroupDetails: document.getElementById('impGroupDetails'),
      impGroupFixturesList: document.getElementById('impGroupFixturesList'),
      closeImportedFixtureModalBtn: document.getElementById('closeImportedFixtureModalBtn'),
      closeImportedFixtureFooterBtn: document.getElementById('closeImportedFixtureFooterBtn'),
      activityDetailsModal: document.getElementById('activityDetailsModal'),
      activityDetailsTitle: document.getElementById('activityDetailsTitle'),
      activityDetailsSubtitle: document.getElementById('activityDetailsSubtitle'),
      activityDetailsGrid: document.getElementById('activityDetailsGrid'),
      activityAuditBlock: document.getElementById('activityAuditBlock'),
      closeActivityDetailsModalBtn: document.getElementById('closeActivityDetailsModalBtn'),
      closeActivityDetailsFooterBtn: document.getElementById('closeActivityDetailsFooterBtn')
    });
  }

  function bindEvents() {
    dom.navItems.forEach((item) => {
      item.addEventListener('click', () => switchPage(Number(item.dataset.pageIndex)));
    });

    dom.userMenuBtn.addEventListener('click', toggleUserMenu);
    dom.signOutBtn.addEventListener('click', handleSignOut);
    dom.loginForm.addEventListener('submit', handleLoginSubmit);
    dom.passwordToggleBtn.addEventListener('click', togglePasswordVisibility);

    dom.themeToggleBtn.addEventListener('click', toggleTheme);
    dom.refreshDataBtn.addEventListener('click', () => { actions.refreshData?.({ data, state }); markRefreshTime(); });
    dom.viewAllBtn.addEventListener('click', () => switchPage(2));
    dom.quickActions.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-quick-action]');
      if (!btn) return;
      const action = btn.dataset.quickAction;
      if (action === 'import') switchPage(1);
      else if (action === 'activity') switchPage(3);
      else if (action === 'published') switchPage(2);
    });
    dom.exportLogBtn.addEventListener('click', () => actions.exportLog?.({ data, state }));
    dom.subscriptionsSearchInput.addEventListener('input', (event) => {
      state.subscriptionsSearch = event.target.value;
      state.pagination.subscriptionsPage = 1;
      applyPublishedSearchAutoExpand();
      renderSubscriptions();
    });
    dom.clearSubscriptionsSearchBtn.addEventListener('click', clearSubscriptionsSearch);

    // ─── Published Fixtures: Sport multiselect ───
    dom.pubSportTriggerBtn.addEventListener('click', () => togglePubDropdown(dom.pubSportDropdown));
    dom.pubSportClearBtn.addEventListener('click', clearPubSportFilter);
    dom.pubSportOptionsSearch.addEventListener('input', (event) => {
      state.pubOptionSearch.sport = event.target.value;
      renderPubSportOptions();
    });
    dom.pubSportOptions.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked) state.pubFilters.sports.add(event.target.value);
      else state.pubFilters.sports.delete(event.target.value);
      state.pagination.subscriptionsPage = 1;
      syncPubFilterLabels();
      renderPubSportOptions();
      renderSubscriptions();
    });
    document.getElementById('pubClearSportOptionsBtn').addEventListener('click', clearPubSportFilter);

    // ─── Published Fixtures: Group multiselect ───
    dom.pubGroupTriggerBtn.addEventListener('click', () => togglePubDropdown(dom.pubGroupDropdown));
    dom.pubGroupClearBtn.addEventListener('click', clearPubGroupFilter);
    dom.pubGroupOptionsSearch.addEventListener('input', (event) => {
      state.pubOptionSearch.group = event.target.value;
      renderPubGroupOptions();
    });
    dom.pubGroupOptions.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked) state.pubFilters.groups.add(event.target.value);
      else state.pubFilters.groups.delete(event.target.value);
      state.pagination.subscriptionsPage = 1;
      syncPubFilterLabels();
      renderPubGroupOptions();
      renderSubscriptions();
    });
    document.getElementById('pubClearGroupOptionsBtn').addEventListener('click', clearPubGroupFilter);

    // ─── Published Fixtures: Date range picker ───
    dom.pubDateTriggerBtn.addEventListener('click', togglePubDatePicker);
    dom.pubDateClearBtn.addEventListener('click', clearPubDateRange);
    document.querySelectorAll('[data-pub-date-preset]').forEach((button) => {
      button.addEventListener('click', () => selectPubDatePreset(button.dataset.pubDatePreset));
    });
    document.getElementById('pubDatePickerPrevBtn').addEventListener('click', () => changePubMonth(-1));
    document.getElementById('pubDatePickerNextBtn').addEventListener('click', () => changePubMonth(1));
    document.getElementById('pubDatePickerPrevYearBtn').addEventListener('click', () => changeCalYear('pub', -1));
    document.getElementById('pubDatePickerNextYearBtn').addEventListener('click', () => changeCalYear('pub', 1));
    bindDateRangeInputs('pub');
    dom.pubCalMonth1.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCalJump('pub');
    });
    dom.pubCalJump1.addEventListener('click', (event) => handleCalJumpClick('pub', event));
    document.getElementById('pubClearDatePickerBtn').addEventListener('click', clearPubDateRange);
    document.getElementById('pubApplyDatePickerBtn').addEventListener('click', applyPubDatePicker);
    dom.pubCalGrid1.addEventListener('click', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      event.stopPropagation();
      selectPubCalendarDate(new Date(cell.dataset.date));
    });
    dom.pubCalGrid1.addEventListener('mouseover', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      state.pubDatePicker.hover = new Date(cell.dataset.date);
      updatePubHoverStyles();
    });
    dom.fixturesPagination.addEventListener('click', handlePaginationClick);
    dom.subscriptionsPagination.addEventListener('click', handlePaginationClick);
    dom.activityPagination.addEventListener('click', handlePaginationClick);
    dom.activityGroupTriggerBtn.addEventListener('click', () => toggleActivityGroupDropdown());
    dom.activityGroupClearBtn.addEventListener('click', clearActivityGroupFilter);
    dom.activityGroupOptionsSearch.addEventListener('input', (event) => {
      state.activityFilters.groupSearch = event.target.value;
      renderActivityGroupOptions();
    });
    dom.activityGroupOptions.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked) state.activityFilters.groups.add(event.target.value);
      else state.activityFilters.groups.delete(event.target.value);
      state.pagination.activityPage = 1;
      syncActivityGroupLabel();
      renderActivityGroupOptions();
      renderActivityLog();
    });
    document.getElementById('clearActivityGroupOptionsBtn').addEventListener('click', clearActivityGroupFilter);
    dom.activityActionFilter.addEventListener('change', () => {
      state.activityFilters.action = dom.activityActionFilter.value;
      state.pagination.activityPage = 1;
      renderActivityLog();
    });
    dom.activityDateTriggerBtn.addEventListener('click', toggleActivityDatePicker);
    dom.activityDateClearBtn.addEventListener('click', clearActivityDateRange);
    document.querySelectorAll('[data-activity-date-preset]').forEach((button) => {
      button.addEventListener('click', () => selectActivityDatePreset(button.dataset.activityDatePreset));
    });
    document.getElementById('activityDatePickerPrevBtn').addEventListener('click', () => changeActivityMonth(-1));
    document.getElementById('activityDatePickerNextBtn').addEventListener('click', () => changeActivityMonth(1));
    document.getElementById('activityDatePickerPrevYearBtn').addEventListener('click', () => changeCalYear('activity', -1));
    document.getElementById('activityDatePickerNextYearBtn').addEventListener('click', () => changeCalYear('activity', 1));
    bindDateRangeInputs('activity');
    dom.activityCalMonth1.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCalJump('activity');
    });
    dom.activityCalJump1.addEventListener('click', (event) => handleCalJumpClick('activity', event));
    document.getElementById('clearActivityDatePickerBtn').addEventListener('click', clearActivityDateRange);
    document.getElementById('applyActivityDatePickerBtn').addEventListener('click', applyActivityDatePicker);
    dom.activityCalGrid1.addEventListener('click', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      // Prevent document click handler from closing the picker during range selection.
      event.stopPropagation();
      selectActivityCalendarDate(new Date(cell.dataset.date));
    });
    dom.activityCalGrid1.addEventListener('mouseover', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      state.activityDatePicker.hover = new Date(cell.dataset.date);
      updateActivityHoverStyles();
    });
    dom.clearActivityFiltersBtn.addEventListener('click', clearActivityFilters);

    dom.searchInput.addEventListener('input', (event) => {
      state.filters.search = event.target.value;
      state.pagination.fixturesPage = 1;
      if (event.target.value.trim()) state.hasSearched = true;
      else if (!hasActiveFilters()) state.hasSearched = false;
      renderFixturesTable();
    });
    dom.searchBtn.addEventListener('click', () => {
      state.hasSearched = true;
      state.pagination.fixturesPage = 1;
      renderFixturesTable();
    });

    dom.sportTriggerBtn.addEventListener('click', () => toggleDropdown(dom.sportDropdown));
    dom.sportClearBtn.addEventListener('click', clearSportFilter);
    dom.sportOptionsSearch.addEventListener('input', (event) => {
      state.optionSearch.sport = event.target.value;
      renderSportOptions();
    });
    dom.sportOptions.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked) state.filters.sports.add(event.target.value);
      else state.filters.sports.delete(event.target.value);
      state.hasSearched = true;
      syncFilterLabels();
      renderSportOptions();
      state.pagination.fixturesPage = 1;
      renderFixturesTable();
    });
    document.getElementById('clearSportOptionsBtn').addEventListener('click', clearSportFilter);

    dom.groupTriggerBtn.addEventListener('click', () => toggleDropdown(dom.groupDropdown));
    dom.groupClearBtn.addEventListener('click', clearGroupFilter);
    dom.groupOptionsSearch.addEventListener('input', (event) => {
      state.optionSearch.group = event.target.value;
      renderGroupOptions();
    });
    dom.groupOptions.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked) state.filters.groups.add(event.target.value);
      else state.filters.groups.delete(event.target.value);
      state.hasSearched = true;
      syncFilterLabels();
      renderGroupOptions();
      state.pagination.fixturesPage = 1;
      renderFixturesTable();
    });
    document.getElementById('clearGroupOptionsBtn').addEventListener('click', clearGroupFilter);

    dom.dateTriggerBtn.addEventListener('click', toggleDatePicker);
    dom.dateClearBtn.addEventListener('click', clearDateRange);
    document.querySelectorAll('[data-date-preset]').forEach((button) => {
      button.addEventListener('click', () => selectDatePreset(button.dataset.datePreset));
    });
    document.getElementById('datePickerPrevBtn').addEventListener('click', () => changeMonth(-1));
    document.getElementById('datePickerNextBtn').addEventListener('click', () => changeMonth(1));
    document.getElementById('datePickerPrevYearBtn').addEventListener('click', () => changeYear(-1));
    document.getElementById('datePickerNextYearBtn').addEventListener('click', () => changeYear(1));
    bindDateRangeInputs('fixtures');
    dom.calMonth1.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCalJump('fixtures');
    });
    dom.calJump1.addEventListener('click', (event) => handleCalJumpClick('fixtures', event));
    document.getElementById('clearDatePickerBtn').addEventListener('click', clearDateRange);
    document.getElementById('applyDatePickerBtn').addEventListener('click', applyDatePicker);
    dom.calGrid1.addEventListener('click', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      // Keep picker open while selecting start and end dates.
      event.stopPropagation();
      selectCalendarDate(new Date(cell.dataset.date));
    });
    dom.calGrid1.addEventListener('mouseover', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      state.datePicker.hover = new Date(cell.dataset.date);
      updateHoverStyles();
    });

    dom.selectAll.addEventListener('change', (event) => toggleSelectAll(event.target.checked));
    dom.importSelectedBtn.addEventListener('click', requestBulkImportConfirmationFromSelection);
    dom.clearSelectionBtn.addEventListener('click', clearSelection);

    dom.fixturesBody.addEventListener('change', (event) => {
      if (!event.target.matches('.fixture-checkbox')) return;
      const fixtureId = event.target.dataset.fixtureId;
      if (event.target.checked) state.selectedFixtureIds.add(fixtureId);
      else state.selectedFixtureIds.delete(fixtureId);
      renderFixturesTable();
    });
    dom.fixturesBody.addEventListener('click', handleFixturesTableClick);
    dom.recentlyImportedBody.addEventListener('click', handleRecentlyImportedClick);
    dom.subscriptionsBody.addEventListener('click', handleSubscriptionClick);
    dom.activityLogBody.addEventListener('click', handleActivityLogClick);

    dom.closeImportModalBtn.addEventListener('click', closeImportModal);
    dom.cancelImportBtn.addEventListener('click', closeImportModal);
    dom.confirmImportBtn.addEventListener('click', confirmImport);

    dom.closeBulkImportModalBtn.addEventListener('click', closeBulkImportModal);
    dom.cancelBulkImportBtn.addEventListener('click', closeBulkImportModal);
    dom.confirmBulkImportBtn.addEventListener('click', confirmBulkImport);

    dom.closeGroupModalBtn.addEventListener('click', closeGroupModal);
    dom.closeGroupModalFooterBtn.addEventListener('click', closeGroupModal);
    dom.importAllFromGroupBtn.addEventListener('click', importAllFromGroup);

    dom.closeImportedFixtureModalBtn.addEventListener('click', closeImportedFixtureModal);
    dom.closeImportedFixtureFooterBtn.addEventListener('click', closeImportedFixtureModal);
    dom.closeActivityDetailsModalBtn.addEventListener('click', closeActivityDetailsModal);
    dom.closeActivityDetailsFooterBtn.addEventListener('click', closeActivityDetailsModal);

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('click', handleFixtureIdCopyClick);
    document.addEventListener('keydown', handleDocumentKeydown);
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (event) => {
        if (event.target !== overlay) return;
        closeModalOverlay(overlay);
      });
    });
    // Arrow-key navigation inside each calendar grid.
    dom.calGrid1.addEventListener('keydown', (event) => handleCalGridKeydown('fixtures', event));
    dom.pubCalGrid1.addEventListener('keydown', (event) => handleCalGridKeydown('pub', event));
    dom.activityCalGrid1.addEventListener('keydown', (event) => handleCalGridKeydown('activity', event));
  }

  // ─── Overlay / modal keyboard handling ───
  const MODAL_CLOSERS = new Map();

  function closeModalOverlay(overlay) {
    const close = MODAL_CLOSERS.get(overlay);
    if (close) close();
  }

  function registerModalClosers() {
    MODAL_CLOSERS.set(dom.importModal, closeImportModal);
    MODAL_CLOSERS.set(dom.bulkImportModal, closeBulkImportModal);
    MODAL_CLOSERS.set(dom.groupModal, closeGroupModal);
    MODAL_CLOSERS.set(dom.importedFixtureModal, closeImportedFixtureModal);
    MODAL_CLOSERS.set(dom.activityDetailsModal, closeActivityDetailsModal);
    MODAL_CLOSERS.set(dom.loginModal, closeLoginModal);
  }

  function getOpenModal() {
    return [...MODAL_CLOSERS.keys()].find((overlay) => overlay?.classList.contains('visible')) || null;
  }

  function handleDocumentKeydown(event) {
    if (event.key === 'Escape') {
      const openModal = getOpenModal();
      if (openModal) {
        // The login modal is the only one that must stay put while signed out.
        if (openModal === dom.loginModal && !state.auth.isAuthenticated) return;
        event.preventDefault();
        closeModalOverlay(openModal);
        return;
      }
      if (closeAllOverlays()) event.preventDefault();
      return;
    }

    if (event.key === 'Tab') trapFocusInModal(event);
  }

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Keeps Tab inside the open dialog, as expected of a modal.
  function trapFocusInModal(event) {
    const openDialog = getOpenModal();
    if (!openDialog) return;

    // Note: deliberately not filtering on offsetParent — it is null for
    // position:fixed overlays, which would discard every candidate.
    const focusable = [...openDialog.querySelectorAll(FOCUSABLE)]
      .filter((el) => !el.hasAttribute('hidden') && !el.closest('[hidden]'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!openDialog.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Closes any open dropdown/date picker. Returns true if something was closed.
  function closeAllOverlays() {
    const overlays = [
      dom.userMenuDropdown, dom.sportDropdown, dom.groupDropdown, dom.datePickerPopup,
      dom.activityGroupDropdown, dom.activityDatePickerPopup, dom.pubSportDropdown,
      dom.pubGroupDropdown, dom.pubDatePickerPopup
    ];
    let closed = false;
    overlays.forEach((element) => {
      if (element?.classList.contains('open')) {
        element.classList.remove('open');
        closed = true;
      }
    });
    return closed;
  }

  // Modal focus management: remember what opened the dialog, move focus into it,
  // and hand focus back on close so keyboard users don't lose their place.
  let modalReturnFocusEl = null;

  function openModal(overlay, { focusEl = null } = {}) {
    modalReturnFocusEl = document.activeElement;
    overlay.classList.add('visible');
    const target = focusEl || overlay.querySelector(FOCUSABLE);
    target?.focus();
  }

  function closeModal(overlay) {
    overlay.classList.remove('visible');
    modalReturnFocusEl?.focus?.();
    modalReturnFocusEl = null;
  }

  function handleDocumentClick(event) {
    const target = event.target;

    if (!dom.userMenu.contains(target)) dom.userMenuDropdown.classList.remove('open');
    if (!dom.sportTypeMultiselect.contains(target)) dom.sportDropdown.classList.remove('open');
    if (!document.getElementById('fixtureGroupMultiselect').contains(target)) dom.groupDropdown.classList.remove('open');
    if (!dom.dateRangeWrapper.contains(target)) dom.datePickerPopup.classList.remove('open');
    if (!dom.activityGroupMultiselect.contains(target)) dom.activityGroupDropdown.classList.remove('open');
    if (!dom.activityDateRangeWrapper.contains(target)) dom.activityDatePickerPopup.classList.remove('open');
    if (!dom.pubSportTypeMultiselect.contains(target)) dom.pubSportDropdown.classList.remove('open');
    if (!dom.pubFixtureGroupMultiselect.contains(target)) dom.pubGroupDropdown.classList.remove('open');
    if (!dom.pubDateRangeWrapper.contains(target)) dom.pubDatePickerPopup.classList.remove('open');
  }

  function restoreAuthSession() {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.email || !parsed.displayName) return;
      state.auth.isAuthenticated = true;
      state.auth.email = parsed.email;
      state.auth.displayName = parsed.displayName;
    } catch (_) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  function persistAuthSession() {
    if (!state.auth.isAuthenticated) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      email: state.auth.email,
      displayName: state.auth.displayName
    }));
  }

  function deriveDisplayName(email) {
    const local = String(email || '').split('@')[0] || 'User';
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function syncAuthUi() {
    const name = state.auth.displayName || 'Guest';
    const role = state.auth.isAuthenticated ? state.auth.email : 'Not signed in';
    const initial = name.charAt(0).toUpperCase() || 'U';

    dom.userDisplayName.textContent = name;
    dom.userDisplayRole.textContent = role;
    dom.userAvatar.textContent = initial;
    dom.userAvatarLg.textContent = initial;
    dom.userMenuName.textContent = name;
    dom.userMenuEmail.textContent = role;
    dom.signOutBtn.disabled = !state.auth.isAuthenticated;
    dom.userMenuBtn.setAttribute('aria-expanded', dom.userMenuDropdown.classList.contains('open') ? 'true' : 'false');
    document.body.classList.toggle('auth-locked', !state.auth.isAuthenticated);

    if (!state.auth.isAuthenticated) openLoginModal();
    else closeLoginModal();

    updateDashboardGreeting();
  }

  function openLoginModal() {
    openModal(dom.loginModal, { focusEl: dom.loginEmailInput });
  }

  function closeLoginModal() {
    closeModal(dom.loginModal);
    dom.loginPasswordInput.value = '';
    dom.loginPasswordInput.type = 'password';
    dom.passwordToggleBtn.classList.remove('active');
  }

  function togglePasswordVisibility() {
    const isPassword = dom.loginPasswordInput.type === 'password';
    dom.loginPasswordInput.type = isPassword ? 'text' : 'password';
    dom.passwordToggleBtn.classList.toggle('active', isPassword);
    dom.passwordToggleBtn.title = isPassword ? 'Hide password' : 'Show password';
  }

  function toggleUserMenu() {
    if (!state.auth.isAuthenticated) {
      openLoginModal();
      return;
    }
    dom.userMenuDropdown.classList.toggle('open');
    dom.userMenuBtn.setAttribute('aria-expanded', dom.userMenuDropdown.classList.contains('open') ? 'true' : 'false');
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    const email = dom.loginEmailInput.value.trim().toLowerCase();
    const password = dom.loginPasswordInput.value;
    if (!email || !password) {
      notify('Enter your email and password to continue.');
      return;
    }

    state.auth.isAuthenticated = true;
    state.auth.email = email;
    state.auth.displayName = deriveDisplayName(email);
    persistAuthSession();
    syncAuthUi();
    switchPage(0);
    showAuthToast(`Welcome, ${state.auth.displayName}`);
    actions.login?.({ email: state.auth.email, displayName: state.auth.displayName });
  }

  function handleSignOut() {
    const displayName = state.auth.displayName;
    state.auth.isAuthenticated = false;
    state.auth.email = '';
    state.auth.displayName = '';
    dom.userMenuDropdown.classList.remove('open');
    persistAuthSession();
    syncAuthUi();
    showAuthToast('Signed out');
    actions.signOut?.({ displayName });
  }

  function showAuthToast(message) {
    let toast = document.getElementById('authToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'authToast';
      toast.className = 'auth-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove('visible');
    void toast.offsetWidth;
    toast.classList.add('visible');

    if (authToastTimer) clearTimeout(authToastTimer);
    authToastTimer = setTimeout(() => toast.classList.remove('visible'), 1600);
  }

  function updateDashboardGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const name = state.auth.displayName || '';
    dom.dashboardGreeting.textContent = name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
    dom.dashboardSubtitle.textContent = 'Here\u2019s your fixture management overview';
  }

  let lastRefreshDate = null;
  function markRefreshTime() {
    lastRefreshDate = new Date();
    dom.lastRefreshedLabel.textContent = 'Updated just now';
  }

  function getRelativeTime(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return dateString;
  }

  function handlePaginationClick(event) {
    const button = event.target.closest('[data-page-target]');
    if (!button || button.disabled) return;

    const target = button.dataset.pageTarget;
    const action = button.dataset.pageAction || (button.dataset.pageDirection === 'next' ? 'next' : 'prev');
    const { page, totalPages } = getPaginationMeta(target);

    if (action === 'prev') setPageByTarget(target, page - 1);
    else if (action === 'next') setPageByTarget(target, page + 1);
    else if (action === 'first') setPageByTarget(target, 1);
    else if (action === 'last') setPageByTarget(target, totalPages);
    else if (action === 'go') {
      const input = button.parentElement?.querySelector(`[data-page-input-target="${target}"]`);
      const requestedPage = Number(input?.value || page);
      setPageByTarget(target, requestedPage);
    }
  }

  function setPageByTarget(target, page) {
    if (target === 'fixtures') {
      state.pagination.fixturesPage = Math.max(1, page);
      renderFixturesTable();
      return;
    }
    if (target === 'subscriptions') {
      state.pagination.subscriptionsPage = Math.max(1, page);
      renderSubscriptions();
      return;
    }
    if (target === 'activity') {
      state.pagination.activityPage = Math.max(1, page);
      renderActivityLog();
    }
  }

  function getPaginationMeta(target) {
    if (target === 'fixtures') {
      const totalPages = Math.max(1, Math.ceil(getFilteredFixtures().length / state.pagination.pageSize));
      return { page: state.pagination.fixturesPage, totalPages };
    }
    if (target === 'subscriptions') {
      const totalPages = Math.max(1, Math.ceil(getFilteredSubscriptions().length / state.pagination.pageSize));
      return { page: state.pagination.subscriptionsPage, totalPages };
    }
    const totalPages = Math.max(1, Math.ceil(activityLog.length / state.pagination.pageSize));
    return { page: state.pagination.activityPage, totalPages };
  }

  function handleFixturesTableClick(event) {
    const importButton = event.target.closest('[data-action="open-import"]');
    if (importButton) {
      requestSingleImportConfirmation(importButton.dataset.fixtureId);
      return;
    }

    const groupLink = event.target.closest('[data-action="open-group"]');
    if (groupLink) {
      openGroupModal(groupLink.dataset.groupId);
    }
  }

  function handleRecentlyImportedClick(event) {
    const viewButton = event.target.closest('[data-action="view-imported"]');
    if (!viewButton) return;
    openImportedFixtureModal(Number(viewButton.dataset.importedIndex));
  }

  function handleSubscriptionClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    event.preventDefault();
    const subscription = getFilteredSubscriptions()[Number(button.dataset.subscriptionIndex)];
    if (!subscription) return;

    if (button.dataset.action === 'toggle-subscription-details') toggleSubscriptionDetails(subscription.id);
    if (button.dataset.action === 'show-activity') openSubscriptionActivity(subscription);
  }

  function handleActivityLogClick(event) {
    const link = event.target.closest('[data-action="view-activity-details"]');
    if (!link) return;
    event.preventDefault();
    const entry = activityLog.find((item) => String(item.id) === String(link.dataset.activityId));
    if (!entry) return;
    openActivityDetailsModal(entry);
  }

  async function handleFixtureIdCopyClick(event) {
    const fixtureIdEl = event.target.closest('.fixture-id');
    if (!fixtureIdEl) return;

    event.preventDefault();
    const value = (fixtureIdEl.dataset.copyValue || fixtureIdEl.getAttribute('title') || fixtureIdEl.textContent || '').trim();
    if (!value) return;

    const copied = await copyTextToClipboard(value);
    showFixtureIdCopyFeedback(fixtureIdEl, copied);
    showCopyToast(copied ? `Copied ID: ${value}` : 'Unable to copy ID', copied);
  }

  function renderAll() {
    renderStats();
    renderRecentlyImported();
    renderSportOptions();
    renderGroupOptions();
    renderPubSportOptions();
    renderPubGroupOptions();
    syncPubFilterLabels();
    renderFixturesTable();
    renderSubscriptions();
    renderActivityFilters();
    renderActivityLog();
    renderCalendar();
  }

  function renderStats() {
    dom.dashboardStats.innerHTML = data.dashboardStats.filter((stat) => !stat.hidden).map((stat) => {
      // Cards may expose a hover/focus tooltip that explains the metric.
      const tooltipAttrs = stat.tooltip
        ? ` data-tooltip="${escapeHtml(stat.tooltip)}" tabindex="0" role="note" aria-label="${escapeHtml(stat.label || '')}. ${escapeHtml(stat.tooltip)}"`
        : '';
      // Icons can be a short text badge or an inline SVG glyph. The SVG is the
      // only provider-supplied value injected as raw markup, so it is sanitised
      // rather than trusted — a real provider may relay server-controlled data.
      const iconContent = stat.iconSvg ? sanitizeInlineSvg(stat.iconSvg) : escapeHtml(stat.icon || '');
      // The trend pill is optional — omit the markup entirely when unset.
      const trendHtml = stat.trend
        ? `<span class="stat-trend ${escapeHtml(stat.trendDirection)}">${escapeHtml(stat.trend)}</span>`
        : '';
      // Optional eyebrow title that qualifies multi-metric cards
      // (e.g. "Imported" above Fixtures / Fixture Groups counts).
      const titleHtml = stat.title
        ? `<div class="stat-title">${escapeHtml(stat.title)}</div>`
        : '';
      return `
      <div class="stat-card"${tooltipAttrs}>
        <div class="stat-top">
          <div class="stat-icon ${escapeHtml(stat.iconClass)}">${iconContent}</div>
          ${trendHtml}
        </div>
        <div class="stat-body">
          <div class="stat-text">
            ${titleHtml}
            ${Array.isArray(stat.metrics) && stat.metrics.length
              ? renderStatMetrics(stat.metrics)
              : `<div class="stat-value">${escapeHtml(stat.value)}</div>
            <div class="stat-label">${escapeHtml(stat.label)}</div>`}
          </div>
          ${renderStatChart(stat.chart)}
        </div>
      </div>
    `;
    }).join('');
  }

  function renderStatMetrics(metrics) {
    return `<div class="stat-metrics">${metrics.map((metric) => `
      <div class="stat-metric">
        <div class="stat-value">${escapeHtml(metric.value)}</div>
        <div class="stat-label">${escapeHtml(metric.label)}</div>
      </div>
    `).join('<span class="stat-metric-divider" aria-hidden="true"></span>')}</div>`;
  }

  function renderStatChart(chart) {
    if (!chart) return '';

    if (chart.type === 'donut') {
      const pct = Math.round((chart.filled / chart.total) * 100);
      const circumference = 2 * Math.PI * 28;
      const dashOffset = circumference - (circumference * pct / 100);
      return `
        <div class="stat-chart stat-chart-donut" title="${chart.filled} of ${chart.total} fixtures imported (${pct}%)">
          <svg width="56" height="56" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" stroke-width="5"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="url(#donutGrad)" stroke-width="5"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" transform="rotate(-90 32 32)"/>
            <defs><linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs>
          </svg>
          <span class="stat-chart-pct">${pct}%</span>
        </div>
      `;
    }

    if (chart.type === 'bars') {
      const maxBar = Math.max(...chart.bars);
      const colorClass = chart.color ? ` stat-bar-${chart.color}` : '';
      const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const barHtml = chart.bars.map((value, i) => {
        const height = Math.round((value / maxBar) * 100);
        return `<div class="stat-bar-col"><div class="stat-bar${colorClass}" style="height:${height}%" title="${dayLabels[i]}: ${value}"></div><span class="stat-bar-label">${dayLabels[i]}</span></div>`;
      }).join('');
      return `<div class="stat-chart stat-chart-bars">${barHtml}</div>`;
    }

    if (chart.type === 'segmented') {
      const total = chart.segments.reduce((sum, seg) => sum + seg.value, 0);
      const segHtml = chart.segments.map((seg, i) => {
        const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
        return `<div class="stat-segment stat-segment-${i}" style="width:${pct}%" title="${seg.label}: ${seg.value} (${pct}%)"></div>`;
      }).join('');
      return `
        <div class="stat-chart stat-chart-segmented">
          <div class="stat-segment-track">${segHtml}</div>
          <div class="stat-segment-legend">
            ${chart.segments.map((seg, i) => `<span class="stat-segment-key stat-segment-key-${i}">${seg.label}: ${seg.value}</span>`).join('')}
          </div>
        </div>
      `;
    }

    return '';
  }

  function renderRecentlyImported() {
    const displayItems = recentlyImported.slice(0, 5);
    dom.recentlyImportedBody.innerHTML = displayItems.length ? displayItems.map((item, index) => {
      const importStatus = item.importStatus || 'Processed';
      const isInProgress = importStatus !== 'Processed';
      const importStatusBadge = isInProgress ? 'badge-indigo' : 'badge-green';
      const pulseDot = isInProgress ? '<span class="pulse-dot"></span>' : '';
      const canShowTitleId = !isInProgress && item.titleId;
      const relTime = getRelativeTime(item.importDate);
      return `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td><span class="badge badge-gray">${escapeHtml(fixtureGroups[item.groupId]?.name || item.groupId)}</span></td>
        <td>${escapeHtml(item.sport)}</td>
        <td><span title="${escapeHtml(item.importDate)}">${escapeHtml(item.importDate)} <small class="relative-time">(${escapeHtml(relTime)})</small></span></td>
        <td>${renderUserCell(item.importedBy)}</td>
        <td>${canShowTitleId ? `<span class="fixture-id" title="${escapeHtml(item.titleId)}" data-copy-value="${escapeHtml(item.titleId)}">${escapeHtml(item.titleId)}</span>` : '<span class="muted">Not available</span>'}</td>
        <td><span class="badge ${importStatusBadge}">${pulseDot}${escapeHtml(importStatus)}</span></td>
        <td><button type="button" class="btn btn-secondary btn-sm" data-action="view-imported" data-imported-index="${index}">Details</button></td>
      </tr>
    `;
    }).join('') : `
      <tr><td colspan="8"><div class="empty-state">No recent imports yet. Start by importing fixtures from the Import Fixtures tab.</div></td></tr>
    `;
  }

  // Renders a user/system attribution cell: full value on hover, short handle inline.
  function renderUserCell(value) {
    const user = String(value || '').trim();
    if (!user) return '<span class="muted">Unknown</span>';
    const display = user.includes('@') ? user.split('@')[0] : user;
    return `<span class="user-cell" title="${escapeHtml(user)}">${escapeHtml(display)}</span>`;
  }

  function renderSportOptions() {
    const search = state.optionSearch.sport.trim().toLowerCase();
    const visibleSports = sportTypes.filter((sport) => !search || sport.label.toLowerCase().includes(search));

    dom.sportOptions.innerHTML = visibleSports.map((sport) => `
      <label class="multiselect-option">
        <input type="checkbox" value="${escapeHtml(sport.id)}" ${state.filters.sports.has(sport.id) ? 'checked' : ''}>
        ${escapeHtml(sport.label)}
      </label>
    `).join('') || '<div class="multiselect-option">No sport types match.</div>';
  }

  function renderGroupOptions() {
    const search = state.optionSearch.group.trim().toLowerCase();
    const visibleGroups = groupOptions.filter((group) => !search || group.label.toLowerCase().includes(search));

    dom.groupOptions.innerHTML = visibleGroups.map((group) => `
      <label class="multiselect-option">
        <input type="checkbox" value="${escapeHtml(group.id)}" ${state.filters.groups.has(group.id) ? 'checked' : ''}>
        ${escapeHtml(group.label)}
      </label>
    `).join('') || '<div class="multiselect-option">No fixture groups match.</div>';
  }

  function hasActiveFilters() {
    return state.filters.search.trim() !== '' ||
      state.filters.sports.size > 0 ||
      state.filters.groups.size > 0 ||
      state.filters.dateFrom !== null ||
      state.filters.dateTo !== null;
  }

  function getFilteredFixtures() {
    const available = importableFixtures.filter((fixture) => fixture.status !== 'Imported');
    return filterFixtures(available, state.filters, fixtureGroups);
  }

  function getPaginatedItems(items, page) {
    const pageSize = state.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      pageItems: items.slice(start, start + pageSize),
      totalPages,
      page: safePage,
      totalItems: items.length,
      from: items.length ? start + 1 : 0,
      to: Math.min(start + pageSize, items.length)
    };
  }

  function renderPagination(container, target, pagedData) {
    container.innerHTML = `
      <span class="pagination-info">${pagedData.from}-${pagedData.to} of ${pagedData.totalItems}</span>
      <button type="button" class="pagination-btn" data-page-target="${target}" data-page-action="first" ${pagedData.page <= 1 ? 'disabled' : ''}>First</button>
      <button type="button" class="pagination-btn" data-page-target="${target}" data-page-direction="prev" ${pagedData.page <= 1 ? 'disabled' : ''}>Prev</button>
      <span class="pagination-info">Page ${pagedData.page} / ${pagedData.totalPages}</span>
      <input type="number" class="pagination-input" data-page-input-target="${target}" min="1" max="${pagedData.totalPages}" value="${pagedData.page}">
      <button type="button" class="pagination-btn" data-page-target="${target}" data-page-action="go">Go</button>
      <button type="button" class="pagination-btn" data-page-target="${target}" data-page-direction="next" ${pagedData.page >= pagedData.totalPages ? 'disabled' : ''}>Next</button>
      <button type="button" class="pagination-btn" data-page-target="${target}" data-page-action="last" ${pagedData.page >= pagedData.totalPages ? 'disabled' : ''}>Last</button>
    `;
  }

  function renderFixturesTable() {
    if (!state.hasSearched) {
      dom.fixturesBody.innerHTML = `
        <tr>
          <td colspan="8"><div class="empty-state">Use the search bar or filters above to find available fixtures to import.</div></td>
        </tr>
      `;
      dom.fixturesPagination.innerHTML = '';
      dom.fixtureBulkBar.style.display = 'none';
      syncSelectAllState();
      syncImportSelectedButton();
      return;
    }

    dom.fixtureBulkBar.style.display = '';

    const fixtures = getFilteredFixtures();
    const paged = getPaginatedItems(fixtures, state.pagination.fixturesPage);
    state.pagination.fixturesPage = paged.page;

    const hasSelection = state.selectedFixtureIds.size > 0;

    dom.fixturesBody.innerHTML = paged.pageItems.length ? paged.pageItems.map((fixture) => {
      const importCell = `<button type="button" class="btn btn-primary btn-sm" data-action="open-import" data-fixture-id="${escapeHtml(fixture.id)}"${hasSelection ? ' disabled title="Use Import Selected to import multiple fixtures"' : ''}>Import</button>`;
      return `
      <tr>
        <td><input type="checkbox" class="checkbox fixture-checkbox" data-fixture-id="${escapeHtml(fixture.id)}" ${state.selectedFixtureIds.has(fixture.id) ? 'checked' : ''}></td>
        <td><strong>${escapeHtml(fixture.name)}</strong></td>
        <td><span class="badge badge-gray fixture-group-link" data-action="open-group" data-group-id="${escapeHtml(fixture.groupId)}">${escapeHtml(fixtureGroups[fixture.groupId]?.name || fixture.groupId)}</span></td>
        <td>${escapeHtml(fixture.sportType)}</td>
        <td>${escapeHtml(fixture.date)}</td>
        <td>${escapeHtml(fixture.venue)}</td>
        <td class="fixture-id" title="${escapeHtml(fixture.id)}" data-copy-value="${escapeHtml(fixture.id)}">${escapeHtml(fixture.shortId)}</td>
        <td>${importCell}</td>
      </tr>
    `;
    }).join('') : `
      <tr>
        <td colspan="8"><div class="empty-state">No fixtures match the current filters.</div></td>
      </tr>
    `;

    renderPagination(dom.fixturesPagination, 'fixtures', paged);

    syncSelectAllState();
    syncImportSelectedButton();
  }

  function syncImportSelectedButton() {
    const hasSelection = state.selectedFixtureIds.size > 0;
    dom.importSelectedBtn.disabled = !hasSelection;
  }

  function renderSubscriptions() {
    const filtered = getFilteredSubscriptions();
    const paged = getPaginatedItems(filtered, state.pagination.subscriptionsPage);
    state.pagination.subscriptionsPage = paged.page;
    dom.subscriptionsResultCount.textContent = `${filtered.length} of ${subscriptions.length} groups`;
    renderSubscriptionsSummary(filtered);

    dom.subscriptionsBody.innerHTML = paged.pageItems.length ? paged.pageItems.map((subscription, index) => {
      const isExpanded = state.expandedSubscriptionId === subscription.id;
      const sourceIndex = filtered.findIndex((item) => item.id === subscription.id);
      return `
      <tr class="subscription-row${isExpanded ? ' open' : ''}">
        <td>
          <button type="button" class="expand-toggle" data-action="toggle-subscription-details" data-subscription-index="${sourceIndex}" aria-expanded="${isExpanded ? 'true' : 'false'}" title="${isExpanded ? 'Hide fixtures' : 'View fixtures'}">
            <span class="expand-toggle-icon" aria-hidden="true">${isExpanded ? '−' : '+'}</span>
            <span class="expand-toggle-label">${isExpanded ? 'Hide fixtures' : 'View fixtures'}</span>
          </button>
        </td>
        <td>
          <div class="subscription-group-cell">
            <strong>${escapeHtml(subscription.groupName)}</strong>
            <span class="subscription-subtext">${escapeHtml(subscription.queueStatus)}</span>
          </div>
        </td>
        <td>${escapeHtml(subscription.type)}</td>
        <td><span class="badge badge-indigo">${escapeHtml(String(subscription.importedFixtures.length))}</span></td>
        <td>${escapeHtml(subscription.importedSince)}</td>
        <td>${renderImporterCell(subscription)}</td>
        <td>${escapeHtml(subscription.lastSyncedAt)}</td>
        <td><a href="#" class="link" data-action="show-activity" data-subscription-index="${sourceIndex}">${escapeHtml(subscription.activityLabel)}</a></td>
      </tr>
      ${isExpanded ? buildSubscriptionDetailsRowHtml(subscription) : ''}
    `;
    }).join('') : `
      <tr>
        <td colspan="8"><div class="empty-state">No imported fixture groups match the current search.</div></td>
      </tr>
    `;

    renderPagination(dom.subscriptionsPagination, 'subscriptions', paged);

    // If a search auto-expanded a group with a matching fixture, scroll it into view.
    if (state.highlightedFixtureName) {
      const target = dom.subscriptionsBody.querySelector('[data-highlighted="true"]');
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function toggleSubscriptionDetails(subscriptionId) {
    state.expandedSubscriptionId = state.expandedSubscriptionId === subscriptionId ? null : subscriptionId;
    renderSubscriptions();
  }

  // A group can be imported by more than one user/system — show the primary
  // importer and keep the rest available on hover.
  function renderImporterCell(subscription) {
    const importers = Array.isArray(subscription.importedByList) && subscription.importedByList.length
      ? subscription.importedByList
      : [subscription.importedBy].filter(Boolean);
    if (!importers.length) return '<span class="muted">Unknown</span>';

    const [primary, ...others] = importers;
    const primaryHtml = renderUserCell(primary);
    if (!others.length) return primaryHtml;
    return `${primaryHtml} <span class="user-cell-more" title="${escapeHtml(importers.join(', '))}">+${others.length}</span>`;
  }

  function buildSubscriptionDetailsRowHtml(subscription) {
    const importers = Array.isArray(subscription.importedByList) && subscription.importedByList.length
      ? subscription.importedByList.join(', ')
      : subscription.importedBy || 'Unknown';
    return `
      <tr class="subscription-details-row">
        <td colspan="8">
          <div class="subscription-details-panel">
            <div class="subscription-details-header">
              <span><strong>Sport:</strong> ${escapeHtml(subscription.type)}</span>
              <span><strong>Imported Since:</strong> ${escapeHtml(subscription.importedSince)}</span>
              <span><strong>Imported By:</strong> ${escapeHtml(importers)}</span>
            </div>
            <div class="group-fixtures-list">${buildSubscriptionFixturesHtml(subscription.importedFixtures || [])}</div>
          </div>
        </td>
      </tr>
    `;
  }


  function clearSubscriptionsSearch() {
    state.subscriptionsSearch = '';
    state.pagination.subscriptionsPage = 1;
    state.highlightedFixtureName = '';
    dom.subscriptionsSearchInput.value = '';
    renderSubscriptions();
  }

  function renderSubscriptionsSummary(filteredSubscriptions) {
    const allImportedCount = subscriptions.reduce((count, subscription) => count + (subscription.importedFixtures || []).length, 0);
    const filteredImportedCount = filteredSubscriptions.reduce((count, subscription) => count + (subscription.importedFixtures || []).length, 0);
    const latestSync = filteredSubscriptions.reduce((latest, subscription) => {
      const label = subscription.lastSyncedAt;
      const timestamp = label ? new Date(label).getTime() : Number.NaN;
      if (Number.isNaN(timestamp)) return latest;
      if (!latest || timestamp > latest.timestamp) return { timestamp, label };
      return latest;
    }, null);
    const lastSyncedAt = latestSync?.label || 'N/A';

    dom.subscriptionsSummary.innerHTML = `
      <div class="subscription-summary-item">
        <span class="subscription-summary-label">Visible Groups</span>
        <span class="subscription-summary-value">${escapeHtml(String(filteredSubscriptions.length))}</span>
      </div>
      <div class="subscription-summary-item">
        <span class="subscription-summary-label">Imported Fixtures</span>
        <span class="subscription-summary-value">${escapeHtml(String(filteredImportedCount))} <small>/ ${escapeHtml(String(allImportedCount))}</small></span>
      </div>
      <div class="subscription-summary-item">
        <span class="subscription-summary-label">Latest Update (Visible)</span>
        <span class="subscription-summary-value">${escapeHtml(lastSyncedAt)}</span>
      </div>
    `;
  }

  function getFilteredSubscriptions() {
    const query = state.subscriptionsSearch.trim().toLowerCase();
    const selectedSports = state.pubFilters.sports;
    const selectedGroups = state.pubFilters.groups;
    const fromDate = state.pubFilters.dateFrom ? parseSubDate(state.pubFilters.dateFrom) : null;
    const toDate = state.pubFilters.dateTo ? parseSubDate(state.pubFilters.dateTo) : null;

    return subscriptions.filter((subscription) => {
      // Sport-type filter: match on the sport label associated with the group's sportType id
      if (selectedSports.size) {
        const sportId = sportLabelToId(subscription.type);
        if (!sportId || !selectedSports.has(sportId)) return false;
      }

      // Fixture-group filter
      if (selectedGroups.size && !selectedGroups.has(subscription.groupId)) return false;

      // Date-range filter: keep subscription if ANY imported fixture falls in range
      if (fromDate || toDate) {
        const anyInRange = (subscription.importedFixtures || []).some((fixture) => {
          const d = parseSubDate(fixture.importedOn);
          if (!d) return false;
          if (fromDate && d < fromDate) return false;
          if (toDate && d > toDate) return false;
          return true;
        });
        if (!anyInRange) return false;
      }

      // Text search
      if (!query) return true;
      const fixtureNames = (subscription.importedFixtures || []).map((fixture) => fixture.name).join(' ');
      const fixtureTypes = (subscription.importedFixtures || []).map((fixture) => fixture.type).join(' ');
      const fixtureDates = (subscription.importedFixtures || []).map((fixture) => fixture.importedOn).join(' ');
      const searchText = [
        subscription.groupName,
        subscription.fixtureManagerRecordId,
        subscription.type,
        subscription.importedSince,
        (subscription.importedByList || []).join(' '),
        fixtureNames,
        fixtureTypes,
        fixtureDates
      ].join(' ').toLowerCase();

      return searchText.includes(query);
    });
  }

  function parseSubDate(value) {
    if (!value) return null;
    const d = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function sportLabelToId(label) {
    if (!label) return '';
    const match = sportTypes.find((sport) => sport.label.toLowerCase() === String(label).toLowerCase());
    return match ? match.id : '';
  }

  // ─── Published Fixtures filter helpers ───
  function renderPubSportOptions() {
    const search = state.pubOptionSearch.sport.trim().toLowerCase();
    const visible = sportTypes.filter((sport) => !search || sport.label.toLowerCase().includes(search));
    dom.pubSportOptions.innerHTML = visible.map((sport) => `
      <label class="multiselect-option">
        <input type="checkbox" value="${escapeHtml(sport.id)}" ${state.pubFilters.sports.has(sport.id) ? 'checked' : ''}>
        ${escapeHtml(sport.label)}
      </label>
    `).join('') || '<div class="multiselect-option">No sport types match.</div>';
  }

  function renderPubGroupOptions() {
    const search = state.pubOptionSearch.group.trim().toLowerCase();
    const visible = groupOptions.filter((group) => !search || group.label.toLowerCase().includes(search));
    dom.pubGroupOptions.innerHTML = visible.map((group) => `
      <label class="multiselect-option">
        <input type="checkbox" value="${escapeHtml(group.id)}" ${state.pubFilters.groups.has(group.id) ? 'checked' : ''}>
        ${escapeHtml(group.label)}
      </label>
    `).join('') || '<div class="multiselect-option">No fixture groups match.</div>';
  }

  function togglePubDropdown(dropdown) {
    [dom.pubSportDropdown, dom.pubGroupDropdown, dom.pubDatePickerPopup].forEach((element) => {
      if (element !== dropdown) element.classList.remove('open');
    });
    dropdown.classList.toggle('open');
  }

  function clearPubSportFilter() {
    state.pubFilters.sports.clear();
    state.pubOptionSearch.sport = '';
    state.pagination.subscriptionsPage = 1;
    dom.pubSportOptionsSearch.value = '';
    syncPubFilterLabels();
    renderPubSportOptions();
    renderSubscriptions();
  }

  function clearPubGroupFilter() {
    state.pubFilters.groups.clear();
    state.pubOptionSearch.group = '';
    state.pagination.subscriptionsPage = 1;
    dom.pubGroupOptionsSearch.value = '';
    syncPubFilterLabels();
    renderPubGroupOptions();
    renderSubscriptions();
  }

  function syncPubFilterLabels() {
    const selectedSports = sportTypes.filter((sport) => state.pubFilters.sports.has(sport.id));
    const selectedGroups = groupOptions.filter((group) => state.pubFilters.groups.has(group.id));

    if (!selectedSports.length) dom.pubSportFilterLabel.textContent = 'All Sports';
    else if (selectedSports.length === 1) dom.pubSportFilterLabel.textContent = selectedSports[0].label;
    else dom.pubSportFilterLabel.textContent = `${selectedSports.length} sports selected`;
    dom.pubSportClearBtn.style.display = selectedSports.length ? '' : 'none';

    if (!selectedGroups.length) dom.pubGroupFilterLabel.textContent = 'All Fixture Groups';
    else if (selectedGroups.length === 1) dom.pubGroupFilterLabel.textContent = selectedGroups[0].label;
    else dom.pubGroupFilterLabel.textContent = `${selectedGroups.length} groups selected`;
    dom.pubGroupClearBtn.style.display = selectedGroups.length ? '' : 'none';

    if (!state.pubFilters.dateFrom) {
      dom.pubDateRangeLabel.textContent = 'All Dates';
      dom.pubDateClearBtn.style.display = 'none';
    } else if (!state.pubFilters.dateTo) {
      dom.pubDateRangeLabel.textContent = formatDisplayDate(state.pubFilters.dateFrom);
      dom.pubDateClearBtn.style.display = '';
    } else {
      dom.pubDateRangeLabel.textContent = `${formatDisplayDate(state.pubFilters.dateFrom)} – ${formatDisplayDate(state.pubFilters.dateTo)}`;
      dom.pubDateClearBtn.style.display = '';
    }
    updateRangeFooterText('pub');
  }

  function togglePubDatePicker() {
    closeCalJump('pub');
    togglePubDropdown(dom.pubDatePickerPopup);
    if (dom.pubDatePickerPopup.classList.contains('open')) {
      setActiveDateField('pub', state.pubDatePicker.start && !state.pubDatePicker.end ? 'end' : 'start', { silent: true });
      setDateInputError('pub', '');
      renderPubCalendar();
    }
  }

  function changePubMonth(direction) {
    changeCalMonth('pub', direction);
  }

  function selectPubDatePreset(preset) {
    selectPresetFor('pub', preset);
  }

  function selectPubCalendarDate(date) {
    selectRangeDate('pub', date);
  }

  function renderPubCalendar() {
    renderCalendarFor('pub');
  }

  function updatePubDatePickerText() {
    updateRangeFooterText('pub');
  }

  function updatePubHoverStyles() {
    updateHoverStylesFor('pub');
  }

  function applyPubDatePicker() {
    closeCalJump('pub');
    // Flush anything still sitting in the typed inputs before applying.
    if (!commitPendingRangeInputs('pub')) return;

    state.pubFilters.dateFrom = cloneDate(state.pubDatePicker.start);
    state.pubFilters.dateTo = cloneDate(state.pubDatePicker.end || state.pubDatePicker.start);
    dom.pubDatePickerPopup.classList.remove('open');
    state.pagination.subscriptionsPage = 1;
    syncPubFilterLabels();
    renderSubscriptions();
  }

  function clearPubDateRange() {
    closeCalJump('pub');
    state.pubFilters.dateFrom = null;
    state.pubFilters.dateTo = null;
    state.pubDatePicker.start = null;
    state.pubDatePicker.end = null;
    state.pubDatePicker.hover = null;
    clearRangeInputs('pub');
    dom.pubDatePickerPopup.classList.remove('open');
    state.pagination.subscriptionsPage = 1;
    syncPubFilterLabels();
    renderPubCalendar();
    renderSubscriptions();
  }

  // Auto-expand the subscription group and highlight the matching fixture when
  // the search query matches a specific fixture name inside importedFixtures.
  function applyPublishedSearchAutoExpand() {
    const query = state.subscriptionsSearch.trim().toLowerCase();
    state.highlightedFixtureName = '';
    if (!query) return;

    // Only auto-expand when the query is specific enough to match a fixture name
    // (not just a generic group/type keyword).
    for (const subscription of subscriptions) {
      const matchedFixture = (subscription.importedFixtures || []).find((fixture) => {
        const name = String(fixture.name || '').toLowerCase();
        return name.includes(query);
      });
      if (matchedFixture) {
        state.expandedSubscriptionId = subscription.id;
        state.highlightedFixtureName = matchedFixture.name;
        return;
      }
    }
  }

  function toggleActivityDatePicker() {
    closeCalJump('activity');
    [dom.sportDropdown, dom.groupDropdown, dom.datePickerPopup, dom.activityGroupDropdown].forEach((element) => element.classList.remove('open'));
    dom.activityDatePickerPopup.classList.toggle('open');
    if (dom.activityDatePickerPopup.classList.contains('open')) {
      setActiveDateField('activity', state.activityDatePicker.start && !state.activityDatePicker.end ? 'end' : 'start', { silent: true });
      setDateInputError('activity', '');
      renderActivityCalendar();
    }
  }

  function changeActivityMonth(direction) {
    changeCalMonth('activity', direction);
  }

  function selectActivityDatePreset(preset) {
    selectPresetFor('activity', preset);
  }

  function selectActivityCalendarDate(date) {
    selectRangeDate('activity', date);
  }

  function renderActivityCalendar() {
    renderCalendarFor('activity');
  }

  function updateActivityDatePickerText() {
    updateRangeFooterText('activity');
  }

  function updateActivityHoverStyles() {
    updateHoverStylesFor('activity');
  }

  function applyActivityDatePicker() {
    closeCalJump('activity');
    // Flush anything still sitting in the typed inputs before applying.
    if (!commitPendingRangeInputs('activity')) return;

    state.activityFilters.dateFrom = toLocalISODate(state.activityDatePicker.start);
    const endDate = state.activityDatePicker.end || state.activityDatePicker.start;
    state.activityFilters.dateTo = toLocalISODate(endDate);
    dom.activityDatePickerPopup.classList.remove('open');
    state.pagination.activityPage = 1;
    syncActivityFilterInputs();
    renderActivityLog();
  }

  function clearActivityDateRange() {
    closeCalJump('activity');
    state.activityFilters.dateFrom = '';
    state.activityFilters.dateTo = '';
    state.activityDatePicker.start = null;
    state.activityDatePicker.end = null;
    state.activityDatePicker.hover = null;
    clearRangeInputs('activity');
    dom.activityDatePickerPopup.classList.remove('open');
    state.pagination.activityPage = 1;
    syncActivityFilterInputs();
    renderActivityCalendar();
    renderActivityLog();
  }

  function getFilteredActivityLog() {
    return activityLog.filter((entry) => {
      if (state.activityFilters.groups.size > 0 && !state.activityFilters.groups.has(entry.groupId)) return false;
      if (state.activityFilters.action && entry.action !== state.activityFilters.action) return false;
      if (state.activityFilters.dateFrom || state.activityFilters.dateTo) {
        const entryDate = new Date(entry.timestamp);
        if (Number.isNaN(entryDate.getTime())) return false;
        // Must match the local-day basis used for the filter bounds, otherwise an
        // entry logged just after local midnight falls into the previous UTC day
        // and is wrongly excluded.
        const entryDay = toLocalISODate(entryDate);
        if (state.activityFilters.dateFrom && entryDay < state.activityFilters.dateFrom) return false;
        if (state.activityFilters.dateTo && entryDay > state.activityFilters.dateTo) return false;
      }
      return true;
    });
  }

  function renderActivityFilters() {
    const actionOptions = Array.from(new Set(activityLog.map((entry) => entry.action).filter(Boolean))).sort();
    dom.activityActionFilter.innerHTML = `<option value="">All Actions</option>${actionOptions.map((action) => `<option value="${escapeHtml(action)}">${escapeHtml(action)}</option>`).join('')}`;
    renderActivityGroupOptions();
    syncActivityFilterInputs();
  }

  function renderActivityGroupOptions() {
    const search = state.activityFilters.groupSearch.trim().toLowerCase();
    const allGroupIds = Array.from(new Set(activityLog.map((entry) => entry.groupId).filter(Boolean))).sort();
    const visible = search ? allGroupIds.filter((id) => {
      const label = fixtureGroups[id]?.name || id;
      return label.toLowerCase().includes(search);
    }) : allGroupIds;

    dom.activityGroupOptions.innerHTML = visible.map((groupId) => {
      const label = fixtureGroups[groupId]?.name || groupId;
      return `<label class="multiselect-option"><input type="checkbox" value="${escapeHtml(groupId)}" ${state.activityFilters.groups.has(groupId) ? 'checked' : ''}>${escapeHtml(label)}</label>`;
    }).join('') || '<div class="multiselect-option">No groups match.</div>';
  }

  function toggleActivityGroupDropdown() {
    dom.activityGroupDropdown.classList.toggle('open');
  }

  function clearActivityGroupFilter() {
    state.activityFilters.groups.clear();
    state.activityFilters.groupSearch = '';
    dom.activityGroupOptionsSearch.value = '';
    state.pagination.activityPage = 1;
    syncActivityGroupLabel();
    renderActivityGroupOptions();
    renderActivityLog();
  }

  function syncActivityGroupLabel() {
    const count = state.activityFilters.groups.size;
    if (!count) {
      dom.activityGroupFilterLabel.textContent = 'All Fixture Groups';
      dom.activityGroupClearBtn.style.display = 'none';
    } else if (count === 1) {
      const id = Array.from(state.activityFilters.groups)[0];
      dom.activityGroupFilterLabel.textContent = fixtureGroups[id]?.name || id;
      dom.activityGroupClearBtn.style.display = '';
    } else {
      dom.activityGroupFilterLabel.textContent = `${count} groups selected`;
      dom.activityGroupClearBtn.style.display = '';
    }
  }

  function syncActivityFilterInputs() {
    syncActivityGroupLabel();
    dom.activityActionFilter.value = state.activityFilters.action;
    state.activityDatePicker.start = state.activityFilters.dateFrom ? new Date(`${state.activityFilters.dateFrom}T00:00:00`) : null;
    state.activityDatePicker.end = state.activityFilters.dateTo ? new Date(`${state.activityFilters.dateTo}T00:00:00`) : null;
    if (!state.activityFilters.dateFrom) {
      dom.activityDateRangeLabel.textContent = 'All Dates';
      dom.activityDateClearBtn.style.display = 'none';
    } else if (!state.activityFilters.dateTo || state.activityFilters.dateFrom === state.activityFilters.dateTo) {
      dom.activityDateRangeLabel.textContent = formatDisplayDate(state.activityDatePicker.start);
      dom.activityDateClearBtn.style.display = '';
    } else {
      dom.activityDateRangeLabel.textContent = `${formatDisplayDate(state.activityDatePicker.start)} – ${formatDisplayDate(state.activityDatePicker.end)}`;
      dom.activityDateClearBtn.style.display = '';
    }
    syncDateInputs('activity');
    updateRangeFooterText('activity');
  }

  function renderActivityLog() {
    const filtered = getFilteredActivityLog();
    const paged = getPaginatedItems(filtered, state.pagination.activityPage);
    state.pagination.activityPage = paged.page;

    dom.activityLogBody.innerHTML = paged.pageItems.length ? paged.pageItems.map((entry) => `
      <tr>
        <td>${escapeHtml(entry.timestamp)}</td>
        <td><span class="badge ${escapeHtml(entry.actionBadge)}">${escapeHtml(entry.action)}</span></td>
        <td>
          <div><strong>${escapeHtml(entry.fixture)}</strong></div>
          <div class="activity-change">${escapeHtml(entry.detailType || 'Update')} · ${escapeHtml(entry.oldValue || 'N/A')} → ${escapeHtml(entry.newValue || 'N/A')}</div>
        </td>
        <td>${escapeHtml(entry.updatedBy || entry.user)}</td>
        <td><a href="#" class="link" data-action="view-activity-details" data-activity-id="${escapeHtml(String(entry.id))}">Details</a></td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="5"><div class="empty-state">No activity records match the current filters.</div></td>
      </tr>
    `;

    renderPagination(dom.activityPagination, 'activity', paged);
  }

  function clearActivityFilters() {
    state.activityFilters.groups.clear();
    state.activityFilters.groupSearch = '';
    state.activityFilters.action = '';
    state.activityFilters.dateFrom = '';
    state.activityFilters.dateTo = '';
    state.activityDatePicker.start = null;
    state.activityDatePicker.end = null;
    state.activityDatePicker.hover = null;
    clearRangeInputs('activity');
    state.pagination.activityPage = 1;
    dom.activityGroupOptionsSearch.value = '';
    renderActivityGroupOptions();
    syncActivityFilterInputs();
    renderActivityLog();
  }

  function openSubscriptionActivity(subscription) {
    state.activityFilters.groups.clear();
    if (subscription.groupId) state.activityFilters.groups.add(subscription.groupId);
    state.pagination.activityPage = 1;
    dom.activityGroupDropdown.classList.remove('open');
    dom.activityDatePickerPopup.classList.remove('open');
    syncActivityGroupLabel();
    renderActivityGroupOptions();
    renderActivityLog();
    switchPage(3);
    actions.showActivity?.(subscription);
  }

  function syncFilterLabels() {
    const selectedSports = sportTypes.filter((sport) => state.filters.sports.has(sport.id));
    const selectedGroups = groupOptions.filter((group) => state.filters.groups.has(group.id));

    if (!selectedSports.length) dom.sportFilterLabel.textContent = 'All Sports';
    else if (selectedSports.length === 1) dom.sportFilterLabel.textContent = selectedSports[0].label;
    else dom.sportFilterLabel.textContent = `${selectedSports.length} sports selected`;
    dom.sportClearBtn.style.display = selectedSports.length ? '' : 'none';

    if (!selectedGroups.length) dom.groupFilterLabel.textContent = 'All Fixture Groups';
    else if (selectedGroups.length === 1) dom.groupFilterLabel.textContent = selectedGroups[0].label;
    else dom.groupFilterLabel.textContent = `${selectedGroups.length} groups selected`;
    dom.groupClearBtn.style.display = selectedGroups.length ? '' : 'none';

    if (!state.filters.dateFrom) {
      dom.dateRangeLabel.textContent = 'All Dates';
      dom.dateClearBtn.style.display = 'none';
    } else if (!state.filters.dateTo) {
      dom.dateRangeLabel.textContent = formatDisplayDate(state.filters.dateFrom);
      dom.dateClearBtn.style.display = '';
    } else {
      dom.dateRangeLabel.textContent = `${formatDisplayDate(state.filters.dateFrom)} – ${formatDisplayDate(state.filters.dateTo)}`;
      dom.dateClearBtn.style.display = '';
    }
    updateRangeFooterText('fixtures');
  }

  function clearSportFilter() {
    state.filters.sports.clear();
    state.optionSearch.sport = '';
    state.pagination.fixturesPage = 1;
    dom.sportOptionsSearch.value = '';
    if (!hasActiveFilters()) state.hasSearched = false;
    syncFilterLabels();
    renderSportOptions();
    renderFixturesTable();
  }

  function clearGroupFilter() {
    state.filters.groups.clear();
    state.optionSearch.group = '';
    state.pagination.fixturesPage = 1;
    dom.groupOptionsSearch.value = '';
    if (!hasActiveFilters()) state.hasSearched = false;
    syncFilterLabels();
    renderGroupOptions();
    renderFixturesTable();
  }

  function toggleDropdown(dropdown) {
    [dom.sportDropdown, dom.groupDropdown, dom.datePickerPopup].forEach((element) => {
      if (element !== dropdown) element.classList.remove('open');
    });
    dropdown.classList.toggle('open');
  }

  // ─── Shared calendar month/year quick navigation ───
  // Powers the clickable month label in every date picker (Import Fixtures,
  // Imported Fixtures and Activity Log) so users can jump months/years fast.
  const CAL_JUMP_YEARS_PER_PAGE = 12;

  function getCalPicker(key) {
    if (key === 'pub') {
      return { picker: state.pubDatePicker, monthEl: dom.pubCalMonth1, jumpEl: dom.pubCalJump1, render: renderPubCalendar };
    }
    if (key === 'activity') {
      return { picker: state.activityDatePicker, monthEl: dom.activityCalMonth1, jumpEl: dom.activityCalJump1, render: renderActivityCalendar };
    }
    return { picker: state.datePicker, monthEl: dom.calMonth1, jumpEl: dom.calJump1, render: renderCalendar };
  }

  function ensureCalJumpState(picker) {
    if (!picker.jump) {
      picker.jump = { open: false, mode: 'month', year: picker.viewDate.getFullYear(), yearStart: 0 };
    }
    return picker.jump;
  }

  function getCalJumpYearStart(year) {
    return Math.floor(year / CAL_JUMP_YEARS_PER_PAGE) * CAL_JUMP_YEARS_PER_PAGE;
  }

  function toggleCalJump(key) {
    const { picker, render } = getCalPicker(key);
    const jump = ensureCalJumpState(picker);
    jump.open = !jump.open;
    if (jump.open) {
      jump.mode = 'month';
      jump.year = picker.viewDate.getFullYear();
      jump.yearStart = getCalJumpYearStart(jump.year);
    }
    renderCalJump(key);
    if (!jump.open) render();
  }

  function closeCalJump(key) {
    const { picker } = getCalPicker(key);
    const jump = ensureCalJumpState(picker);
    if (!jump.open) return;
    jump.open = false;
    renderCalJump(key);
  }

  function renderCalMonthLabel(element, viewDate) {
    if (!element) return;
    // Caret is rendered via CSS so the label keeps a clean text value.
    element.textContent = `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  }

  function renderCalJump(key) {
    const { picker, monthEl, jumpEl } = getCalPicker(key);
    if (!jumpEl) return;
    const jump = ensureCalJumpState(picker);

    if (monthEl) monthEl.setAttribute('aria-expanded', jump.open ? 'true' : 'false');
    if (!jump.open) {
      jumpEl.classList.remove('open');
      jumpEl.innerHTML = '';
      return;
    }

    const viewYear = picker.viewDate.getFullYear();
    const viewMonth = picker.viewDate.getMonth();
    const today = new Date();
    let html = '';

    if (jump.mode === 'month') {
      html += '<div class="cal-jump-nav">'
        + '<button type="button" class="cal-nav-btn" data-cal-jump-step="-1" aria-label="Previous year">‹</button>'
        + `<button type="button" class="cal-jump-title" data-cal-jump-mode="year" title="Pick a year">${jump.year}</button>`
        + '<button type="button" class="cal-nav-btn" data-cal-jump-step="1" aria-label="Next year">›</button>'
        + '</div><div class="cal-jump-grid">';
      MONTHS.forEach((name, index) => {
        let classes = 'cal-jump-item';
        if (index === viewMonth && jump.year === viewYear) classes += ' cal-jump-active';
        else if (index === today.getMonth() && jump.year === today.getFullYear()) classes += ' cal-jump-today';
        html += `<button type="button" class="${classes}" data-cal-jump-month="${index}">${name.slice(0, 3)}</button>`;
      });
      html += '</div>';
    } else {
      const start = jump.yearStart;
      const end = start + CAL_JUMP_YEARS_PER_PAGE - 1;
      html += '<div class="cal-jump-nav">'
        + '<button type="button" class="cal-nav-btn" data-cal-jump-step="-1" aria-label="Previous years">‹</button>'
        + `<span class="cal-jump-title cal-jump-title-static">${start} – ${end}</span>`
        + '<button type="button" class="cal-nav-btn" data-cal-jump-step="1" aria-label="Next years">›</button>'
        + '</div><div class="cal-jump-grid">';
      for (let offset = 0; offset < CAL_JUMP_YEARS_PER_PAGE; offset++) {
        const year = start + offset;
        let classes = 'cal-jump-item';
        if (year === viewYear) classes += ' cal-jump-active';
        else if (year === today.getFullYear()) classes += ' cal-jump-today';
        html += `<button type="button" class="${classes}" data-cal-jump-year="${year}">${year}</button>`;
      }
      html += '</div>';
    }

    jumpEl.innerHTML = html;
    jumpEl.classList.add('open');
  }

  function handleCalJumpClick(key, event) {
    const button = event.target.closest('button');
    if (!button) return;
    // Keep the date picker popup open while navigating months/years.
    event.stopPropagation();

    const { picker, render } = getCalPicker(key);
    const jump = ensureCalJumpState(picker);

    if (button.dataset.calJumpStep) {
      const step = Number(button.dataset.calJumpStep);
      if (jump.mode === 'month') jump.year += step;
      else jump.yearStart += step * CAL_JUMP_YEARS_PER_PAGE;
      renderCalJump(key);
      return;
    }

    if (button.dataset.calJumpMode === 'year') {
      jump.mode = 'year';
      jump.yearStart = getCalJumpYearStart(jump.year);
      renderCalJump(key);
      return;
    }

    if (button.dataset.calJumpYear) {
      jump.year = Number(button.dataset.calJumpYear);
      jump.mode = 'month';
      renderCalJump(key);
      return;
    }

    if (button.dataset.calJumpMonth !== undefined) {
      const month = Number(button.dataset.calJumpMonth);
      picker.viewDate = new Date(jump.year, month, 1);
      jump.open = false;
      render();
    }
  }

  function toggleDatePicker() {
    closeCalJump('fixtures');
    toggleDropdown(dom.datePickerPopup);
    if (dom.datePickerPopup.classList.contains('open')) {
      setActiveDateField('fixtures', state.datePicker.start && !state.datePicker.end ? 'end' : 'start', { silent: true });
      setDateInputError('fixtures', '');
      renderCalendar();
    }
  }

  function changeMonth(direction) {
    changeCalMonth('fixtures', direction);
  }

  function changeYear(direction) {
    changeCalYear('fixtures', direction);
  }

  // ─── Shared date range picker plumbing ───
  // All three pickers (Import Fixtures, Imported Fixtures, Activity Log) are the
  // same widget over different state, so one context lookup drives every shared
  // behaviour: grid rendering, presets, typed DD/MM/YYYY input and keyboard nav.
  function getDateRangeCtx(key) {
    if (key === 'pub') {
      return {
        key,
        picker: state.pubDatePicker,
        fromInput: dom.pubDateFromInput,
        toInput: dom.pubDateToInput,
        fromField: dom.pubDateFromField,
        toField: dom.pubDateToField,
        errorEl: dom.pubDateInputError,
        rangeTextEl: dom.pubDateRangeText,
        gridEl: dom.pubCalGrid1,
        monthEl: dom.pubCalMonth1,
        jumpEl: dom.pubCalJump1,
        render: renderPubCalendar,
        apply: applyPubDatePicker
      };
    }
    if (key === 'activity') {
      return {
        key,
        picker: state.activityDatePicker,
        fromInput: dom.activityDateFromInput,
        toInput: dom.activityDateToInput,
        fromField: dom.activityDateFromField,
        toField: dom.activityDateToField,
        errorEl: dom.activityDateInputError,
        rangeTextEl: dom.activityDateRangeText,
        gridEl: dom.activityCalGrid1,
        monthEl: dom.activityCalMonth1,
        jumpEl: dom.activityCalJump1,
        render: renderActivityCalendar,
        apply: applyActivityDatePicker
      };
    }
    return {
      key,
      picker: state.datePicker,
      fromInput: dom.dateFromInput,
      toInput: dom.dateToInput,
      fromField: dom.dateFromField,
      toField: dom.dateToField,
      errorEl: dom.dateInputError,
      rangeTextEl: dom.dateRangeText,
      gridEl: dom.calGrid1,
      monthEl: dom.calMonth1,
      jumpEl: dom.calJump1,
      render: renderCalendar,
      apply: applyDatePicker
    };
  }

  // Builds the month grid for any picker. Previously this existed three times,
  // byte-identical apart from the state path, which is how date bugs got fixed
  // in one calendar and missed in the other two.
  function renderCalendarFor(key) {
    const ctx = getDateRangeCtx(key);
    const { picker, gridEl } = ctx;
    const viewDate = picker.viewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    renderCalMonthLabel(ctx.monthEl, viewDate);

    let html = '<div class="cal-row cal-header" role="row">';
    DAYS.forEach((day) => { html += `<div class="cal-cell cal-day-name" role="columnheader">${day}</div>`; });
    html += '</div>';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const focusDay = getCalFocusDay(picker, year, month, daysInMonth);

    let day = 1;
    for (let week = 0; week < 6; week++) {
      if (day > daysInMonth) break;
      html += '<div class="cal-row" role="row">';
      for (let weekday = 0; weekday < 7; weekday++) {
        if ((week === 0 && weekday < firstDay) || day > daysInMonth) {
          html += '<div class="cal-cell" role="gridcell"></div>';
          continue;
        }

        const date = new Date(year, month, day);
        const dateKey = date.toDateString();
        let classes = 'cal-cell cal-day';
        let selected = false;

        if (picker.start && dateKey === picker.start.toDateString()) { classes += ' cal-start'; selected = true; }
        if (picker.end && dateKey === picker.end.toDateString()) { classes += ' cal-end'; selected = true; }
        if (picker.start && picker.end && date > picker.start && date < picker.end) classes += ' cal-in-range';
        if (date.getTime() === today.getTime()) classes += ' cal-today';

        // Roving tabindex: exactly one cell is tabbable, arrow keys move it.
        const tabIndex = day === focusDay ? 0 : -1;
        html += `<div class="${classes}" role="gridcell" tabindex="${tabIndex}"`
          + ` aria-selected="${selected ? 'true' : 'false'}"`
          + ` aria-label="${escapeHtml(formatDisplayDate(date))}"`
          + ` data-date="${escapeHtml(dateKey)}">${day}</div>`;
        day++;
      }
      html += '</div>';
    }

    gridEl.innerHTML = html;
    renderCalJump(key);
    syncDateInputs(key);
    updateRangeFooterText(key);
    updateHoverStylesFor(key);
  }

  // Which day in the visible month should own the single tab stop.
  function getCalFocusDay(picker, year, month, daysInMonth) {
    const inView = (date) => date && date.getFullYear() === year && date.getMonth() === month;
    if (inView(picker.start)) return picker.start.getDate();
    if (inView(picker.end)) return picker.end.getDate();
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === month) return today.getDate();
    return Math.min(1, daysInMonth);
  }

  function updateHoverStylesFor(key) {
    const { picker, gridEl } = getDateRangeCtx(key);
    if (!picker.start || picker.end || !picker.hover) return;

    gridEl.querySelectorAll('.cal-day').forEach((cell) => {
      cell.classList.remove('cal-hover-range');
      const date = new Date(cell.dataset.date);
      if ((date > picker.start && date <= picker.hover) || (date < picker.start && date >= picker.hover)) {
        cell.classList.add('cal-hover-range');
      }
    });
  }

  function changeCalMonth(key, direction) {
    const { picker, render } = getDateRangeCtx(key);
    closeCalJump(key);
    // Normalise to the 1st so month stepping never skips a short month.
    picker.viewDate.setDate(1);
    picker.viewDate.setMonth(picker.viewDate.getMonth() + direction);
    render();
  }

  function selectPresetFor(key, preset) {
    const ctx = getDateRangeCtx(key);
    const { picker } = ctx;
    closeCalJump(key);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (preset === 'today') {
      picker.start = new Date(now);
      picker.end = new Date(now);
    } else if (preset === 'week') {
      const dayOfWeek = now.getDay();
      picker.start = new Date(now);
      picker.start.setDate(now.getDate() - dayOfWeek);
      picker.end = new Date(picker.start);
      picker.end.setDate(picker.start.getDate() + 6);
    } else if (preset === 'month') {
      picker.start = new Date(now.getFullYear(), now.getMonth(), 1);
      picker.end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'quarter') {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      picker.start = new Date(now.getFullYear(), qStart, 1);
      picker.end = new Date(now.getFullYear(), qStart + 3, 0);
    } else {
      return;
    }

    picker.viewDate = new Date(picker.start);
    resetRangeEntryState(key);
    ctx.render();
  }

  // Arrow-key navigation over the month grid, mirroring native date pickers.
  function handleCalGridKeydown(key, event) {
    const cell = event.target.closest('.cal-day');
    if (!cell) return;

    const STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const current = new Date(cell.dataset.date);

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectRangeDate(key, current);
      focusCalDay(key, current);
      return;
    }

    let target = null;
    if (STEPS[event.key] !== undefined) {
      target = new Date(current);
      target.setDate(current.getDate() + STEPS[event.key]);
    } else if (event.key === 'Home') {
      target = new Date(current.getFullYear(), current.getMonth(), 1);
    } else if (event.key === 'End') {
      target = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      target = new Date(current);
      target.setDate(1);
      target.setMonth(current.getMonth() + (event.key === 'PageUp' ? -1 : 1));
    } else {
      return;
    }

    event.preventDefault();
    const ctx = getDateRangeCtx(key);
    // Follow the cursor into the neighbouring month when it steps outside.
    if (target.getMonth() !== ctx.picker.viewDate.getMonth() || target.getFullYear() !== ctx.picker.viewDate.getFullYear()) {
      ctx.picker.viewDate = new Date(target.getFullYear(), target.getMonth(), 1);
      closeCalJump(key);
      ctx.render();
    }
    focusCalDay(key, target);
  }

  function focusCalDay(key, date) {
    const { gridEl } = getDateRangeCtx(key);
    const cell = gridEl.querySelector(`.cal-day[data-date="${date.toDateString()}"]`);
    if (!cell) return;
    gridEl.querySelectorAll('.cal-day').forEach((day) => { day.tabIndex = -1; });
    cell.tabIndex = 0;
    cell.focus();
  }

  function changeCalYear(key, direction) {
    const { picker, render } = getDateRangeCtx(key);
    closeCalJump(key);
    picker.viewDate.setDate(1);
    picker.viewDate.setFullYear(picker.viewDate.getFullYear() + direction);
    render();
  }

  function bindDateRangeInputs(key) {
    const ctx = getDateRangeCtx(key);
    bindDateRangeInput(key, ctx.fromInput, 'start');
    bindDateRangeInput(key, ctx.toInput, 'end');
  }

  function bindDateRangeInput(key, input, field) {
    if (!input) return;

    input.addEventListener('focus', () => setActiveDateField(key, field));
    input.addEventListener('click', (event) => {
      event.stopPropagation();
      setActiveDateField(key, field);
    });
    input.addEventListener('input', () => {
      const masked = maskInputDate(input.value);
      if (masked !== input.value) input.value = masked;
      // Only commit once a full date has been typed; keeps errors from flashing.
      commitDateInput(key, field, true);
    });
    input.addEventListener('blur', () => commitDateInput(key, field, false));
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const ctx = getDateRangeCtx(key);
      if (!commitDateInput(key, field, false)) return;
      if (field === 'start') ctx.toInput.focus();
      else if (ctx.picker.start && ctx.picker.end) ctx.apply();
    });
  }

  function commitDateInput(key, field, isLiveTyping) {
    const ctx = getDateRangeCtx(key);
    const { picker } = ctx;
    const input = field === 'start' ? ctx.fromInput : ctx.toInput;
    const raw = input.value.trim();

    if (!raw) {
      picker[field] = null;
      picker.hover = null;
      setDateInputError(key, '');
      ctx.render();
      return false;
    }

    if (raw.length < 10) {
      if (isLiveTyping) return false;
      setDateInputError(key, 'Enter the full date as DD/MM/YYYY (e.g. 12/04/2017).');
      return false;
    }

    const date = parseInputDate(raw);
    if (!date) {
      setDateInputError(key, `That ${field === 'start' ? 'From' : 'To'} date doesn't exist. Use DD/MM/YYYY.`);
      return false;
    }

    picker[field] = date;
    // Keep the range reading low → high even if the dates are typed out of order.
    if (picker.start && picker.end && picker.end < picker.start) {
      const earlier = picker.end;
      picker.end = picker.start;
      picker.start = earlier;
    }
    picker.hover = null;
    picker.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
    setDateInputError(key, '');
    closeCalJump(key);
    ctx.render();
    return true;
  }

  function setActiveDateField(key, field, { silent = false } = {}) {
    const ctx = getDateRangeCtx(key);
    ctx.picker.activeField = field;
    ctx.fromField?.classList.toggle('is-active', field === 'start');
    ctx.toField?.classList.toggle('is-active', field === 'end');
    if (!silent) updateRangeFooterText(key);
  }

  function setDateInputError(key, message) {
    const ctx = getDateRangeCtx(key);
    if (!ctx.errorEl) return;
    ctx.errorEl.textContent = message || '';
    ctx.errorEl.hidden = !message;
    ctx.fromField?.classList.toggle('has-error', Boolean(message) && ctx.picker.activeField === 'start');
    ctx.toField?.classList.toggle('has-error', Boolean(message) && ctx.picker.activeField === 'end');
  }

  function syncDateInputs(key) {
    const ctx = getDateRangeCtx(key);
    // Never clobber what the user is mid-way through typing.
    if (ctx.fromInput && document.activeElement !== ctx.fromInput) {
      ctx.fromInput.value = formatInputDate(ctx.picker.start);
    }
    if (ctx.toInput && document.activeElement !== ctx.toInput) {
      ctx.toInput.value = formatInputDate(ctx.picker.end);
    }
  }

  function updateRangeFooterText(key) {
    const { picker, rangeTextEl } = getDateRangeCtx(key);
    if (!rangeTextEl) return;

    if (picker.start && picker.end) {
      const days = Math.round((picker.end - picker.start) / 86400000) + 1;
      rangeTextEl.textContent = `${formatDisplayDate(picker.start)} → ${formatDisplayDate(picker.end)} (${days} day${days === 1 ? '' : 's'})`;
      return;
    }
    if (picker.start) {
      rangeTextEl.textContent = `${formatDisplayDate(picker.start)} → select or type end date`;
      return;
    }
    if (picker.end) {
      rangeTextEl.textContent = `Select or type start date → ${formatDisplayDate(picker.end)}`;
      return;
    }
    rangeTextEl.textContent = picker.activeField === 'end' ? 'Select end date' : 'Select start date';
  }

  function selectRangeDate(key, date) {
    const ctx = getDateRangeCtx(key);
    const { picker } = ctx;
    setDateInputError(key, '');

    if (picker.activeField === 'end' && picker.start) {
      if (date < picker.start) {
        picker.end = picker.start;
        picker.start = date;
      } else {
        picker.end = date;
      }
      picker.hover = null;
      // Range complete, so the next grid click starts a fresh selection.
      setActiveDateField(key, 'start', { silent: true });
    } else {
      picker.start = date;
      if (picker.end && picker.end < date) picker.end = null;
      setActiveDateField(key, 'end', { silent: true });
    }

    ctx.render();
  }

  // Presets fill both ends at once, so the next grid click starts a new range.
  function resetRangeEntryState(key) {
    const { picker } = getDateRangeCtx(key);
    picker.hover = null;
    setDateInputError(key, '');
    setActiveDateField(key, 'start', { silent: true });
  }

  function clearRangeInputs(key) {
    const ctx = getDateRangeCtx(key);
    if (ctx.fromInput) ctx.fromInput.value = '';
    if (ctx.toInput) ctx.toInput.value = '';
    setDateInputError(key, '');
    setActiveDateField(key, 'start', { silent: true });
  }

  // Flushes pending typed text before a filter is applied. Returns false when
  // the typed value is invalid so the caller can abort and keep the picker open.
  function commitPendingRangeInputs(key) {
    const ctx = getDateRangeCtx(key);
    if (ctx.fromInput?.value.trim() && !commitDateInput(key, 'start', false)) return false;
    if (ctx.toInput?.value.trim() && !commitDateInput(key, 'end', false)) return false;
    if (!ctx.picker.start && ctx.picker.end) {
      setDateInputError(key, 'Add a From date, or clear the To date.');
      return false;
    }
    return true;
  }

  function selectDatePreset(preset) {
    selectPresetFor('fixtures', preset);
  }

  function selectCalendarDate(date) {
    selectRangeDate('fixtures', date);
  }

  function renderCalendar() {
    renderCalendarFor('fixtures');
  }

  function updateDatePickerText() {
    updateRangeFooterText('fixtures');
  }

  function updateHoverStyles() {
    updateHoverStylesFor('fixtures');
  }

  function applyDatePicker() {
    closeCalJump('fixtures');
    // Flush anything still sitting in the typed inputs before applying.
    if (!commitPendingRangeInputs('fixtures')) return;

    state.filters.dateFrom = cloneDate(state.datePicker.start);
    state.filters.dateTo = cloneDate(state.datePicker.end || state.datePicker.start);
    dom.datePickerPopup.classList.remove('open');
    state.hasSearched = true;
    state.pagination.fixturesPage = 1;
    syncFilterLabels();
    renderFixturesTable();
  }

  function clearDateRange() {
    closeCalJump('fixtures');
    state.filters.dateFrom = null;
    state.filters.dateTo = null;
    state.datePicker.start = null;
    state.datePicker.end = null;
    state.datePicker.hover = null;
    clearRangeInputs('fixtures');
    dom.datePickerPopup.classList.remove('open');
    state.pagination.fixturesPage = 1;
    if (!hasActiveFilters()) state.hasSearched = false;
    syncFilterLabels();
    renderCalendar();
    renderFixturesTable();
  }

  function toggleSelectAll(checked) {
    const visibleFixtures = getPaginatedItems(getFilteredFixtures(), state.pagination.fixturesPage).pageItems;
    visibleFixtures.forEach((fixture) => {
      if (checked) state.selectedFixtureIds.add(fixture.id);
      else state.selectedFixtureIds.delete(fixture.id);
    });
    renderFixturesTable();
  }

  function clearSelection() {
    state.selectedFixtureIds.clear();
    renderFixturesTable();
  }

  function syncSelectAllState() {
    const visibleFixtures = getPaginatedItems(getFilteredFixtures(), state.pagination.fixturesPage).pageItems;
    const selectedVisibleCount = visibleFixtures.filter((fixture) => state.selectedFixtureIds.has(fixture.id)).length;
    dom.selectAll.checked = visibleFixtures.length > 0 && selectedVisibleCount === visibleFixtures.length;
    dom.selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleFixtures.length;
    dom.selectAll.disabled = visibleFixtures.length === 0;
  }

  function requestSingleImportConfirmation(fixtureId) {
    const fixture = fixturesById.get(fixtureId);
    if (!fixture) return;

    state.currentImport = fixture;
    dom.importConfirmMessage.textContent = getImportConfirmationMessage(1);
    dom.importFixtureSummary.textContent = fixture.name;
    openModal(dom.importModal);
  }

  function getImportConfirmationMessage(count) {
    const noun = count === 1 ? 'fixture' : 'fixtures';
    return `Are you sure you want to import the selected ${noun}?`;
  }

  function closeImportModal() {
    closeModal(dom.importModal);
    state.currentImport = null;
    dom.importFixtureSummary.textContent = '';
  }

  function confirmImport() {
    if (!state.currentImport) return;

    actions.confirmSingleImport?.({
      fixture: state.currentImport,
      title: state.currentImport.name,
      titles: [state.currentImport.name],
      data,
      state
    });
    closeImportModal();
  }

  function requestBulkImportConfirmationFromSelection() {
    state.bulkImportFixtures = importableFixtures.filter((fixture) => state.selectedFixtureIds.has(fixture.id));
    if (!state.bulkImportFixtures.length) {
      notify('No fixtures selected.');
      return;
    }

    dom.bulkConfirmMessage.textContent = getImportConfirmationMessage(state.bulkImportFixtures.length);
    dom.bulkFixtureList.innerHTML = state.bulkImportFixtures.map((fixture) => `
      <div class="bulk-fixture-item"><strong>${escapeHtml(fixture.name)}</strong> <span class="badge badge-gray">${escapeHtml(fixture.sportType)}</span> <span>${escapeHtml(fixture.date)}</span></div>
    `).join('');
    openModal(dom.bulkImportModal);
  }

  function closeBulkImportModal() {
    closeModal(dom.bulkImportModal);
    state.bulkImportFixtures = [];
    dom.bulkFixtureList.innerHTML = '';
  }

  function confirmBulkImport() {
    if (!state.bulkImportFixtures.length) return;

    actions.confirmBulkImport?.({
      fixtures: state.bulkImportFixtures,
      titles: state.bulkImportFixtures.map((fixture) => fixture.name),
      data,
      state
    });

    state.selectedFixtureIds.clear();
    renderFixturesTable();
    closeBulkImportModal();
  }

  // Legacy import modals are kept in markup for now, but import actions now use direct confirmation.

  function openGroupModal(groupId) {
    state.currentGroupId = groupId;
    const group = fixtureGroups[groupId];
    if (!group) return;

    dom.groupModalTitle.textContent = group.name;
    dom.groupModalSubtitle.textContent = `${group.sport} · ${group.organiser}`;
    dom.groupDetailsGrid.innerHTML = buildGroupDetailsHtml(group);
    dom.groupFixturesList.innerHTML = buildGroupFixturesHtml(group.fixtures || []);
    openModal(dom.groupModal);
  }

  function closeGroupModal() {
    closeModal(dom.groupModal);
    state.currentGroupId = null;
  }

  function importAllFromGroup() {
    if (!state.currentGroupId) return;

    const groupFixtures = importableFixtures.filter((fixture) => fixture.groupId === state.currentGroupId);
    if (!groupFixtures.length) {
      notify('All fixtures in this group have already been imported.');
      return;
    }

    groupFixtures.forEach((fixture) => state.selectedFixtureIds.add(fixture.id));
    closeGroupModal();
    renderFixturesTable();
    requestBulkImportConfirmationFromSelection();
  }

  function openImportedFixtureModal(importedIndex) {
    const item = recentlyImported[importedIndex];
    if (!item) return;
    state.currentImportedFixture = item;

    const groupId = item.groupId || normalizeGroupKey(item.groupName, fixtureGroups);
    const group = fixtureGroups[groupId];

    const importStatus = item.importStatus || 'Processed';
    const canShowTitleId = importStatus === 'Processed' && item.titleId;
    dom.impFixtureTitle.textContent = item.name;
    dom.impFixtureDetails.innerHTML = [
      detailCell('Fixture Name', item.name),
      detailCell('Sport Type', item.sport),
      detailCell('Venue', item.venue),
      detailCell('Import Date', item.importDate),
      detailCell('RightsLogic Title ID', canShowTitleId ? `<span class="fixture-id" title="${escapeHtml(item.titleId)}" data-copy-value="${escapeHtml(item.titleId)}">${escapeHtml(item.titleId.slice(0, 7))}</span>` : 'Not available until processed', canShowTitleId),
      detailCell('Imported By', item.importedBy)
    ].join('');

    dom.impGroupDetails.innerHTML = group ? buildImportedGroupDetailsHtml(group) : '<p class="empty-state">Group details not available.</p>';
    dom.impGroupFixturesList.innerHTML = group ? buildGroupFixturesHtml(group.fixtures || [], item.name) : '<p class="empty-state">No fixtures data available.</p>';
    openModal(dom.importedFixtureModal);
  }

  function closeImportedFixtureModal() {
    closeModal(dom.importedFixtureModal);
    state.currentImportedFixture = null;
  }

  function openActivityDetailsModal(entry) {
    state.currentActivityEntry = entry;
    const groupName = fixtureGroups[entry.groupId]?.name || entry.groupName || 'Unknown Group';
    dom.activityDetailsTitle.textContent = entry.fixture;
    dom.activityDetailsSubtitle.textContent = `${entry.action} · ${entry.timestamp}`;
    dom.activityDetailsGrid.innerHTML = [
      detailCell('Fixture Group', groupName),
      detailCell('Action', entry.action),
      detailCell('Status', entry.status),
      detailCell('Updated By', entry.updatedBy || entry.user),
      detailCell('Source', entry.source || 'Manual'),
      detailCell('Timestamp', entry.timestamp)
    ].join('');

    dom.activityAuditBlock.innerHTML = `
      <div class="group-detail-item" style="margin-bottom:10px;">
        <span class="group-detail-label">Change Type</span>
        <span class="group-detail-value">${escapeHtml(entry.detailType || 'N/A')}</span>
      </div>
      <div class="group-detail-item" style="margin-bottom:10px;">
        <span class="group-detail-label">Old Value</span>
        <span class="group-detail-value">${escapeHtml(entry.oldValue || 'N/A')}</span>
      </div>
      <div class="group-detail-item">
        <span class="group-detail-label">New Value</span>
        <span class="group-detail-value">${escapeHtml(entry.newValue || 'N/A')}</span>
      </div>
    `;

    openModal(dom.activityDetailsModal);
  }

  function closeActivityDetailsModal() {
    closeModal(dom.activityDetailsModal);
    state.currentActivityEntry = null;
  }

  function buildGroupDetailsHtml(group) {
    return [
      detailCell('Sport', group.sport),
      detailCell('Season', group.season),
      detailCell('Start Date', group.startDate),
      detailCell('End Date', group.endDate),
      detailCell('Organiser', group.organiser),
      detailCell('Total Fixtures', group.totalFixtures),
      group.venue ? detailCell('Venue', group.venue, false, 'grid-column:1/-1') : ''
    ].join('');
  }

  function buildImportedGroupDetailsHtml(group) {
    return [
      detailCell('Group Name', group.name),
      detailCell('Organiser', group.organiser),
      detailCell('Season', group.season),
      detailCell('Period', `${group.startDate} – ${group.endDate}`),
      group.venue ? detailCell('Venue', group.venue, false, 'grid-column:1/-1') : ''
    ].join('');
  }

  function buildGroupFixturesHtml(fixtures, currentName = '') {
    if (!fixtures.length) return '<p class="empty-state">No fixtures loaded for this group.</p>';

    return fixtures.map((fixture) => {
      const isImported = fixture.status === 'Imported';
      const isCurrent = fixture.name === currentName;
      const statusClass = isImported ? 'badge-green' : 'badge-indigo';
      return `
        <div class="group-fixture-row${isImported ? ' imported' : ''}${isCurrent ? ' current-fixture' : ''}">
          <div class="group-fixture-name"><strong>${escapeHtml(fixture.name)}</strong>${isCurrent ? ' <span class="badge badge-blue" style="font-size:9px;padding:2px 8px;">Current</span>' : ''}</div>
          <div class="group-fixture-meta">${escapeHtml(fixture.date)} · ${escapeHtml(fixture.venue)}</div>
          <div class="group-fixture-status"><span class="badge ${statusClass}">${escapeHtml(fixture.status)}</span></div>
        </div>
      `;
    }).join('');
  }

  function buildSubscriptionFixturesHtml(fixtures) {
    if (!fixtures.length) return '<p class="empty-state">No imported fixtures in this record.</p>';

    const highlightName = String(state.highlightedFixtureName || '').toLowerCase();
    return fixtures.map((fixture) => {
      const isHighlighted = highlightName && String(fixture.name || '').toLowerCase() === highlightName;
      return `
      <div class="group-fixture-row imported-subscription-fixture${isHighlighted ? ' highlighted-fixture' : ''}"${isHighlighted ? ' data-highlighted="true"' : ''}>
        <div class="group-fixture-name">
          <strong>${escapeHtml(fixture.name)}</strong>
          <div class="group-fixture-meta">${escapeHtml(fixture.type)} · Imported ${escapeHtml(fixture.importedOn)}${fixture.importedBy ? ` by ${escapeHtml(fixture.importedBy)}` : ''}</div>
        </div>
        <div class="group-fixture-meta">Title ID: <span class="fixture-id" title="${escapeHtml(fixture.titleId)}" data-copy-value="${escapeHtml(fixture.titleId)}">${escapeHtml(fixture.titleId)}</span></div>
        <div class="group-fixture-status"><span class="badge badge-green">${escapeHtml(fixture.status)}</span></div>
      </div>
    `;
    }).join('');
  }

  function detailCell(label, value, rawValue = false, style = '') {
    return `
      <div class="group-detail-item"${style ? ` style="${style}"` : ''}>
        <span class="group-detail-label">${escapeHtml(label)}</span>
        <span class="group-detail-value">${rawValue ? value : escapeHtml(value)}</span>
      </div>
    `;
  }

  function switchPage(index) {
    state.activePage = index;
    dom.navItems.forEach((item) => item.classList.toggle('active', Number(item.dataset.pageIndex) === index));
    dom.pages.forEach((page) => page.classList.toggle('active', Number(page.dataset.pageIndex) === index));
  }

  function toggleTheme() {
    document.body.classList.toggle('dark');
    updateThemeToggle();
  }

  function updateThemeToggle() {
    const isDark = document.body.classList.contains('dark');
    dom.themeToggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  async function copyTextToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // Fall back below.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch (_) {
      return false;
    }
  }

  function ensureCopyToast() {
    if (copyToastEl) return copyToastEl;
    copyToastEl = document.createElement('div');
    copyToastEl.className = 'copy-toast';
    copyToastEl.setAttribute('role', 'status');
    copyToastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(copyToastEl);
    return copyToastEl;
  }

  function showCopyToast(message, success) {
    const toast = ensureCopyToast();
    toast.textContent = message;
    toast.classList.remove('success', 'error', 'visible');
    toast.classList.add(success ? 'success' : 'error');
    void toast.offsetWidth;
    toast.classList.add('visible');

    if (copyToastTimer) clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(() => toast.classList.remove('visible'), 1200);
  }

  function showFixtureIdCopyFeedback(element, copied) {
    const originalTitle = element.getAttribute('data-copy-title') || element.getAttribute('title') || '';
    if (!element.getAttribute('data-copy-title')) element.setAttribute('data-copy-title', originalTitle);

    element.classList.remove('copied', 'copy-failed');
    element.classList.add(copied ? 'copied' : 'copy-failed');
    element.setAttribute('title', copied ? 'Copied!' : 'Copy failed');

    if (element.__copyResetTimer) clearTimeout(element.__copyResetTimer);
    element.__copyResetTimer = setTimeout(() => {
      element.classList.remove('copied', 'copy-failed');
      element.setAttribute('title', element.getAttribute('data-copy-title') || '');
      element.__copyResetTimer = null;
    }, 1100);
  }

  return { init };
}
