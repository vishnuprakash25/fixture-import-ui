export function toYYYYMMDD(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function formatDisplayDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function parseFixtureDate(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function buildFixtureTitle({ fixtureName, prefix = '', suffix = '' }) {
  let title = String(fixtureName ?? '').trim();
  const cleanPrefix = String(prefix ?? '').trim();
  const cleanSuffix = String(suffix ?? '').trim();

  if (cleanPrefix) title = `${cleanPrefix} - ${title}`;
  if (cleanSuffix) title = `${title} - ${cleanSuffix}`;
  return title;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

export function normalizeGroupKey(name, fixtureGroups) {
  const normalizedName = String(name ?? '').trim().toLowerCase();
  return Object.entries(fixtureGroups || {}).find(([, group]) => {
    return String(group?.name ?? '').trim().toLowerCase() === normalizedName;
  })?.[0] || '';
}

export function getGroupOptions(fixtureGroups) {
  return Object.entries(fixtureGroups || {})
    .map(([id, group]) => ({ id, label: group.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function filterFixtures(fixtures, filters, fixtureGroups) {
  const search = String(filters?.search ?? '').trim().toLowerCase();
  const selectedSports = filters?.sports ?? new Set();
  const selectedGroups = filters?.groups ?? new Set();
  const from = filters?.dateFrom ? parseFixtureDate(filters.dateFrom) : null;
  const to = filters?.dateTo ? parseFixtureDate(filters.dateTo) : null;

  return (fixtures || []).filter((fixture) => {
    const groupName = String(fixtureGroups?.[fixture.groupId]?.name ?? '').toLowerCase();
    const fixtureText = [
      fixture.name,
      fixture.shortId,
      fixture.id,
      fixture.sportType,
      fixture.venue,
      fixture.date,
      groupName
    ].join(' ').toLowerCase();

    if (search && !fixtureText.includes(search)) return false;
    if (selectedSports.size && !selectedSports.has(fixture.typeId)) return false;
    if (selectedGroups.size && !selectedGroups.has(fixture.groupId)) return false;

    if (from || to) {
      const fixtureDate = parseFixtureDate(fixture.date);
      if (!fixtureDate) return false;
      if (from && fixtureDate < from) return false;
      if (to && fixtureDate > to) return false;
    }

    return true;
  });
}

export function cloneDate(value) {
  return value ? new Date(value) : null;
}

export function getFixtureShortId(id) {
  const value = String(id ?? '').trim();
  return value.includes('-') ? value.split('-')[0] : value;
}

