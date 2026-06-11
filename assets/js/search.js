(function() {
  let schemesData = [];
  let facets = { levels: [], states: [], ministries: [], categories: [] };
  
  // App state
  let searchQuery = '';
  let debouncedSearch = '';
  let selectedTab = 'All'; // 'All', 'Central', 'State'
  let sortOption = 'relevance'; // 'relevance', 'name-asc', 'name-desc'
  let currentPage = 1;
  const itemsPerPage = 10;
  
  let selectedLevels = [];
  let selectedStates = [];
  let selectedMinistries = [];
  let selectedCategories = [];
  
  let expandedFilters = {
    category: true,
    state: false,
    ministry: false,
    level: true
  };

  let searchTimeout = null;

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchSpinner = document.getElementById('search-loading-spinner');
  const searchIcon = document.getElementById('search-icon');
  const schemesListContainer = document.getElementById('schemes-list-container');
  const resultsCountContainer = document.getElementById('results-count-container');
  const filterQueryContainer = document.getElementById('filter-query-container');
  const paginationContainer = document.getElementById('pagination-container');
  const clearFiltersContainer = document.getElementById('clear-filters-container');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const sortSelect = document.getElementById('sort-select');
  const filterSkeletons = document.getElementById('filter-skeletons');
  const realFilters = document.getElementById('real-filters');

  // Load the schemes index
  fetch('/schemes_index.json')
    .then(res => {
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      schemesData = data;
      extractFacets();
      initUI();
      applyFiltersAndRender();
    })
    .catch(err => {
      console.error("Error loading schemes index:", err);
      schemesListContainer.innerHTML = `
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-950/20">
          Failed to load schemes database. Please reload the page.
        </div>
      `;
    });

  // Extract unique facet values
  function extractFacets() {
    const levels = new Set();
    const states = new Set();
    const ministries = new Set();
    const categories = new Set();

    schemesData.forEach(item => {
      const f = item.fields;
      if (f.level) levels.add(f.level);
      if (f.nodalMinistryName) ministries.add(f.nodalMinistryName);
      if (f.beneficiaryState) {
        f.beneficiaryState.forEach(s => states.add(s));
      }
      if (f.schemeCategory) {
        f.schemeCategory.forEach(c => categories.add(c));
      }
    });

    facets.levels = Array.from(levels).sort();
    facets.states = Array.from(states).sort();
    facets.ministries = Array.from(ministries).sort();
    facets.categories = Array.from(categories).sort();
  }

  // Setup UI Listeners & initial state
  function initUI() {
    // Hide spinner, show search icon, enable input
    if (searchSpinner) searchSpinner.classList.add('hidden');
    if (searchIcon) searchIcon.classList.remove('hidden');
    if (searchInput) {
      searchInput.disabled = false;
      searchInput.placeholder = "Search schemes by name, keyword or department name...";
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          debouncedSearch = searchQuery;
          currentPage = 1;
          applyFiltersAndRender();
        }, 150);
      });
    }

    // Tab buttons
    const tabs = {
      'All': document.getElementById('tab-all'),
      'Central': document.getElementById('tab-central'),
      'State': document.getElementById('tab-state')
    };

    Object.keys(tabs).forEach(tabKey => {
      const tabBtn = tabs[tabKey];
      if (tabBtn) {
        tabBtn.addEventListener('click', () => {
          selectedTab = tabKey;
          currentPage = 1;
          
          // Toggle active classes
          Object.keys(tabs).forEach(k => {
            const btn = tabs[k];
            if (k === tabKey) {
              btn.className = "rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 bg-[var(--bg-surface)] text-[var(--color-primary)] shadow-sm";
            } else {
              btn.className = "rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
            }
          });
          applyFiltersAndRender();
        });
      }
    });

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortOption = e.target.value;
        applyFiltersAndRender();
      });
    }

    // Reset button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Accordion setup
    const accordionKeys = ['category', 'state', 'ministry', 'level'];
    accordionKeys.forEach(key => {
      const toggleBtn = document.getElementById(`accordion-toggle-${key}`);
      const contentEl = document.getElementById(`accordion-content-${key}`);
      const iconEl = document.getElementById(`accordion-icon-${key}`);
      
      if (toggleBtn && contentEl && iconEl) {
        toggleBtn.addEventListener('click', () => {
          expandedFilters[key] = !expandedFilters[key];
          if (expandedFilters[key]) {
            contentEl.classList.remove('hidden');
            iconEl.classList.add('rotate-180');
          } else {
            contentEl.classList.add('hidden');
            iconEl.classList.remove('rotate-180');
          }
        });
      }
    });

    // Render static lists inside accordions
    renderFacetFilters();
  }

  // Render Facet checkboxes in Left Sidebar
  function renderFacetFilters() {
    if (filterSkeletons) filterSkeletons.classList.add('hidden');
    if (realFilters) realFilters.classList.remove('hidden');

    // Category
    renderCheckboxes('category', facets.categories, selectedCategories);
    // State
    renderCheckboxes('state', facets.states, selectedStates);
    // Ministry
    renderCheckboxes('ministry', facets.ministries, selectedMinistries);
    // Level
    renderCheckboxes('level', facets.levels, selectedLevels);
  }

  function renderCheckboxes(containerKey, items, stateList) {
    const container = document.getElementById(`accordion-content-${containerKey}`);
    if (!container) return;

    container.innerHTML = items.map(item => {
      const isChecked = stateList.includes(item);
      return `
        <label class="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] py-0.5">
          <input 
            type="checkbox" 
            data-type="${containerKey}" 
            data-value="${encodeURIComponent(item)}"
            ${isChecked ? 'checked' : ''}
            class="accent-[var(--color-primary)] rounded border-[var(--border-color)]"
          />
          <span class="line-clamp-1">${item}</span>
        </label>
      `;
    }).join('');

    // Bind event listeners to checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const type = e.target.getAttribute('data-type');
        const val = decodeURIComponent(e.target.getAttribute('data-value'));
        currentPage = 1;
        
        let targetList = [];
        if (type === 'category') targetList = selectedCategories;
        else if (type === 'state') targetList = selectedStates;
        else if (type === 'ministry') targetList = selectedMinistries;
        else if (type === 'level') targetList = selectedLevels;

        const idx = targetList.indexOf(val);
        if (idx > -1) {
          targetList.splice(idx, 1);
        } else {
          targetList.push(val);
        }

        applyFiltersAndRender();
      });
    });
  }

  // Main compute function
  function applyFiltersAndRender() {
    // 1. Filter items in memory
    const filtered = schemesData.filter(item => {
      const f = item.fields;

      // Text Search query
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = f.schemeName?.toLowerCase().includes(query);
        const matchesDesc = f.briefDescription?.toLowerCase().includes(query);
        const matchesTags = f.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchesMinistry = f.nodalMinistryName?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesDesc && !matchesTags && !matchesMinistry) return false;
      }

      // Tab filter
      if (selectedTab === 'Central' && f.level !== 'Central') return false;
      if (selectedTab === 'State' && f.level !== 'State') return false;

      // Sidebar Level
      if (selectedLevels.length > 0 && !selectedLevels.includes(f.level)) return false;

      // Sidebar State
      if (selectedStates.length > 0) {
        const hasState = f.beneficiaryState?.some(s => selectedStates.includes(s));
        if (!hasState) return false;
      }

      // Sidebar Ministry
      if (selectedMinistries.length > 0 && !selectedMinistries.includes(f.nodalMinistryName)) return false;

      // Sidebar Category
      if (selectedCategories.length > 0) {
        const hasCategory = f.schemeCategory?.some(c => selectedCategories.includes(c));
        if (!hasCategory) return false;
      }

      return true;
    });

    // 2. Sort items
    if (sortOption === 'name-asc') {
      filtered.sort((a, b) => (a.fields.schemeName || '').localeCompare(b.fields.schemeName || ''));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => (b.fields.schemeName || '').localeCompare(a.fields.schemeName || ''));
    }

    // 3. Page items
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    // 4. Render UI
    renderSchemeList(paginated);
    renderPaginationBar(totalPages);
    renderCountsInfo(totalItems, startIndex, paginated.length);
    renderResetState();
  }

  // Output cards to list container
  function renderSchemeList(items) {
    if (items.length === 0) {
      schemesListContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
          <svg class="h-12 w-12 text-[var(--border-color)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-semibold">No schemes found matching your filters</p>
          <button id="clear-all-inline-btn" class="mt-4 text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none">
            Clear all search filters
          </button>
        </div>
      `;
      const inlineBtn = document.getElementById('clear-all-inline-btn');
      if (inlineBtn) inlineBtn.addEventListener('click', clearAllFilters);
      return;
    }

    schemesListContainer.innerHTML = items.map(item => {
      const f = item.fields;
      const slug = f.slug || '';
      
      const levelBadge = f.level ? `
        <span class="rounded bg-[var(--badge-bg)] text-[var(--badge-text)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          ${escapeHTML(f.level)}
        </span>
      ` : '';

      const categoryBadges = f.schemeCategory ? f.schemeCategory.map(cat => `
        <span class="rounded bg-emerald-50 dark:bg-emerald-950/30 text-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          ${escapeHTML(cat)}
        </span>
      `).join('') : '';

      const tagsMarkup = f.tags && f.tags.length > 0 ? `
        <div class="mt-4 flex flex-wrap gap-1 border-t border-[var(--border-color)] pt-3">
          ${f.tags.slice(0, 5).map(tag => `
            <span class="rounded bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 text-[10px] font-medium border border-[var(--border-color)]">
              #${escapeHTML(tag)}
            </span>
          `).join('')}
          ${f.tags.length > 5 ? `
            <span class="text-[10px] text-[var(--text-muted)] self-center pl-1">
              +${f.tags.length - 5} more
            </span>
          ` : ''}
        </div>
      ` : '';

      // Support pretty URL routing using HTACCESS (e.g. /schemes/slug-name)
      return `
        <article class="hover-scale flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-card)] p-6 transition-all duration-300">
          <div>
            <div class="flex flex-wrap gap-2 mb-3">
              ${levelBadge}
              ${categoryBadges}
            </div>
            <h4 class="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors font-heading leading-tight">
              <a href="/schemes/${slug}">${escapeHTML(f.schemeName)}</a>
            </h4>
            <p class="mt-1 text-xs text-[var(--text-muted)] font-medium">
              ${escapeHTML(f.nodalMinistryName || '')}
            </p>
            <p class="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
              ${escapeHTML(f.briefDescription || '')}
            </p>
          </div>
          ${tagsMarkup}
        </article>
      `;
    }).join('');
  }

  // Render bottom page controls
  function renderPaginationBar(totalPages) {
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const maxVisiblePages = 5;
    let pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    const prevDisabled = currentPage === 1;
    const nextDisabled = currentPage === totalPages;

    const pageButtons = pages.map(page => `
      <button 
        data-page="${page}"
        class="h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentPage === page 
            ? 'bg-[var(--color-primary)] text-white shadow-sm' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
        }"
      >
        ${page}
      </button>
    `).join('');

    const firstPageEllipsis = (currentPage > 3 && totalPages > 5) ? `
      <button data-page="1" class="h-8 w-8 rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]">1</button>
      ${currentPage > 4 ? '<span class="text-xs text-[var(--text-muted)] px-1">...</span>' : ''}
    ` : '';

    const lastPageEllipsis = (currentPage < totalPages - 2 && totalPages > 5) ? `
      ${currentPage < totalPages - 3 ? '<span class="text-xs text-[var(--text-muted)] px-1">...</span>' : ''}
      <button data-page="${totalPages}" class="h-8 w-8 rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]">${totalPages}</button>
    ` : '';

    paginationContainer.className = "flex items-center justify-between border-t border-[var(--border-color)] pt-6";
    paginationContainer.innerHTML = `
      <!-- Prev Button -->
      <button
        id="btn-prev"
        ${prevDisabled ? 'disabled' : ''}
        class="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--color-primary)] disabled:opacity-40 disabled:hover:border-[var(--border-color)] transition-all duration-200"
      >
        ◀ Prev
      </button>

      <!-- Pages list -->
      <div class="flex items-center space-x-1">
        ${firstPageEllipsis}
        ${pageButtons}
        ${lastPageEllipsis}
      </div>

      <!-- Next Button -->
      <button
        id="btn-next"
        ${nextDisabled ? 'disabled' : ''}
        class="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--color-primary)] disabled:opacity-40 disabled:hover:border-[var(--border-color)] transition-all duration-200"
      >
        Next ▶
      </button>
    `;

    // Add list click triggers
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    
    if (prevBtn && !prevDisabled) {
      prevBtn.addEventListener('click', () => {
        currentPage--;
        applyFiltersAndRender();
        scrollToTop();
      });
    }

    if (nextBtn && !nextDisabled) {
      nextBtn.addEventListener('click', () => {
        currentPage++;
        applyFiltersAndRender();
        scrollToTop();
      });
    }

    paginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.getAttribute('data-page'));
        currentPage = page;
        applyFiltersAndRender();
        scrollToTop();
      });
    });
  }

  // Render text counts
  function renderCountsInfo(total, start, pageCount) {
    const countText = total > 0 ? `
      Showing <span class="font-semibold text-[var(--text-primary)]">${start + 1}</span> to <span class="font-semibold text-[var(--text-primary)]">${start + pageCount}</span> of <span class="font-semibold text-[var(--text-primary)]">${total}</span> schemes
    ` : `Showing 0 to 0 of 0 schemes`;

    resultsCountContainer.innerHTML = countText;

    if (debouncedSearch.trim()) {
      filterQueryContainer.classList.remove('hidden');
      filterQueryContainer.innerHTML = `Filtered by: "${escapeHTML(debouncedSearch)}"`;
    } else {
      filterQueryContainer.classList.add('hidden');
    }
  }

  // Toggle clear filters visibility
  function renderResetState() {
    const filtersActive = (selectedLevels.length > 0 || selectedStates.length > 0 || selectedMinistries.length > 0 || selectedCategories.length > 0 || searchQuery.trim() || sortOption !== 'relevance' || selectedTab !== 'All');
    
    if (filtersActive) {
      clearFiltersContainer.classList.remove('hidden');
    } else {
      clearFiltersContainer.classList.add('hidden');
    }
  }

  function clearAllFilters() {
    selectedLevels = [];
    selectedStates = [];
    selectedMinistries = [];
    selectedCategories = [];
    searchQuery = '';
    debouncedSearch = '';
    sortOption = 'relevance';
    selectedTab = 'All';
    currentPage = 1;

    // Reset UI Inputs
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'relevance';

    // Reset Tabs Classes
    const tabs = {
      'All': document.getElementById('tab-all'),
      'Central': document.getElementById('tab-central'),
      'State': document.getElementById('tab-state')
    };
    Object.keys(tabs).forEach(k => {
      const btn = tabs[k];
      if (btn) {
        if (k === 'All') {
          btn.className = "rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 bg-[var(--bg-surface)] text-[var(--color-primary)] shadow-sm";
        } else {
          btn.className = "rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
        }
      }
    });

    // Recheck boxes and render
    renderFacetFilters();
    applyFiltersAndRender();
  }

  // Helpers
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
