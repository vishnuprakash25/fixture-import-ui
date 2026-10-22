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

// ─── DD/MM/YYYY typed-input support for the date range pickers ───
// Typing a date is far quicker than clicking through months when a range
// spans several years (e.g. 12/04/2017 – 22/05/2028).
export function formatInputDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function parseInputDate(value) {
  const match = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(String(value ?? '').trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  // Rejects impossible dates that JS would otherwise roll over (e.g. 31/02/2026).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

// Keeps typing fluid by inserting the slashes as the user enters digits.
export function maskInputDate(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Local-time YYYY-MM-DD. Avoids the off-by-one day that toISOString() causes
// for local-midnight dates outside UTC.
export function toLocalISODate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
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

