
import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export { html };

/**
 * Extracts YouTube Video ID and generates a clean embed URL.
 */
export function getEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /[?&]v=([^&#]*)/,          
    /youtu\.be\/([^?&#]*)/,     
    /shorts\/([^?&#]*)/,       
    /embed\/([^?&#]*)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
  }
  return null;
}

export const Header = ({ title, onNavigate }) => html`
  <header>
    <a href="#" onClick=${(e) => { e.preventDefault(); onNavigate(null); }} class="logo">
      <img src="${title}" alt="Fadi Sawan" class="logo-img" />
    </a>
  </header>
`;

export const CategoryCard = ({ category, index, onSelect }) => html`
  <a href="#" class="category-card" onClick=${(e) => { e.preventDefault(); onSelect(index); }}>
    <div class="thumbnail-wrapper">
      <img src="${category.category_thumbnail || `https://picsum.photos/400/300?random=${index}`}" alt="${category.category_title}" loading="lazy" />
    </div>
    <div class="category-title">${category.category_title}</div>
  </a>
`;

export const VideoEmbed = ({ url }) => {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;
  
  return html`
    <div class="video-container">
      <div class="video-item-wrapper">
        <iframe
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
    </div>
  `;
};

export const Footer = ({ contact }) => {
  if (!contact) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`;
  
  return html`
    <footer>
      <div class="footer-content">
        <div class="footer-item">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${contact.location}</a>
        </div>
        <div class="footer-item">
          <a href="tel:${contact.mobile || contact.phone}">${contact.mobile || contact.phone}</a>
        </div>
        <div class="footer-item">
          <a href="mailto:${contact.email}">${contact.email}</a>
        </div>
      </div>
    </footer>
  `;
};
