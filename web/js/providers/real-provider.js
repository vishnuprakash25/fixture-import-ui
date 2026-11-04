// ─── Real provider ───
// Reads live data from the Sport Data Hub (SDH) / Fixture Manager APIs and
// hands the UI core the same `data` contract the mock provider satisfies.
//
// Currently integrated: the SDH fixture-group list (Phase 1 discovery).
// Everything else still resolves to an empty collection so the UI renders its
// empty states instead of failing.
//
// Configuration (first match wins):
//   1. `?api=https://host/path` query parameter
//   2. `window.__FIXTURE_API__ = { baseUrl, fixtureGroupsPath, fixtureGroupsUrl, headers, timeoutMs }`
// With no configuration the provider short-circuits to empty data and logs why.

import { deriveSportTypes, mapSdhFixtureGroups } from './sdh-mappers.js?v=520eddcdb3';

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_FIXTURE_GROUPS_PATH = '/fixture-groups';

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

function readQueryParam(name) {
  if (typeof window === 'undefined' || !window.location) return '';
  return (new URLSearchParams(window.location.search).get(name) || '').trim();
}

export function resolveApiConfig() {
  const config = (typeof window !== 'undefined' && window.__FIXTURE_API__) || {};
  const baseUrl = (readQueryParam('api') || config.baseUrl || '').trim().replace(/\/+$/, '');
  const path = config.fixtureGroupsPath || DEFAULT_FIXTURE_GROUPS_PATH;
  const fixtureGroupsUrl = config.fixtureGroupsUrl || (baseUrl ? `${baseUrl}${path}` : '');

  return {
    baseUrl,
    fixtureGroupsUrl,
    headers: config.headers || {},
    timeoutMs: Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : DEFAULT_TIMEOUT_MS
  };
}

async function fetchJson(url, { headers, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...headers },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`SDH request failed: ${response.status} ${response.statusText} (${url})`);
    }

    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`SDH request timed out after ${timeoutMs}ms (${url})`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function createRealActions() {
  return {
    notify(message) {
      window.alert(message);
    }
  };
}

export async function loadRealProvider() {
  const config = resolveApiConfig();
  const data = createEmptyData();
  const errors = [];

  if (!config.fixtureGroupsUrl) {
    console.info('[fixture-import-ui] Real mode with no API configured. Set ?api=<base-url> or window.__FIXTURE_API__.');
  } else {
    try {
      const payload = await fetchJson(config.fixtureGroupsUrl, config);
      data.fixtureGroups = mapSdhFixtureGroups(payload);
      data.sportTypes = deriveSportTypes(data.fixtureGroups);
    } catch (error) {
      // A failed read must not take the shell down: keep the empty collections
      // so the UI renders its empty state, and surface the cause to the caller.
      errors.push({ source: 'fixtureGroups', url: config.fixtureGroupsUrl, message: error?.message || String(error) });
      console.error('[fixture-import-ui] Could not load SDH fixture groups.', error);
    }
  }

  return {
    mode: 'real',
    data,
    actions: createRealActions(),
    config,
    errors
  };
}

