// ========================================
//   DONGTUBE - UPDATED WITH JSONBIN & SEO
// ========================================

// JSONBin Configuration
const JSONBIN_CONFIG = {
  URL: "https://api.jsonbin.io/v3/b/68c7fdc9d0ea881f407e85cc",
  KEY: "$2a$10$PsVzgljojE5fq8qZRmpE4uzMr0K9LArqfmumGVSmNY.P8F2iTKrim"
};

// Global variables
let animeData = [];
let currentData = [];
let isGridView = true;
let isLoading = false;

// URL Helper Functions
class URLManager {
  static createSEOUrl(anime, episode = null) {
    const baseUrl = window.location.origin;
    let slug = anime.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (episode) {
      const episodeSlug = episode.title
        ? episode.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
        : `episode-${episode.num}`;
      return `${baseUrl}/home/streaming-${slug}-${episodeSlug}?id=${anime.id}&ep=${episode.num}`;
    }
    
    return `${baseUrl}/anime/${slug}?id=${anime.id}`;
  }

  static parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      id: parseInt(urlParams.get('id')),
      ep: parseInt(urlParams.get('ep')) || 1,
      search: urlParams.get('search') || '',
      filter: urlParams.get('filter') || '',
      genre: urlParams.get('genre') || '',
      sort: urlParams.get('sort') || ''
    };
  }

  static updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.pushState({}, '', url);
  }
}

// JSONBin API Manager
class JSONBinAPI {
  static async getData() {
    try {
      const response = await fetch(`${JSONBIN_CONFIG.URL}/latest`, {
        headers: { "X-Master-Key": JSONBIN_CONFIG.KEY }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.record || [];
    } catch (error) {
      console.error('Error fetching anime data:', error);
      NotificationManager.show('Failed to load anime data', 'error');
      return [];
    }
  }

  static async updateData(newData) {
    try {
      const response = await fetch(JSONBIN_CONFIG.URL, {
        method: 'PUT',
        headers: { 
          "X-Master-Key": JSONBIN_CONFIG.KEY, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(newData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating anime data:', error);
      NotificationManager.show('Failed to save data', 'error');
      return false;
    }
  }
}

// Theme Management
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('dongtube_theme') || 'dark';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('#themeSwitcher');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    this.currentTheme = theme;
    localStorage.setItem('dongtube_theme', theme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    NotificationManager.show(`Switched to ${newTheme} theme`, 'success');
  }

  bindEvents() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.addEventListener('click', () => this.toggle());
    }
  }
}

// Notification Manager
class NotificationManager {
  static show(message, type = 'info') {
    const container = this.getContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }

  static getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
}

// Loading Manager
class LoadingManager {
  static show(element) {
    if (element) {
      element.style.display = 'flex';
    }
    
    const skeletonWrapper = document.getElementById('skeletonWrapper');
    if (skeletonWrapper) {
      this.renderSkeleton(skeletonWrapper, 6);
    }
    
    const animeList = document.getElementById('animeList');
    if (animeList) {
      animeList.style.display = 'none';
    }
  }

  static hide(element) {
    if (element) {
      element.style.display = 'none';
    }
    
    const skeletonWrapper = document.getElementById('skeletonWrapper');
    if (skeletonWrapper) {
      skeletonWrapper.innerHTML = '';
    }
    
    const animeList = document.getElementById('animeList');
    if (animeList) {
      animeList.style.display = 'grid';
    }
  }

  static renderSkeleton(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      container.appendChild(skeleton);
    }
  }
}

// Index Page Controller
class IndexController {
  constructor() {
    this.elements = {
      animeList: document.getElementById('animeList'),
      searchInput: document.getElementById('searchInput'),
      filterSelect: document.getElementById('filterSelect'),
      sortSelect: document.getElementById('sortSelect'),
      resetBtn: document.getElementById('resetBtn'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      resultCount: document.getElementById('resultCount'),
      noResults: document.getElementById('noResults')
    };
    
    this.currentData = [];
    this.isGridView = true;

    if (this.elements.animeList) {
      this.init();
    }
  }

  async init() {
    this.bindEvents();
    this.showLoading();
    
    // Load data from JSONBin
    animeData = await JSONBinAPI.getData();
    this.currentData = [...animeData];
    
    // Apply URL parameters
    this.applyUrlFilters();
    
    this.updateStats();
    this.hideLoading();
    this.renderAnimeList(this.currentData);
  }

  applyUrlFilters() {
    const params = URLManager.parseUrlParams();
    
    if (params.search && this.elements.searchInput) {
      this.elements.searchInput.value = params.search;
    }
    if (params.filter && this.elements.filterSelect) {
      this.elements.filterSelect.value = params.filter;
    }
    if (params.sort && this.elements.sortSelect) {
      this.elements.sortSelect.value = params.sort;
    }
    
    if (params.search || params.filter || params.sort || params.genre) {
      this.filterAndSearch();
    }
  }

  bindEvents() {
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', this.debounce(() => {
        this.filterAndSearch();
      }, 300));
    }

    if (this.elements.filterSelect) {
      this.elements.filterSelect.addEventListener('change', () => this.filterAndSearch());
    }

    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', () => this.filterAndSearch());
    }

    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => this.resetFilters());
    }

    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener('click', () => this.toggleView('grid'));
      listViewBtn.addEventListener('click', () => this.toggleView('list'));
    }
  }

  showLoading() {
    LoadingManager.show(this.elements.loadingIndicator);
  }

  hideLoading() {
    LoadingManager.hide(this.elements.loadingIndicator);
  }

  renderAnimeList(data) {
    if (!this.elements.animeList) return;

    this.elements.animeList.innerHTML = '';
    this.updateResultCount(data.length);

    if (data.length === 0) {
      this.showNoResults();
      return;
    }

    this.hideNoResults();

    data.forEach((anime, index) => {
      const card = this.createAnimeCard(anime);
      card.style.animationDelay = `${index * 0.05}s`;
      this.elements.animeList.appendChild(card);
    });

    this.elements.animeList.className = this.isGridView ? 'anime-grid' : 'anime-grid list-view';
  }

  createAnimeCard(anime) {
    const card = document.createElement('a');
    card.className = 'card';
    card.dataset.animeId = anime.id;
    
    // Use SEO-friendly URL
    if (anime.episodes && anime.episodes.length > 0) {
      card.href = URLManager.createSEOUrl(anime, anime.episodes[0]);
    } else {
      card.href = URLManager.createSEOUrl(anime);
    }
    
    // Handle click for client-side navigation
    card.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateToAnime(anime);
    });
    
    const statusClass = anime.status?.toLowerCase() === 'ongoing' ? 'status-ongoing' : 'status-complete';
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    
    card.innerHTML = `
      <img src="${anime.thumb || placeholderImage}" alt="${anime.title}" loading="lazy" onerror="this.src='${placeholderImage}'">
      <div class="info">
        <div class="title">${anime.title}</div>
        <div class="status">
          <span class="status-badge ${statusClass}">${anime.status || 'Unknown'}</span>
          ${anime.year ? `<span class="year">${anime.year}</span>` : ''}
          ${anime.rating ? `<span class="rating">⭐ ${anime.rating}</span>` : ''}
        </div>
        ${anime.episodes && anime.episodes.length > 0 ? `<div class="episodes">Episodes: ${anime.episodes.length}</div>` : ''}
        ${anime.genre ? `<div class="genre">${anime.genre}</div>` : ''}
      </div>
    `;

    return card;
  }

  navigateToAnime(anime) {
    if (anime.episodes && anime.episodes.length > 0) {
      // Navigate to watch page
      sessionStorage.setItem('current_anime_id', anime.id);
      sessionStorage.setItem('current_episode', 1);
      
      const watchUrl = URLManager.createSEOUrl(anime, anime.episodes[0]);
      window.location.href = watchUrl.replace('/home/streaming-', '/watch.html?id=' + anime.id + '&ep=1#');
    } else {
      NotificationManager.show('No episodes available for this anime', 'warning');
    }
  }

  filterAndSearch() {
    this.showLoading();
    
    setTimeout(() => {
      const query = this.elements.searchInput?.value.toLowerCase() || '';
      const status = this.elements.filterSelect?.value || 'all';
      const sort = this.elements.sortSelect?.value || 'title';
      const params = URLManager.parseUrlParams();
      const genre = params.genre?.toLowerCase() || '';

      let filtered = animeData.filter(anime => {
        const matchesSearch = !query || 
          anime.title.toLowerCase().includes(query) ||
          (anime.genre && anime.genre.toLowerCase().includes(query)) ||
          (anime.description && anime.description.toLowerCase().includes(query));
        
        const matchesStatus = status === 'all' || anime.status === status;
        
        const matchesGenre = !genre ||
          (anime.genre && anime.genre.toLowerCase().includes(genre));
        
        return matchesSearch && matchesStatus && matchesGenre;
      });

      filtered = this.sortData(filtered, sort);

      // Update URL with current filters
      URLManager.updateURL({
        search: query || null,
        filter: status !== 'all' ? status : null,
        sort: sort !== 'title' ? sort : null
      });

      this.currentData = filtered;
      this.hideLoading();
      this.renderAnimeList(filtered);
    }, 300);
  }

  sortData(data, sortBy) {
    switch (sortBy) {
      case 'title':
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case 'status':
        return data.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      case 'year':
        return data.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'rating':
        return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return data;
    }
  }

  resetFilters() {
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.filterSelect) this.elements.filterSelect.value = 'all';
    if (this.elements.sortSelect) this.elements.sortSelect.value = 'title';
    
    // Clear URL parameters
    URLManager.updateURL({
      search: null,
      filter: null,
      sort: null,
      genre: null
    });
    
    this.currentData = [...animeData];
    this.renderAnimeList(this.currentData);
    
    NotificationManager.show('Filters reset', 'success');
  }

  toggleView(viewType) {
    this.isGridView = viewType === 'grid';
    
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    if (gridBtn && listBtn) {
      gridBtn.classList.toggle('active', this.isGridView);
      listBtn.classList.toggle('active', !this.isGridView);
    }
    
    localStorage.setItem('dongtube_view', viewType);
    this.renderAnimeList(this.currentData);
  }

  updateResultCount(count) {
    if (this.elements.resultCount) {
      this.elements.resultCount.textContent = count;
    }
  }

  showNoResults() {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = 'block';
    }
  }

  hideNoResults() {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = 'none';
    }
  }

  updateStats() {
    const animeCountEl = document.getElementById('animeCount');
    if (animeCountEl) {
      this.countUp(animeCountEl, animeData.length, 1500);
    }
  }

  countUp(element, target, duration = 1500) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      element.textContent = Math.floor(current);
      
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      }
    }, 16);
  }

  refreshAnimeList() {
    this.init();
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Watch Page Controller
class WatchController {
  constructor() {
    this.elements = {
      videoPlayer: document.getElementById('videoPlayer'),
      episodes: document.getElementById('episodes'),
      prevBtn: document.getElementById('prevEp'),
      nextBtn: document.getElementById('nextEp'),
      animeTitle: document.getElementById('animeTitle'),
      nowPlaying: document.getElementById('nowPlaying'),
      animeDetails: document.getElementById('animeDetails'),
      episodeCount: document.getElementById('episodeCount')
    };
    
    this.currentAnime = null;
    this.currentEpisodeIndex = 0;

    if (this.elements.videoPlayer && this.elements.episodes) {
      this.init();
    }
  }

  async init() {
    // Load anime data from JSONBin
    animeData = await JSONBinAPI.getData();
    
    this.bindEvents();
    await this.loadAnimeData();
  }

  async loadAnimeData() {
    const params = URLManager.parseUrlParams();
    let animeId = params.id;
    let episodeNum = params.ep;

    // Fallback: try sessionStorage
    if (!animeId || isNaN(animeId)) {
      animeId = parseInt(sessionStorage.getItem('current_anime_id'));
      episodeNum = parseInt(sessionStorage.getItem('current_episode')) || 1;
    }

    if (!animeId || isNaN(animeId)) {
      this.showError('Anime not found');
      return;
    }
    
    this.currentAnime = animeData.find(a => a.id === animeId);
    this.currentEpisodeIndex = Math.max(0, episodeNum - 1);

    if (!this.currentAnime) {
      this.showError('Anime not found');
      return;
    }

    if (!this.currentAnime.episodes || this.currentAnime.episodes.length === 0) {
      this.showError('No episodes available');
      return;
    }

    this.renderAnimeDetails();
    this.renderEpisodeList();
    this.loadEpisode(this.currentEpisodeIndex);
    this.updateMetaTags();
    this.loadRelatedAnime();
  }

  updateMetaTags() {
    if (!this.currentAnime) return;

    const episode = this.currentAnime.episodes[this.currentEpisodeIndex];
    const episodeTitle = episode ? (episode.title || `Episode ${episode.num}`) : 'Episode';
    
    document.title = `Watch ${this.currentAnime.title} ${episodeTitle} - DongTube`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const description = `Watch ${this.currentAnime.title} ${episodeTitle} in HD quality. ${this.currentAnime.description || ''}`.substring(0, 160);
      metaDesc.setAttribute('content', description);
    }
  }

  renderAnimeDetails() {
    if (!this.currentAnime || !this.elements.animeDetails) return;

    if (this.elements.animeTitle) {
      this.elements.animeTitle.textContent = this.currentAnime.title;
    }

    if (this.elements.episodeCount) {
      this.elements.episodeCount.textContent = `(${this.currentAnime.episodes.length})`;
    }

    const statusClass = this.currentAnime.status?.toLowerCase() === 'ongoing' ? 'status-ongoing' : 'status-complete';
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    
    this.elements.animeDetails.innerHTML = `
      <img src="${this.currentAnime.thumb || placeholderImage}" alt="${this.currentAnime.title}" loading="lazy" onerror="this.src='${placeholderImage}'">
      <div class="title">${this.currentAnime.title}</div>
      <div class="status">
        <span class="status-badge ${statusClass}">${this.currentAnime.status || 'Unknown'}</span>
      </div>
      ${this.currentAnime.genre ? `<div class="genre">📂 ${this.currentAnime.genre}</div>` : ''}
      ${this.currentAnime.year ? `<div class="year">📅 ${this.currentAnime.year}</div>` : ''}
      ${this.currentAnime.rating ? `<div class="rating">⭐ ${this.currentAnime.rating}/10</div>` : ''}
      ${this.currentAnime.description ? `<div class="description">${this.currentAnime.description}</div>` : ''}
    `;
  }

  renderEpisodeList() {
    if (!this.currentAnime || !this.elements.episodes) return;

    this.elements.episodes.innerHTML = '';
    
    this.currentAnime.episodes.forEach((episode, index) => {
      const episodeEl = document.createElement('div');
      episodeEl.className = 'episode';
      episodeEl.innerHTML = `
        <div class="ep-number">EP ${episode.num}</div>
        ${episode.title ? `<div class="ep-title">${episode.title}</div>