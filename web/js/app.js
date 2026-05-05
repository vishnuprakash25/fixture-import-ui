function switchPage(index) {
  document.querySelectorAll('.nav-item').forEach((item, i) => item.classList.toggle('active', i === index));
  document.querySelectorAll('.page').forEach((page, i) => page.classList.toggle('active', i === index));
}

function refreshData() {
  alert('Refreshing fixture data from Fixture Manager API…');
}

function viewFixture(id) {
  alert('Opening fixture details for ID: ' + id);
}

function performSearch() {
  alert('Searching for: ' + document.querySelector('.search-input').value);
}

function searchFixtures(q) {
  console.log('Searching:', q);
}

function filterByType(t) {
  console.log('Filter type:', t);
}

function filterByDate(d) {
  console.log('Filter date:', d);
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.fixture-checkbox').forEach(c => c.checked = cb.checked);
}

function importSelected() {
  alert('Importing ' + document.querySelectorAll('.fixture-checkbox:checked').length + ' fixtures…');
}

function clearSelection() {
  document.querySelectorAll('.fixture-checkbox').forEach(c => c.checked = false);
  document.getElementById('selectAll').checked = false;
}

function importSingle(id) {
  alert('Importing fixture ' + id + '…\n\n1. Fetch from Fixture Manager\n2. Transform to RightsLogic format\n3. Create Title/Programme');
}

function addSubscription() {
  alert('Opening subscription dialog…');
}

function showActivity(f) {
  alert('Activity log for: ' + f);
}

function editSubscription(f) {
  alert('Settings for: ' + f);
}

function unsubscribe(f) {
  if (confirm('Unsubscribe from ' + f + '?')) alert('Unsubscribed from ' + f);
}

function viewAll() {
  switchPage(1);
}

function exportLog() {
  alert('Exporting activity log to CSV…');
}

function viewDetails(id) {
  alert('Details for activity #' + id);
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  document.querySelector('.theme-toggle .icon').textContent = isDark ? '🌞' : '🌙';
  document.querySelector('.theme-toggle span:not(.icon)').textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

