/**
 * happlore/assets/js/destinations.js
 * -------------------------------------------------
 * Local destination database + search logic.
 *
 * TO CONNECT A REAL API: replace the `search()`
 * function body with a fetch() call:
 *
 *   async function search(query) {
 *     const res = await fetch(`/api/destinations?q=${query}`);
 *     return res.json();
 *   }
 *
 * The rest of the UI code doesn't need to change.
 */

const Destinations = (() => {

  const DATA = [
    // Switzerland
    { name: 'Switzerland',    country: '',             bookedAgo: '19hr ago' },
    { name: 'Zug',            country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Zurich',         country: 'Switzerland',  bookedAgo: '2hr ago'  },
    { name: 'Zermatt',        country: 'Switzerland',  bookedAgo: '3hr ago'  },
    { name: 'Interlaken',     country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Lucerne',        country: 'Switzerland',  bookedAgo: '2hr ago'  },
    { name: 'Geneva',         country: 'Switzerland',  bookedAgo: '4hr ago'  },
    { name: 'Bern',           country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Thun',           country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Sion',           country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Chur',           country: 'Switzerland',  bookedAgo: '1hr ago'  },
    { name: 'Grindelwald',    country: 'Switzerland',  bookedAgo: '3hr ago'  },
    { name: 'Swindon',        country: 'England',      bookedAgo: '1hr ago'  },
    { name: 'Oswiecim',       country: 'Poland',       bookedAgo: '1hr ago'  },
    // Japan
    { name: 'Japan',          country: '',             bookedAgo: '12hr ago' },
    { name: 'Tokyo',          country: 'Japan',        bookedAgo: '1hr ago'  },
    { name: 'Osaka',          country: 'Japan',        bookedAgo: '2hr ago'  },
    { name: 'Kyoto',          country: 'Japan',        bookedAgo: '1hr ago'  },
    { name: 'Hiroshima',      country: 'Japan',        bookedAgo: '3hr ago'  },
    { name: 'Nara',           country: 'Japan',        bookedAgo: '4hr ago'  },
    { name: 'Sapporo',        country: 'Japan',        bookedAgo: '5hr ago'  },
    // Dubai & UAE
    { name: 'Dubai',          country: 'UAE',          bookedAgo: '30min ago'},
    { name: 'Abu Dhabi',      country: 'UAE',          bookedAgo: '1hr ago'  },
    { name: 'Sharjah',        country: 'UAE',          bookedAgo: '2hr ago'  },
    // Singapore
    { name: 'Singapore',      country: '',             bookedAgo: '45min ago'},
    { name: 'Sentosa',        country: 'Singapore',    bookedAgo: '1hr ago'  },
    // Europe
    { name: 'Europe',         country: '',             bookedAgo: '8hr ago'  },
    { name: 'Paris',          country: 'France',       bookedAgo: '1hr ago'  },
    { name: 'London',         country: 'England',      bookedAgo: '2hr ago'  },
    { name: 'Rome',           country: 'Italy',        bookedAgo: '1hr ago'  },
    { name: 'Barcelona',      country: 'Spain',        bookedAgo: '3hr ago'  },
    { name: 'Amsterdam',      country: 'Netherlands',  bookedAgo: '2hr ago'  },
    { name: 'Prague',         country: 'Czech Republic', bookedAgo: '4hr ago'},
    { name: 'Vienna',         country: 'Austria',      bookedAgo: '5hr ago'  },
    { name: 'Budapest',       country: 'Hungary',      bookedAgo: '3hr ago'  },
    { name: 'Santorini',      country: 'Greece',       bookedAgo: '30min ago'},
    { name: 'Athens',         country: 'Greece',       bookedAgo: '1hr ago'  },
    { name: 'Mykonos',        country: 'Greece',       bookedAgo: '1hr ago'  },
    // Maldives
    { name: 'Maldives',       country: '',             bookedAgo: '20min ago'},
    { name: 'Malé',           country: 'Maldives',     bookedAgo: '1hr ago'  },
    { name: 'Baa Atoll',      country: 'Maldives',     bookedAgo: '2hr ago'  },
    // Bali
    { name: 'Bali',           country: 'Indonesia',    bookedAgo: '15min ago'},
    { name: 'Ubud',           country: 'Bali',         bookedAgo: '1hr ago'  },
    { name: 'Seminyak',       country: 'Bali',         bookedAgo: '2hr ago'  },
    { name: 'Kuta',           country: 'Bali',         bookedAgo: '1hr ago'  },
    // Thailand
    { name: 'Thailand',       country: '',             bookedAgo: '1hr ago'  },
    { name: 'Bangkok',        country: 'Thailand',     bookedAgo: '1hr ago'  },
    { name: 'Phuket',         country: 'Thailand',     bookedAgo: '30min ago'},
    { name: 'Chiang Mai',     country: 'Thailand',     bookedAgo: '2hr ago'  },
    { name: 'Krabi',          country: 'Thailand',     bookedAgo: '1hr ago'  },
    // Australia
    { name: 'Australia',      country: '',             bookedAgo: '6hr ago'  },
    { name: 'Sydney',         country: 'Australia',    bookedAgo: '1hr ago'  },
    { name: 'Melbourne',      country: 'Australia',    bookedAgo: '2hr ago'  },
    { name: 'Cairns',         country: 'Australia',    bookedAgo: '4hr ago'  },
    // New Zealand
    { name: 'New Zealand',    country: '',             bookedAgo: '9hr ago'  },
    { name: 'Auckland',       country: 'New Zealand',  bookedAgo: '1hr ago'  },
    { name: 'Queenstown',     country: 'New Zealand',  bookedAgo: '2hr ago'  },
    { name: 'Rotorua',        country: 'New Zealand',  bookedAgo: '3hr ago'  },
    // Vietnam
    { name: 'Vietnam',        country: '',             bookedAgo: '4hr ago'  },
    { name: 'Hanoi',          country: 'Vietnam',      bookedAgo: '1hr ago'  },
    { name: 'Ho Chi Minh City', country: 'Vietnam',   bookedAgo: '2hr ago'  },
    { name: 'Da Nang',        country: 'Vietnam',      bookedAgo: '1hr ago'  },
    { name: 'Hoi An',         country: 'Vietnam',      bookedAgo: '3hr ago'  },
    // Malaysia
    { name: 'Malaysia',       country: '',             bookedAgo: '5hr ago'  },
    { name: 'Kuala Lumpur',   country: 'Malaysia',     bookedAgo: '1hr ago'  },
    { name: 'Penang',         country: 'Malaysia',     bookedAgo: '2hr ago'  },
    { name: 'Langkawi',       country: 'Malaysia',     bookedAgo: '1hr ago'  },
    // Others
    { name: 'Greece',         country: '',             bookedAgo: '7hr ago'  },
    { name: 'Seychelles',     country: '',             bookedAgo: '11hr ago' },
    { name: 'Mauritius',      country: '',             bookedAgo: '13hr ago' },
    { name: 'New York',       country: 'USA',          bookedAgo: '1hr ago'  },
    { name: 'Los Angeles',    country: 'USA',          bookedAgo: '2hr ago'  },
  ];

  /**
   * Search destinations by query string.
   * Returns up to `limit` results.
   */
  function search(query, limit = 12) {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    return DATA
      .filter(d => `${d.name} ${d.country}`.toLowerCase().includes(q))
      .slice(0, limit);
  }

  /** Return the full list (e.g. for featured cards) */
  function getAll() {
    return DATA;
  }

  return { search, getAll };
})();
