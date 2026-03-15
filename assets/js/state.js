/**
 * happlore/assets/js/state.js
 * -------------------------------------------------
 * Central booking state manager.
 * Persists across pages via sessionStorage so the
 * full funnel (dest → travellers → duration → …)
 * survives page navigations on S3 static hosting.
 *
 * Usage:
 *   HapploreState.set('dest', 'Switzerland');
 *   HapploreState.get('dest');   // 'Switzerland'
 *   HapploreState.getAll();      // { dest, traveller, duration, … }
 *   HapploreState.clear();
 */

const HapploreState = (() => {
  const KEY = 'happlore_booking';

  function getAll() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function get(field) {
    return getAll()[field] || null;
  }

  function set(field, value) {
    const current = getAll();
    current[field] = value;
    sessionStorage.setItem(KEY, JSON.stringify(current));
  }

  function clear() {
    sessionStorage.removeItem(KEY);
  }

  return { get, set, getAll, clear };
})();
