<?php
$page_title = 'Search Schemes | FinnDot - Discover Government Schemes';
$page_description = 'Discover and search through over 4,700 government schemes on our replica platform, optimized for speed and complete offline cached details access.';
include __DIR__ . '/includes/header.php';
?>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  
  <!-- Top Breadcrumb & Clean Header -->
  <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <div class="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
        <a href="/" class="hover:text-[var(--color-primary)]">Home</a>
        <span>/</span>
        <span class="text-[var(--text-secondary)]">Search Schemes</span>
      </div>
      <h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)] font-sans">
        Discover Government Schemes
      </h2>
    </div>
    
    <!-- Reset button (visible dynamically) -->
    <div id="clear-filters-container" class="hidden">
      <button 
        id="clear-filters-btn"
        class="flex items-center space-x-1 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/45 transition-all duration-200"
      >
        Clear All Filters
      </button>
    </div>
  </div>

  <div class="flex flex-col gap-8 lg:flex-row">
    
    <!-- Left Column - Filters Panel -->
    <aside class="w-full lg:w-1/4 flex-shrink-0 animate-slide-left">
      <div class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-[var(--card-shadow)]">
        <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)]">Filters</h3>
        
        <!-- Accordion Filters Container -->
        <div id="filters-accordion-container" class="space-y-4">
          <!-- Filter Skeletons -->
          <div id="filter-skeletons" class="space-y-5 animate-pulse">
            <?php for ($i=0; $i<4; $i++): ?>
            <div class="border-b border-[var(--border-color)] pb-4 last:border-0 last:pb-0">
              <div class="flex items-center justify-between font-bold text-sm text-[var(--text-primary)] mb-3">
                <span class="skeleton h-4 w-24 rounded"></span>
                <span class="text-[var(--text-muted)] text-[10px]">▼</span>
              </div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <span class="skeleton h-3.5 w-3.5 rounded"></span>
                  <span class="skeleton h-3.5 w-2/3 rounded"></span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="skeleton h-3.5 w-3.5 rounded"></span>
                  <span class="skeleton h-3.5 w-1/2 rounded"></span>
                </div>
              </div>
            </div>
            <?php endfor; ?>
          </div>

          <!-- Real Filters (Initially hidden, rendered via JS) -->
          <div id="real-filters" class="hidden space-y-4">
            <!-- Category Filter -->
            <div class="border-b border-[var(--border-color)] pb-3">
              <button id="accordion-toggle-category" class="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1 focus:outline-none">
                <span>Category</span>
                <span id="accordion-icon-category" class="transform transition-transform duration-200 rotate-180">▼</span>
              </button>
              <div id="accordion-content-category" class="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                <!-- Categories render here -->
              </div>
            </div>

            <!-- State Filter -->
            <div class="border-b border-[var(--border-color)] pb-3">
              <button id="accordion-toggle-state" class="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1 focus:outline-none">
                <span>State</span>
                <span id="accordion-icon-state" class="transform transition-transform duration-200">▼</span>
              </button>
              <div id="accordion-content-state" class="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1 hidden">
                <!-- States render here -->
              </div>
            </div>

            <!-- Ministry Filter -->
            <div class="border-b border-[var(--border-color)] pb-3">
              <button id="accordion-toggle-ministry" class="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1 focus:outline-none">
                <span>Nodal Ministry</span>
                <span id="accordion-icon-ministry" class="transform transition-transform duration-200">▼</span>
              </button>
              <div id="accordion-content-ministry" class="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1 hidden">
                <!-- Ministries render here -->
              </div>
            </div>

            <!-- Level Filter -->
            <div class="pb-1">
              <button id="accordion-toggle-level" class="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1 focus:outline-none">
                <span>Level</span>
                <span id="accordion-icon-level" class="transform transition-transform duration-200 rotate-180">▼</span>
              </button>
              <div id="accordion-content-level" class="mt-2 space-y-2">
                <!-- Levels render here -->
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>

    <!-- Right Column - Results area -->
    <main class="w-full lg:w-3/4 flex-grow space-y-6 animate-fade-in">
      
      <!-- Tabs and search filters bar -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border-color)]">
        
        <!-- Sector Tabs -->
        <div class="flex space-x-2 rounded-lg bg-[var(--badge-bg)] p-1">
          <button id="tab-all" class="rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 bg-[var(--bg-surface)] text-[var(--color-primary)] shadow-sm">
            All Schemes
          </button>
          <button id="tab-central" class="rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Central Schemes
          </button>
          <button id="tab-state" class="rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            State Schemes
          </button>
        </div>

        <!-- Sort options -->
        <div class="flex items-center space-x-2">
          <span class="text-xs text-[var(--text-secondary)] font-medium">Sort By:</span>
          <select 
            id="sort-select"
            class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] outline-none hover:border-[var(--color-primary)] transition-all duration-200"
          >
            <option value="relevance">Relevance</option>
            <option value="name-asc">Scheme Name (A-Z)</option>
            <option value="name-desc">Scheme Name (Z-A)</option>
          </select>
        </div>

      </div>

      <!-- Search bar input container -->
      <div class="relative flex items-center">
        <input 
          id="search-input"
          type="text" 
          placeholder="Loading schemes database... please wait."
          disabled
          class="custom-input w-full pr-12 text-sm disabled:opacity-60"
        />
        <div class="absolute right-4 text-[var(--text-muted)] pointer-events-none">
          <div id="search-loading-spinner" class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[var(--color-primary)]"></div>
          <svg id="search-icon" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Counts & Status -->
      <div class="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div id="results-count-container">
          <span class="skeleton h-4 w-48 rounded"></span>
        </div>
        <div id="filter-query-container" class="italic hidden"></div>
      </div>

      <!-- Schemes List Container -->
      <div id="schemes-list-container" class="space-y-4">
        <!-- Skeletons initially -->
        <?php for ($i=0; $i<6; $i++): ?>
        <article class="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-card)] p-6 space-y-4">
          <div>
            <div class="flex gap-2">
              <span class="skeleton h-4 w-12 rounded"></span>
              <span class="skeleton h-4 w-24 rounded"></span>
            </div>
            <div class="skeleton h-6 w-3/4 rounded mt-3"></div>
            <div class="skeleton h-3.5 w-1/3 rounded mt-2"></div>
            <div class="space-y-2 mt-4">
              <div class="skeleton h-3 w-full rounded"></div>
              <div class="skeleton h-3 w-5/6 rounded"></div>
            </div>
          </div>
          <div class="flex gap-2 pt-3 border-t border-[var(--border-color)] mt-4">
            <span class="skeleton h-4 w-14 rounded"></span>
            <span class="skeleton h-4 w-16 rounded"></span>
            <span class="skeleton h-4 w-12 rounded"></span>
          </div>
        </article>
        <?php endfor; ?>
      </div>

      <!-- Pagination Container -->
      <div id="pagination-container">
        <!-- Rendered via JS -->
      </div>

    </main>
  </div>

</div>

<!-- Connect search.js logic -->
<script src="/assets/js/search.js"></script>

<?php
include __DIR__ . '/includes/footer.php';
?>
