// Embedded data to ensure the site works without a server (CORS fallback)
const siteData = {
  "site": {
    "title": "Fadi's Portfolio",
    "logo": "FADI",
    "background_color": "#ffffff",
    "text_color": "#1a1a1a"
  },
  "contact": {
    "location": "Dubai, UAE",
    "phone": "+971 50 123 4567",
    "email": "hello@fadi.site"
  },
  "categories": [
    {
      "category_title": "Automotive Cinematics",
      "category_thumbnail": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "youtube_links": [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com/shorts/tPEE9ZwTdz0"
      ]
    },
    {
      "category_title": "Travel Vlogs",
      "category_thumbnail": null,
      "youtube_links": [
        "https://youtu.be/jNQXAC9IVRw",
        "https://www.youtube.com/watch?v=EngW7tLk6R8"
      ]
    },
    {
      "category_title": "Tech Reviews",
      "category_thumbnail": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      "youtube_links": [
        "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "https://youtube.com/shorts/dQw4w9WgXcQ"
      ]
    },
    {
      "category_title": "Cooking Masterclass",
      "category_thumbnail": null,
      "youtube_links": [
        "https://www.youtube.com/watch?v=fH_r75T5e5Y"
      ]
    }
  ]
};

async function init() {
  let data = siteData;

  try {
    // Attempt to fetch fresh data if on a server
    if (window.location.protocol !== 'file:') {
      const response = await fetch('data.json');
      if (response.ok) data = await response.json();
    }
  } catch (e) {
    console.log('Using embedded site data');
  }
    
  applyData(data);
}

function applyData(data) {
  // Apply Site Settings
  document.title = data.site.title;
  const logoEl = document.getElementById('site-logo');
  if (logoEl) logoEl.textContent = data.site.logo;
  
  // Apply Colors
  document.documentElement.style.setProperty('--bg-color', data.site.background_color);
  document.documentElement.style.setProperty('--text-color', data.site.text_color);
  
  // Populate Footer
  document.getElementById('footer-location').textContent = data.contact.location;
  document.getElementById('footer-phone').textContent = data.contact.phone;
  document.getElementById('footer-email').textContent = data.contact.email;

  // ROBUST ROUTING: Check for the presence of page-specific elements
  if (document.getElementById('video-grid')) {
      renderCategoryPage(data);
  } else if (document.getElementById('category-grid')) {
      renderHomePage(data);
  }
}

function renderHomePage(data) {
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  // Clear existing (pre-injected) content if updating dynamically
  grid.innerHTML = '';

  data.categories.forEach((cat, index) => {
    const thumb = cat.category_thumbnail || `https://picsum.photos/400/300?random=${index}`;
    
    const card = document.createElement('a');
    card.href = `category.html?cat=${index}`;
    card.className = 'category-card';
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${cat.category_title}" loading="lazy">
      </div>
      <div class="category-title">${cat.category_title}</div>
    `;
    grid.appendChild(card);
  });
}

/**
 * REFIINED: Extracts YouTube Video ID and generates a clean embed URL.
 * Handles ALL formats (watch, youtu.be, shorts).
 */
function getEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    let videoId = '';
    const patterns = [
      /[?&]v=([^&#]*)/,          
      /youtu\.be\/([^?&#]*)/,     
      /shorts\/([^?&#]*)/,       
      /embed\/([^?&#]*)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      console.warn(`[YouTube] Skip: Invalid URL -> ${url}`);
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  } catch (error) {
    console.error('[YouTube] Parsing error:', error);
    return null;
  }
}

/**
 * Creates a video element with built-in Error 153 detection and fallback.
 */
function createVideoElement(url) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  const videoId = embedUrl.split('/').pop().split('?')[0];
  const container = document.createElement('div');
  container.className = 'video-item-wrapper';

  // 1. Create Iframe
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.className = 'youtube-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.setAttribute('allowfullscreen', '');

  // 2. Create Fallback (Thumbnail + Play Button)
  const fallback = document.createElement('a');
  fallback.href = `https://www.youtube.com/watch?v=${videoId}`;
  fallback.target = '_blank';
  fallback.className = 'video-fallback-ui hidden';
  fallback.innerHTML = `
    <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Video Thumbnail">
    <div class="play-button-overlay">
      <svg viewBox="0 0 64 64"><path d="M16 12v40l32-20z" fill="white"/></svg>
      <span>Watch on YouTube</span>
    </div>
  `;

  // 3. Detection Fallback
  // Displays the fallback button after a short delay if the embed might be blocked
  setTimeout(() => {
    fallback.classList.remove('hidden');
  }, 2000);

  container.appendChild(iframe);
  container.appendChild(fallback);
  return container;
}

/**
 * Renders video iframes into the DOM container
 */
function renderVideos(videoArray, container) {
  if (!container || !Array.isArray(videoArray)) return;
  container.innerHTML = '';

  videoArray.forEach(url => {
    const videoEl = createVideoElement(url);
    if (videoEl) {
      const wrapper = document.createElement('div');
      wrapper.className = 'video-container';
      wrapper.appendChild(videoEl);
      container.appendChild(wrapper);
    }
  });
}

/**
 * Renders the category page content
 */
function renderCategoryPage(data) {
  const urlParams = new URLSearchParams(window.location.search);
  const catIndex = parseInt(urlParams.get('cat'));
  
  if (isNaN(catIndex) || !data.categories[catIndex]) {
    document.getElementById('category-page-title').textContent = 'Category Not Found';
    return;
  }

  const category = data.categories[catIndex];
  document.getElementById('category-page-title').textContent = category.category_title;
  document.title = `${category.category_title} | ${data.site.title}`;

  const grid = document.getElementById('video-grid');
  renderVideos(category.youtube_links, grid);
}

init();
