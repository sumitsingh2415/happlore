/**
 * happlore/assets/js/nav.js
 * -------------------------------------------------
 * Builds the shared flow navbar (dark top bar with
 * step tabs) on every customize step page.
 *
 * Usage in each step HTML:
 *
 *   <div id="flow-nav-mount"></div>
 *   <script>
 *     FlowNav.render({
 *       currentStep: 'travellers',   // which tab is active
 *       steps: FlowNav.STEPS,        // use default or override
 *     });
 *   </script>
 *
 * The nav reads HapploreState to auto-fill completed
 * step labels (e.g. "Switzerland" instead of "Destination").
 */

const FlowNav = (() => {

  // Step definitions — order matters, matches PYT funnel
  const STEPS = [
    { key: 'destination', label: 'Destination', href: 'customize.html' },
    { key: 'travellers',  label: 'Travellers',  href: 'travellers.html' },
    { key: 'duration',    label: 'Duration',    href: 'duration.html'   },
    { key: 'departure-city',  label: 'Departure City',  href: 'departure-city.html' },
    { key: 'departure-date',  label: 'Departure Date',  href: 'departure-date.html' },
    { key: 'cities',          label: 'Cities',          href: 'cities.html'   },
  ];

  // Map state keys → display labels for completed steps
  // Maps traveller type to pax + rooms for navbar label
  const TRAVELLER_META = {
    couple:    { count: 2, rooms: 1 },
    family:    { count: 4, rooms: 1 },
    friends:   { count: 4, rooms: 2 },
    solo:      { count: 1, rooms: 1 },
    honeymoon: { count: 2, rooms: 1 },
  };

  const STATE_LABELS = {
    destination: () => HapploreState.get('dest') || 'Destination',
    travellers: () => {
      const type = HapploreState.get('traveller');
      if (!type) return 'Travellers';
      const meta  = TRAVELLER_META[type] || { count: 2, rooms: 1 };
      const pax   = meta.count === 1 ? '1 Traveller' : meta.count + ' Travellers';
      const rooms = meta.rooms === 1 ? '1 Room' : meta.rooms + ' Rooms';
      return pax + ', ' + rooms;
    },
    duration: () => HapploreState.get('duration') || 'Duration',
    'departure-city': () => {
      const c = HapploreState.get('departureCity');
      return c ? c.code : 'Departure City';
    },
    cities: () => {
      const c = HapploreState.get('cities');
      return (c && c.length) ? c.length + ' Cities' : 'Cities';
    },
    'departure-date': () => {
      const d = HapploreState.get('departureDate');
      if (!d) return 'Departure Date';
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit' });
    },
  };

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  /**
   * Determine status of each step relative to currentStep.
   * Steps before current → 'done'
   * Current step         → 'current'
   * Steps after current  → '' (future/locked)
   */
  function getStepStatus(steps, currentKey) {
    const currentIdx = steps.findIndex(s => s.key === currentKey);
    return steps.map((step, i) => ({
      ...step,
      status: i < currentIdx ? 'done' : i === currentIdx ? 'current' : '',
    }));
  }

  function logoSVG() { return ''; } // not used

  function closeSVG() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
  }

  function render({ currentStep, steps = STEPS }) {
    const mount = document.getElementById('flow-nav-mount');
    if (!mount) { console.warn('FlowNav: #flow-nav-mount not found'); return; }

    const annotated = getStepStatus(steps, currentStep);

    const tabsHTML = annotated.map((step, i) => {
      const isLast  = i === annotated.length - 1;
      const sep     = !isLast ? '<div class="step-sep"></div>' : '';
      const isDone  = step.status === 'done';
      const isCur   = step.status === 'current';

      // Completed steps show the actual chosen value and are clickable
      const label = isDone && STATE_LABELS[step.key]
        ? STATE_LABELS[step.key]()
        : step.label;

      const cls   = ['step-tab', step.status].filter(Boolean).join(' ');
      const tag   = isDone ? 'a' : 'span';
      const href  = isDone ? `href="${step.href}"` : '';

      return `<${tag} class="${cls}" ${href}>${label}</${tag}>${sep}`;
    }).join('');

    mount.innerHTML = `
      <nav class="flow-nav">
        <div class="flow-nav-inner">
          <a href="index.html" style="text-decoration:none;display:flex;align-items:center;gap:0">
            <span style="font-family:'Inter','DM Sans','Manrope',sans-serif;font-size:19px;font-weight:500;color:#fff;letter-spacing:-.3px">happlore</span><span style="color:#e8503a;font-size:21px;line-height:1;margin-left:1px;font-weight:700">•</span>
          </a>
          <div class="step-tabs">${tabsHTML}</div>
          <a href="index.html" class="nav-close">${closeSVG()}</a>
        </div>
      </nav>`;
  }

  return { render, STEPS };
})();
