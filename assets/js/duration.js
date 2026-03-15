/**
 * happlore/assets/js/duration.js
 * -------------------------------------------------
 * Handles rendering the "Packages by Duration" section on the homepage.
 * Allows switching between durations and shows a different set of sample
 * destinations for each duration.
 */

const DurationPackages = (() => {
  const DATA = {
    '5': [
      { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80', price: 'From ₹45,000' },
      { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80', price: 'From ₹35,000' },
      { name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80', price: 'From ₹60,000' },
      { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&q=80', price: 'From ₹50,000' },
    ],
    '7': [
      { name: 'Europe', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&q=80', price: 'From ₹75,000' },
      { name: 'Japan', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80', price: 'From ₹90,000' },
      { name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&q=80', price: 'From ₹40,000' },
      { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80', price: 'From ₹45,000' },
    ],
    '10': [
      { name: 'Europe', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&q=80', price: 'From ₹75,000' },
      { name: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&q=80', price: 'From ₹95,000' },
      { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80', price: 'From ₹35,000' },
      { name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80', price: 'From ₹60,000' },
    ],
    '14': [
      { name: 'Europe', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&q=80', price: 'From ₹75,000' },
      { name: 'Japan', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80', price: 'From ₹90,000' },
      { name: 'New Zealand', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=500&q=80', price: 'From ₹1,10,000' },
      { name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80', price: 'From ₹60,000' },
    ],
  };

  function renderGrid(duration, container) {
    const list = DATA[duration] || DATA['5'];
    container.innerHTML = list.map(dest => {
      const destName = dest.name;
      return `
        <a href="customize.html" class="dest-card h-52 lg:h-60 no-underline block" data-dest="${destName}">
          <img src="${dest.image}" class="w-full h-full object-cover" alt="${destName}" />
          <div class="dest-overlay flex-col"><p class="text-white font-bold">${destName}</p><p class="text-white/75 text-xs mt-0.5">${dest.price}</p></div>
        </a>`;
    }).join('');

    // Wire up destination clicks to persist the selected destination
    container.querySelectorAll('[data-dest]').forEach(el => {
      el.addEventListener('click', () => {
        const dest = el.dataset.dest;
        if (window.HapploreState && dest) HapploreState.set('dest', dest);
      });
    });
  }

  return { renderGrid };
})();
