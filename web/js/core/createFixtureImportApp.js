import {
  buildFixtureTitle,
  cloneDate,
  escapeHtml,
  filterFixtures,
  formatDisplayDate,
  getGroupOptions,
  normalizeGroupKey,
  toYYYYMMDD
} from './helpers.js';

export function createFixtureImportApp({ data, actions = {} }) {
  const notify = actions.notify || ((message) => window.alert(message));
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
    datePicker: {
      viewDate: new Date(),
      start: null,
      end: null,
      hover: null
    }
  };

  const dom = {};
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  let copyToastEl = null;
  let copyToastTimer = null;

  function init() {
    cacheDom();
    bindEvents();
    switchPage(0);
    syncFilterLabels();
    renderAll();
    updateThemeToggle();
  }

  function cacheDom() {
    Object.assign(dom, {
      navItems: Array.from(document.querySelectorAll('.nav-item[data-page-index]')),
      pages: Array.from(document.querySelectorAll('.page[data-page-index]')),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      refreshDataBtn: document.getElementById('refreshDataBtn'),
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
      calMonth1: document.getElementById('calMonth1'),
      calGrid1: document.getElementById('calGrid1'),
      fixturesBody: document.getElementById('fixturesTableBody'),
      selectAll: document.getElementById('selectAll'),
      importSelectedBtn: document.getElementById('importSelectedBtn'),
      clearSelectionBtn: document.getElementById('clearSelectionBtn'),
      subscriptionsBody: document.getElementById('subscriptionsTableBody'),
      addSubscriptionBtn: document.getElementById('addSubscriptionBtn'),
      activityLogBody: document.getElementById('activityLogTableBody'),
      exportLogBtn: document.getElementById('exportLogBtn'),
      importModal: document.getElementById('importModal'),
      importFixtureName: document.getElementById('importFixtureName'),
      titlePreview: document.getElementById('titlePreview'),
      prefixType: document.getElementById('prefixType'),
      prefixCustom: document.getElementById('prefixCustom'),
      prefixSportLabel: document.getElementById('prefixSportLabel'),
      suffixType: document.getElementById('suffixType'),
      suffixCustom: document.getElementById('suffixCustom'),
      suffixDateLabel: document.getElementById('suffixDateLabel'),
      closeImportModalBtn: document.getElementById('closeImportModalBtn'),
      cancelImportBtn: document.getElementById('cancelImportBtn'),
      confirmImportBtn: document.getElementById('confirmImportBtn'),
      bulkImportModal: document.getElementById('bulkImportModal'),
      bulkFixtureList: document.getElementById('bulkFixtureList'),
      bulkTitlePreview: document.getElementById('bulkTitlePreview'),
      bulkPrefixType: document.getElementById('bulkPrefixType'),
      bulkPrefixCustom: document.getElementById('bulkPrefixCustom'),
      bulkPrefixHint: document.getElementById('bulkPrefixHint'),
      bulkSuffixType: document.getElementById('bulkSuffixType'),
      bulkSuffixCustom: document.getElementById('bulkSuffixCustom'),
      bulkSuffixHint: document.getElementById('bulkSuffixHint'),
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
      closeImportedFixtureFooterBtn: document.getElementById('closeImportedFixtureFooterBtn')
    });
  }

  function bindEvents() {
    dom.navItems.forEach((item) => {
      item.addEventListener('click', () => switchPage(Number(item.dataset.pageIndex)));
    });

    dom.themeToggleBtn.addEventListener('click', toggleTheme);
    dom.refreshDataBtn.addEventListener('click', () => actions.refreshData?.({ data, state }));
    dom.viewAllBtn.addEventListener('click', () => switchPage(1));
    dom.addSubscriptionBtn.addEventListener('click', () => actions.addSubscription?.({ data, state }));
    dom.exportLogBtn.addEventListener('click', () => actions.exportLog?.({ data, state }));

    dom.searchInput.addEventListener('input', (event) => {
      state.filters.search = event.target.value;
      renderFixturesTable();
    });
    dom.searchBtn.addEventListener('click', renderFixturesTable);

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
      syncFilterLabels();
      renderSportOptions();
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
      syncFilterLabels();
      renderGroupOptions();
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
    document.getElementById('clearDatePickerBtn').addEventListener('click', clearDateRange);
    document.getElementById('applyDatePickerBtn').addEventListener('click', applyDatePicker);
    dom.calGrid1.addEventListener('click', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      selectCalendarDate(new Date(cell.dataset.date));
    });
    dom.calGrid1.addEventListener('mouseover', (event) => {
      const cell = event.target.closest('.cal-day');
      if (!cell) return;
      state.datePicker.hover = new Date(cell.dataset.date);
      updateHoverStyles();
    });

    dom.selectAll.addEventListener('change', (event) => toggleSelectAll(event.target.checked));
    dom.importSelectedBtn.addEventListener('click', openBulkImportModalFromSelection);
    dom.clearSelectionBtn.addEventListener('click', clearSelection);

    dom.fixturesBody.addEventListener('change', (event) => {
      if (!event.target.matches('.fixture-checkbox')) return;
      const fixtureId = event.target.dataset.fixtureId;
      if (event.target.checked) state.selectedFixtureIds.add(fixtureId);
      else state.selectedFixtureIds.delete(fixtureId);
      syncSelectAllState();
    });
    dom.fixturesBody.addEventListener('click', handleFixturesTableClick);
    dom.recentlyImportedBody.addEventListener('click', handleRecentlyImportedClick);
    dom.subscriptionsBody.addEventListener('click', handleSubscriptionClick);
    dom.activityLogBody.addEventListener('click', handleActivityLogClick);

    dom.prefixType.addEventListener('change', () => {
      updateSingleImportInputs();
      updateTitlePreview();
    });
    dom.prefixCustom.addEventListener('input', updateTitlePreview);
    dom.suffixType.addEventListener('change', () => {
      updateSingleImportInputs();
      updateTitlePreview();
    });
    dom.suffixCustom.addEventListener('input', updateTitlePreview);
    dom.closeImportModalBtn.addEventListener('click', closeImportModal);
    dom.cancelImportBtn.addEventListener('click', closeImportModal);
    dom.confirmImportBtn.addEventListener('click', confirmImport);

    dom.bulkPrefixType.addEventListener('change', () => {
      updateBulkImportInputs();
      updateBulkTitlePreview();
    });
    dom.bulkPrefixCustom.addEventListener('input', updateBulkTitlePreview);
    dom.bulkSuffixType.addEventListener('change', () => {
      updateBulkImportInputs();
      updateBulkTitlePreview();
    });
    dom.bulkSuffixCustom.addEventListener('input', updateBulkTitlePreview);
    dom.closeBulkImportModalBtn.addEventListener('click', closeBulkImportModal);
    dom.cancelBulkImportBtn.addEventListener('click', closeBulkImportModal);
    dom.confirmBulkImportBtn.addEventListener('click', confirmBulkImport);

    dom.closeGroupModalBtn.addEventListener('click', closeGroupModal);
    dom.closeGroupModalFooterBtn.addEventListener('click', closeGroupModal);
    dom.importAllFromGroupBtn.addEventListener('click', importAllFromGroup);

    dom.closeImportedFixtureModalBtn.addEventListener('click', closeImportedFixtureModal);
    dom.closeImportedFixtureFooterBtn.addEventListener('click', closeImportedFixtureModal);

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('click', handleFixtureIdCopyClick);
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (event) => {
        if (event.target !== overlay) return;
        if (overlay === dom.importModal) closeImportModal();
        if (overlay === dom.bulkImportModal) closeBulkImportModal();
        if (overlay === dom.groupModal) closeGroupModal();
        if (overlay === dom.importedFixtureModal) closeImportedFixtureModal();
      });
    });
  }

  function handleDocumentClick(event) {
    const target = event.target;

    if (!dom.sportTypeMultiselect.contains(target)) dom.sportDropdown.classList.remove('open');
    if (!document.getElementById('fixtureGroupMultiselect').contains(target)) dom.groupDropdown.classList.remove('open');
    if (!dom.dateRangeWrapper.contains(target)) dom.datePickerPopup.classList.remove('open');
  }

  function handleFixturesTableClick(event) {
    const importButton = event.target.closest('[data-action="open-import"]');
    if (importButton) {
      openImportModal(importButton.dataset.fixtureId);
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
    const subscription = subscriptions[Number(button.dataset.subscriptionIndex)];
    if (!subscription) return;

    if (button.dataset.action === 'show-activity') actions.showActivity?.(subscription);
    if (button.dataset.action === 'edit-subscription') actions.editSubscription?.(subscription);
    if (button.dataset.action === 'remove-subscription') actions.unsubscribe?.(subscription);
  }

  function handleActivityLogClick(event) {
    const link = event.target.closest('[data-action="view-activity-details"]');
    if (!link) return;
    event.preventDefault();
    const entry = activityLog[Number(link.dataset.activityIndex)];
    if (!entry) return;
    actions.viewActivityDetails?.(entry);
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
    renderFixturesTable();
    renderSubscriptions();
    renderActivityLog();
    renderCalendar();
  }

  function renderStats() {
    dom.dashboardStats.innerHTML = data.dashboardStats.map((stat) => `
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon ${escapeHtml(stat.iconClass)}">${escapeHtml(stat.icon)}</div>
          <span class="stat-trend ${escapeHtml(stat.trendDirection)}">${escapeHtml(stat.trend)}</span>
        </div>
        <div class="stat-value">${escapeHtml(stat.value)}</div>
        <div class="stat-label">${escapeHtml(stat.label)}</div>
      </div>
    `).join('');
  }

  function renderRecentlyImported() {
    dom.recentlyImportedBody.innerHTML = recentlyImported.map((item, index) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td><span class="badge badge-gray">${escapeHtml(fixtureGroups[item.groupId]?.name || item.groupId)}</span></td>
        <td>${escapeHtml(item.sport)}</td>
        <td>${escapeHtml(item.importDate)}</td>
        <td class="fixture-id" title="${escapeHtml(item.titleId)}" data-copy-value="${escapeHtml(item.titleId)}">${escapeHtml(item.titleId)}</td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-action="view-imported" data-imported-index="${index}">View</button></td>
      </tr>
    `).join('');
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

  function getFilteredFixtures() {
    return filterFixtures(importableFixtures, state.filters, fixtureGroups);
  }

  function renderFixturesTable() {
    const fixtures = getFilteredFixtures();

    dom.fixturesBody.innerHTML = fixtures.length ? fixtures.map((fixture) => `
      <tr>
        <td><input type="checkbox" class="checkbox fixture-checkbox" data-fixture-id="${escapeHtml(fixture.id)}" ${state.selectedFixtureIds.has(fixture.id) ? 'checked' : ''}></td>
        <td><strong>${escapeHtml(fixture.name)}</strong></td>
        <td><span class="badge badge-gray fixture-group-link" data-action="open-group" data-group-id="${escapeHtml(fixture.groupId)}">${escapeHtml(fixtureGroups[fixture.groupId]?.name || fixture.groupId)}</span></td>
        <td>${escapeHtml(fixture.sportType)}</td>
        <td>${escapeHtml(fixture.date)}</td>
        <td>${escapeHtml(fixture.venue)}</td>
        <td class="fixture-id" title="${escapeHtml(fixture.id)}" data-copy-value="${escapeHtml(fixture.id)}">${escapeHtml(fixture.shortId)}</td>
        <td><span class="badge ${fixture.status === 'Imported' ? 'badge-green' : 'badge-indigo'}">${escapeHtml(fixture.status)}</span></td>
        <td><button type="button" class="btn btn-primary btn-sm" data-action="open-import" data-fixture-id="${escapeHtml(fixture.id)}">Import</button></td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="9"><div class="empty-state">No fixtures match the current filters.</div></td>
      </tr>
    `;

    syncSelectAllState();
  }

  function renderSubscriptions() {
    dom.subscriptionsBody.innerHTML = subscriptions.map((subscription, index) => {
      const autoImportClass = subscription.autoImport === 'Enabled' ? 'badge-green' : 'badge-gray';
      return `
        <tr>
          <td><strong>${escapeHtml(subscription.fixture)}</strong></td>
          <td>${escapeHtml(subscription.type)}</td>
          <td>${escapeHtml(subscription.subscribed)}</td>
          <td><span class="badge ${autoImportClass}">${escapeHtml(subscription.autoImport)}</span></td>
          <td><a href="#" class="link" data-action="show-activity" data-subscription-index="${index}">${escapeHtml(subscription.activityLabel)}</a></td>
          <td>
            <div style="display:flex;gap:6px">
              <button type="button" class="btn btn-ghost btn-sm" data-action="edit-subscription" data-subscription-index="${index}">⚙ Settings</button>
              <button type="button" class="btn btn-danger btn-sm" data-action="remove-subscription" data-subscription-index="${index}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderActivityLog() {
    dom.activityLogBody.innerHTML = activityLog.map((entry, index) => `
      <tr>
        <td>${escapeHtml(entry.timestamp)}</td>
        <td><span class="badge ${escapeHtml(entry.actionBadge)}">${escapeHtml(entry.action)}</span></td>
        <td>${escapeHtml(entry.fixture)}</td>
        <td>${escapeHtml(entry.user)}</td>
        <td><span class="badge ${escapeHtml(entry.statusBadge)}">${escapeHtml(entry.status)}</span></td>
        <td><a href="#" class="link" data-action="view-activity-details" data-activity-index="${index}">Details</a></td>
      </tr>
    `).join('');
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
      dom.dateRangeText.textContent = 'Select start date';
    } else if (!state.filters.dateTo) {
      dom.dateRangeLabel.textContent = formatDisplayDate(state.filters.dateFrom);
      dom.dateClearBtn.style.display = '';
      dom.dateRangeText.textContent = `${formatDisplayDate(state.datePicker.start)} → select end date`;
    } else {
      dom.dateRangeLabel.textContent = `${formatDisplayDate(state.filters.dateFrom)} – ${formatDisplayDate(state.filters.dateTo)}`;
      dom.dateClearBtn.style.display = '';
      dom.dateRangeText.textContent = `${formatDisplayDate(state.datePicker.start)} → ${formatDisplayDate(state.datePicker.end)}`;
    }
  }

  function clearSportFilter() {
    state.filters.sports.clear();
    state.optionSearch.sport = '';
    dom.sportOptionsSearch.value = '';
    syncFilterLabels();
    renderSportOptions();
    renderFixturesTable();
  }

  function clearGroupFilter() {
    state.filters.groups.clear();
    state.optionSearch.group = '';
    dom.groupOptionsSearch.value = '';
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

  function toggleDatePicker() {
    toggleDropdown(dom.datePickerPopup);
    if (dom.datePickerPopup.classList.contains('open')) renderCalendar();
  }

  function changeMonth(direction) {
    state.datePicker.viewDate.setMonth(state.datePicker.viewDate.getMonth() + direction);
    renderCalendar();
  }

  function selectDatePreset(preset) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (preset === 'today') {
      state.datePicker.start = new Date(now);
      state.datePicker.end = new Date(now);
    } else if (preset === 'week') {
      const dayOfWeek = now.getDay();
      state.datePicker.start = new Date(now);
      state.datePicker.start.setDate(now.getDate() - dayOfWeek);
      state.datePicker.end = new Date(state.datePicker.start);
      state.datePicker.end.setDate(state.datePicker.start.getDate() + 6);
    } else if (preset === 'month') {
      state.datePicker.start = new Date(now.getFullYear(), now.getMonth(), 1);
      state.datePicker.end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'quarter') {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      state.datePicker.start = new Date(now.getFullYear(), qStart, 1);
      state.datePicker.end = new Date(now.getFullYear(), qStart + 3, 0);
    }

    state.datePicker.viewDate = new Date(state.datePicker.start);
    renderCalendar();
  }

  function selectCalendarDate(date) {
    if (!state.datePicker.start || state.datePicker.end) {
      state.datePicker.start = date;
      state.datePicker.end = null;
    } else if (date.toDateString() === state.datePicker.start.toDateString()) {
      state.datePicker.end = date;
    } else if (date < state.datePicker.start) {
      state.datePicker.end = state.datePicker.start;
      state.datePicker.start = date;
    } else {
      state.datePicker.end = date;
    }

    renderCalendar();
  }

  function renderCalendar() {
    const viewDate = state.datePicker.viewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    dom.calMonth1.textContent = `${MONTHS[month]} ${year}`;

    let html = '<div class="cal-row cal-header">';
    DAYS.forEach((day) => { html += `<div class="cal-cell cal-day-name">${day}</div>`; });
    html += '</div>';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let day = 1;
    for (let week = 0; week < 6; week++) {
      if (day > daysInMonth) break;
      html += '<div class="cal-row">';
      for (let weekday = 0; weekday < 7; weekday++) {
        if ((week === 0 && weekday < firstDay) || day > daysInMonth) {
          html += '<div class="cal-cell"></div>';
          continue;
        }

        const date = new Date(year, month, day);
        const dateKey = date.toDateString();
        let classes = 'cal-cell cal-day';

        if (state.datePicker.start && dateKey === state.datePicker.start.toDateString()) classes += ' cal-start';
        if (state.datePicker.end && dateKey === state.datePicker.end.toDateString()) classes += ' cal-end';
        if (state.datePicker.start && state.datePicker.end && date > state.datePicker.start && date < state.datePicker.end) classes += ' cal-in-range';
        if (date.getTime() === today.getTime()) classes += ' cal-today';

        html += `<div class="${classes}" data-date="${escapeHtml(date.toDateString())}">${day}</div>`;
        day++;
      }
      html += '</div>';
    }

    dom.calGrid1.innerHTML = html;
    updateDatePickerText();
    updateHoverStyles();
  }

  function updateDatePickerText() {
    if (!state.datePicker.start) {
      dom.dateRangeText.textContent = 'Select start date';
      return;
    }
    if (!state.datePicker.end) {
      dom.dateRangeText.textContent = `${formatDisplayDate(state.datePicker.start)} → select end date`;
      return;
    }
    dom.dateRangeText.textContent = `${formatDisplayDate(state.datePicker.start)} → ${formatDisplayDate(state.datePicker.end)}`;
  }

  function updateHoverStyles() {
    if (!state.datePicker.start || state.datePicker.end || !state.datePicker.hover) return;

    dom.calGrid1.querySelectorAll('.cal-day').forEach((cell) => {
      cell.classList.remove('cal-hover-range');
      const date = new Date(cell.dataset.date);
      if ((date > state.datePicker.start && date <= state.datePicker.hover) || (date < state.datePicker.start && date >= state.datePicker.hover)) {
        cell.classList.add('cal-hover-range');
      }
    });
  }

  function applyDatePicker() {
    state.filters.dateFrom = cloneDate(state.datePicker.start);
    state.filters.dateTo = cloneDate(state.datePicker.end || state.datePicker.start);
    dom.datePickerPopup.classList.remove('open');
    syncFilterLabels();
    renderFixturesTable();
  }

  function clearDateRange() {
    state.filters.dateFrom = null;
    state.filters.dateTo = null;
    state.datePicker.start = null;
    state.datePicker.end = null;
    state.datePicker.hover = null;
    dom.datePickerPopup.classList.remove('open');
    syncFilterLabels();
    renderCalendar();
    renderFixturesTable();
  }

  function toggleSelectAll(checked) {
    getFilteredFixtures().forEach((fixture) => {
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
    const visibleFixtures = getFilteredFixtures();
    const selectedVisibleCount = visibleFixtures.filter((fixture) => state.selectedFixtureIds.has(fixture.id)).length;
    dom.selectAll.checked = visibleFixtures.length > 0 && selectedVisibleCount === visibleFixtures.length;
    dom.selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleFixtures.length;
  }

  function openImportModal(fixtureId) {
    const fixture = fixturesById.get(fixtureId);
    if (!fixture) return;

    state.currentImport = fixture;
    dom.importFixtureName.value = fixture.name;
    dom.prefixType.value = 'sport';
    dom.suffixType.value = 'date';
    dom.prefixCustom.value = '';
    dom.suffixCustom.value = '';
    updateSingleImportInputs();
    updateTitlePreview();
    dom.importModal.classList.add('visible');
  }

  function closeImportModal() {
    dom.importModal.classList.remove('visible');
    state.currentImport = null;
  }

  function updateSingleImportInputs() {
    const fixture = state.currentImport;
    if (!fixture) return;

    const prefixIsCustom = dom.prefixType.value === 'custom';
    const suffixIsCustom = dom.suffixType.value === 'custom';

    dom.prefixCustom.style.display = prefixIsCustom ? '' : 'none';
    dom.prefixSportLabel.style.display = prefixIsCustom ? 'none' : '';
    dom.prefixSportLabel.textContent = `→ ${fixture.sportType}`;

    dom.suffixCustom.style.display = suffixIsCustom ? '' : 'none';
    dom.suffixDateLabel.style.display = suffixIsCustom ? 'none' : '';
    dom.suffixDateLabel.textContent = `→ ${toYYYYMMDD(fixture.date)}`;
  }

  function getSingleImportPrefix() {
    if (!state.currentImport) return '';
    return dom.prefixType.value === 'custom' ? dom.prefixCustom.value.trim() : state.currentImport.sportType;
  }

  function getSingleImportSuffix() {
    if (!state.currentImport) return '';
    return dom.suffixType.value === 'custom' ? dom.suffixCustom.value.trim() : toYYYYMMDD(state.currentImport.date);
  }

  function updateTitlePreview() {
    if (!state.currentImport) return;
    dom.titlePreview.textContent = buildFixtureTitle({
      fixtureName: state.currentImport.name,
      prefix: getSingleImportPrefix(),
      suffix: getSingleImportSuffix()
    }) || '—';
  }

  function confirmImport() {
    if (!state.currentImport) return;

    const prefix = getSingleImportPrefix();
    const suffix = getSingleImportSuffix();

    if (!prefix) {
      notify('Prefix is mandatory. Please select a prefix option.');
      return;
    }
    if (!suffix) {
      notify('Suffix is mandatory. Please enter a suffix value.');
      return;
    }

    const title = buildFixtureTitle({ fixtureName: state.currentImport.name, prefix, suffix });
    actions.confirmSingleImport?.({ fixture: state.currentImport, title, prefix, suffix, data, state });
    closeImportModal();
  }

  function openBulkImportModalFromSelection() {
    state.bulkImportFixtures = importableFixtures.filter((fixture) => state.selectedFixtureIds.has(fixture.id));
    if (!state.bulkImportFixtures.length) {
      notify('No fixtures selected.');
      return;
    }

    dom.bulkFixtureList.innerHTML = state.bulkImportFixtures.map((fixture) => `
      <div class="bulk-fixture-item"><strong>${escapeHtml(fixture.name)}</strong> <span class="badge badge-gray">${escapeHtml(fixture.sportType)}</span> <span>${escapeHtml(fixture.date)}</span></div>
    `).join('');

    dom.bulkPrefixType.value = 'sport';
    dom.bulkSuffixType.value = 'date';
    dom.bulkPrefixCustom.value = '';
    dom.bulkSuffixCustom.value = '';
    updateBulkImportInputs();
    updateBulkTitlePreview();
    dom.bulkImportModal.classList.add('visible');
  }

  function closeBulkImportModal() {
    dom.bulkImportModal.classList.remove('visible');
  }

  function updateBulkImportInputs() {
    const prefixIsCustom = dom.bulkPrefixType.value === 'custom';
    const suffixIsCustom = dom.bulkSuffixType.value === 'custom';

    dom.bulkPrefixCustom.style.display = prefixIsCustom ? '' : 'none';
    dom.bulkSuffixCustom.style.display = suffixIsCustom ? '' : 'none';
    dom.bulkPrefixHint.textContent = prefixIsCustom
      ? 'This custom prefix will be applied to all selected fixtures.'
      : 'Each fixture will use its own Sport Type as prefix.';
    dom.bulkSuffixHint.textContent = suffixIsCustom
      ? 'This custom suffix will be applied to all selected fixtures.'
      : 'Each fixture will use its own Fixture Group Date (yyyyMMdd) as suffix.';
  }

  function updateBulkTitlePreview() {
    if (!state.bulkImportFixtures.length) {
      dom.bulkTitlePreview.textContent = '—';
      return;
    }

    const sample = state.bulkImportFixtures[0];
    const prefix = dom.bulkPrefixType.value === 'custom' ? dom.bulkPrefixCustom.value.trim() : sample.sportType;
    const suffix = dom.bulkSuffixType.value === 'custom' ? dom.bulkSuffixCustom.value.trim() : toYYYYMMDD(sample.date);
    const title = buildFixtureTitle({ fixtureName: sample.name, prefix, suffix });
    dom.bulkTitlePreview.textContent = state.bulkImportFixtures.length === 1 ? title : `${title}  (+ ${state.bulkImportFixtures.length - 1} more)`;
  }

  function confirmBulkImport() {
    const customPrefix = dom.bulkPrefixCustom.value.trim();
    const customSuffix = dom.bulkSuffixCustom.value.trim();

    if (dom.bulkPrefixType.value === 'custom' && !customPrefix) {
      notify('Prefix is mandatory. Please enter a custom prefix.');
      return;
    }
    if (dom.bulkSuffixType.value === 'custom' && !customSuffix) {
      notify('Suffix is mandatory. Please enter a custom suffix.');
      return;
    }

    const titles = state.bulkImportFixtures.map((fixture) => {
      const prefix = dom.bulkPrefixType.value === 'custom' ? customPrefix : fixture.sportType;
      const suffix = dom.bulkSuffixType.value === 'custom' ? customSuffix : toYYYYMMDD(fixture.date);
      return buildFixtureTitle({ fixtureName: fixture.name, prefix, suffix });
    });

    actions.confirmBulkImport?.({ fixtures: state.bulkImportFixtures, titles, data, state });
    closeBulkImportModal();
  }

  function openGroupModal(groupId) {
    state.currentGroupId = groupId;
    const group = fixtureGroups[groupId];
    if (!group) return;

    dom.groupModalTitle.textContent = group.name;
    dom.groupModalSubtitle.textContent = `${group.sport} · ${group.organiser}`;
    dom.groupDetailsGrid.innerHTML = buildGroupDetailsHtml(group);
    dom.groupFixturesList.innerHTML = buildGroupFixturesHtml(group.fixtures || []);
    dom.groupModal.classList.add('visible');
  }

  function closeGroupModal() {
    dom.groupModal.classList.remove('visible');
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
    openBulkImportModalFromSelection();
  }

  function openImportedFixtureModal(importedIndex) {
    const item = recentlyImported[importedIndex];
    if (!item) return;
    state.currentImportedFixture = item;

    const groupId = item.groupId || normalizeGroupKey(item.groupName, fixtureGroups);
    const group = fixtureGroups[groupId];

    dom.impFixtureTitle.textContent = item.name;
    dom.impFixtureDetails.innerHTML = [
      detailCell('Fixture Name', item.name),
      detailCell('Sport Type', item.sport),
      detailCell('Venue', item.venue),
      detailCell('Import Date', item.importDate),
      detailCell('RightsLogic Title ID', `<span class="fixture-id" title="${escapeHtml(item.titleId)}" data-copy-value="${escapeHtml(item.titleId)}">${escapeHtml(item.titleId.slice(0, 7))}</span>`, true),
      detailCell('Imported By', item.importedBy)
    ].join('');

    dom.impGroupDetails.innerHTML = group ? buildImportedGroupDetailsHtml(group) : '<p class="empty-state">Group details not available.</p>';
    dom.impGroupFixturesList.innerHTML = group ? buildGroupFixturesHtml(group.fixtures || [], item.name) : '<p class="empty-state">No fixtures data available.</p>';
    dom.importedFixtureModal.classList.add('visible');
  }

  function closeImportedFixtureModal() {
    dom.importedFixtureModal.classList.remove('visible');
    state.currentImportedFixture = null;
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
    dom.themeToggleBtn.querySelector('.icon').textContent = isDark ? '🌞' : '🌙';
    dom.themeToggleBtn.querySelector('.theme-toggle-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
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

