/**
 * happlore/assets/js/testimonial.js
 * -------------------------------------------------
 * Renders the fixed bottom testimonial strip
 * used on every flow step page.
 *
 * Usage:
 *   <div id="testimonial-mount"></div>
 *   <script>
 *     Testimonial.render({
 *       avatar: 'B',
 *       avatarBg: '#5b4fcf',
 *       text: '"Great trip..." ',
 *       name: 'Bharani Tharan, Switzerland',
 *       rating: '4.6 / 5',
 *       reviewCount: '8250+',
 *     });
 *   </script>
 */

const Testimonial = (() => {

  const googleLogoSVG = `
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>`;

  function render({ avatar, avatarBg = '#7c3aed', text, name, rating = '4.6 / 5', reviewCount = '8400+' }) {
    const mount = document.getElementById('testimonial-mount');
    if (!mount) { console.warn('Testimonial: #testimonial-mount not found'); return; }

    mount.innerHTML = `
      <div class="testimonial-strip">
        <div class="test-left">
          <div class="test-avatar" style="background:${avatarBg}">${avatar}</div>
          <div>
            <p class="test-text">${text}</p>
            <p class="test-name">${name}</p>
          </div>
        </div>
        <div class="test-divider"></div>
        <div class="test-rating">
          ${googleLogoSVG}
          <div>
            <div style="display:flex;align-items:center;gap:4px">
              <span class="test-score">${rating}</span>
              <span class="test-star">★</span>
            </div>
            <p class="test-count">${reviewCount} reviews</p>
          </div>
        </div>
      </div>`;
  }

  return { render };
})();
