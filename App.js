import { h, render, Fragment } from 'https://esm.sh/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import { Header, Footer, CategoryCard, getEmbedUrl } from './components.js';

const html = htm.bind(h);

const CONFIG = {
  site: {
    title: "Fadi Sawan",
    logo: "images/fady_logo.png"
  }
};

function App() {
  const [data, setData] = useState([]);
  const [contact, setContact] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheetData = fetch("https://opensheet.elk.sh/15yaPj6AQRL7hqYbBtATUOJjddt3kEkRA7Jvm3KyqmRg/Sheet1")
      .then(res => res.json())
      .then(rows => rows.map(row => ({
        category_title: row["Category Title"] || "Untitled",
        category_thumbnail: row["Thumbnail"] || "images/cat01.jpg",
        youtube_links: (typeof row["YouTube Links"] === 'string')
          ? row["YouTube Links"].split("|").map(s => s.trim())
          : []
      })))
      .catch(err => {
        console.error("Sheet Error:", err);
        return [];
      });

    const fetchContactData = fetch("https://opensheet.elk.sh/15yaPj6AQRL7hqYbBtATUOJjddt3kEkRA7Jvm3KyqmRg/Sheet2")
      .then(res => res.json())
      .then(rows => {
        if (rows && rows.length > 1) {
          return { contact: rows[1] };
        } else if (rows && rows.length > 0) {
          return { contact: rows[0] };
        }
        throw new Error("Sheet empty");
      })
      .catch(err => {
        console.warn("Sheet Contact Error, falling back to JSON:", err);
        return fetch('contact.json')
          .then(res => res.json())
          .catch(err => {
            console.error("Contact Error:", err);
            return { contact: null };
          });
      });

    Promise.all([fetchSheetData, fetchContactData])
      .then(([videoData, contactData]) => {
        setData(videoData);
        setContact(contactData.contact);

        const params = new URLSearchParams(window.location.search);
        const cat = params.get('cat');
        if (cat !== null) setSelectedCategory(parseInt(cat));
      })
      .finally(() => {
        setLoading(false);
      });

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      setSelectedCategory(cat !== null ? parseInt(cat) : null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (index) => {
    const url = index !== null ? `?cat=${index}` : window.location.pathname;
    window.history.pushState({}, '', url);
    setSelectedCategory(index);
    window.scrollTo(0, 0);
  };

  if (loading) return html`<div class="loading">Loading...</div>`;

  if (selectedCategory !== null && data[selectedCategory]) {
    const category = data[selectedCategory];
    return html`
      <${Fragment}>
        <${Header} title=${CONFIG.site.logo} onNavigate=${navigate} />
        <main>
          <h1 class="section-title">${category.category_title}</h1>
          <div class="video-grid">
            ${category.youtube_links.map(url => {
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
    })}
          </div>
        </main>
        <${Footer} contact=${contact} />
      </${Fragment}>
    `;
  }

  return html`
    <${Fragment}>
      <${Header} title=${CONFIG.site.logo} onNavigate=${navigate} />
      <main>
        
        <div class="category-grid">
          ${data.map((cat, index) => html`
            <${CategoryCard} 
              key=${index} 
              category=${cat} 
              index=${index} 
              onSelect=${navigate} 
            />
          `)}
        </div>
      </main>
      ${contact && html`<${Footer} contact=${contact} />`}
    </${Fragment}>
  `;
}



render(html`<${App} />`, document.getElementById('app'));
