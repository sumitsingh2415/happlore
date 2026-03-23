/**
 * happlore/assets/js/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised API client for the Happlore backend.
 * Reads: API_BASE_URL — set this to your deployed URL in production.
 *
 * Usage:
 *   HapploreAPI.submitLead(leadData)  → Promise<{id, status}>
 *   HapploreAPI.joinWaitlist(email)   → Promise<{message}>
 */

const HapploreAPI = (() => {
  // ── Config ───────────────────────────────────────────────────────────────
  // Change this to your production URL when you deploy:
  // e.g. 'https://api.happlore.com/api/v1'
  const BASE = 'http://localhost:3001/api/v1';

  // ── Generic fetch wrapper ─────────────────────────────────────────────────
  async function post(endpoint, body) {
    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'API error');
      return data;
    } catch (err) {
      console.warn(`[HapploreAPI] ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // ── Submit trip lead ──────────────────────────────────────────────────────
  /**
   * Posts the full funnel state as a lead to the backend.
   * @param {Object} leadData - Matches CreateLeadDto
   * @returns {Promise<{id: string, status: string}>}
   */
  async function submitLead(leadData) {
    // Capture UTM params from URL for attribution tracking
    const params = new URLSearchParams(window.location.search);
    const enriched = {
      ...leadData,
      source: 'web',
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
    };
    return post('/leads', enriched);
  }

  // ── Join waitlist ─────────────────────────────────────────────────────────
  /**
   * Adds an email to the app waitlist.
   * @param {string} email
   * @returns {Promise<{message: string}>}
   */
  async function joinWaitlist(email) {
    return post('/waitlist', { email, source: 'web' });
  }

  return { submitLead, joinWaitlist };
})();
