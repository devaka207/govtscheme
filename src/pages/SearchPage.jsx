import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [schemesData, setSchemesData] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('All'); // 'All', 'Central', 'State'
  const [sortOption, setSortOption] = useState('relevance'); // 'relevance', 'name-asc', 'name-desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected filters
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedMinistries, setSelectedMinistries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Accordion toggle states
  const [expandedFilters, setExpandedFilters] = useState({
    level: true,
    state: false,
    ministry: false,
    category: true,
  });

  // Debounce search query to avoid lag in large database filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load the schemes index dynamically
  useEffect(() => {
    fetch('/schemes_index.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load schemes database (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setSchemesData(data);
        setLoadingIndex(false);
      })
      .catch(err => {
        console.error("Error loading schemes index:", err);
        setLoadingIndex(false);
      });
  }, []);

  const renderCardSkeletons = () => {
    return Array.from({ length: 6 }).map((_, idx) => (
      <article key={idx} className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-card)] p-6 space-y-4">
        <div>
          <div className="flex gap-2">
            <span className="skeleton h-4 w-12 rounded"></span>
            <span className="skeleton h-4 w-24 rounded"></span>
          </div>
          <div className="skeleton h-6 w-3/4 rounded mt-3"></div>
          <div className="skeleton h-3.5 w-1/3 rounded mt-2"></div>
          <div className="space-y-2 mt-4">
            <div className="skeleton h-3 w-full rounded"></div>
            <div className="skeleton h-3 w-5/6 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-[var(--border-color)] mt-4">
          <span className="skeleton h-4 w-14 rounded"></span>
          <span className="skeleton h-4 w-16 rounded"></span>
          <span className="skeleton h-4 w-12 rounded"></span>
        </div>
      </article>
    ));
  };

  const renderFilterSkeletons = () => {
    return (
      <div className="space-y-5 animate-pulse">
        {['Category', 'State', 'Nodal Ministry', 'Level'].map((filterName, i) => (
          <div key={i} className="border-b border-[var(--border-color)] pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between font-bold text-sm text-[var(--text-primary)] mb-3">
              <span>{filterName}</span>
              <span className="text-[var(--text-muted)] text-[10px]">▼</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="skeleton h-3.5 w-3.5 rounded"></span>
                <span className="skeleton h-3.5 w-2/3 rounded"></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="skeleton h-3.5 w-3.5 rounded"></span>
                <span className="skeleton h-3.5 w-1/2 rounded"></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="skeleton h-3.5 w-3.5 rounded"></span>
                <span className="skeleton h-3.5 w-3/4 rounded"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Extract all unique values for facets
  const facets = useMemo(() => {
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

    return {
      levels: Array.from(levels).sort(),
      states: Array.from(states).sort(),
      ministries: Array.from(ministries).sort(),
      categories: Array.from(categories).sort()
    };
  }, [schemesData]);

  // Filter schemes in memory
  const filteredSchemes = useMemo(() => {
    return schemesData.filter(item => {
      const f = item.fields;

      // 1. Text Search Filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = f.schemeName?.toLowerCase().includes(query);
        const matchesDesc = f.briefDescription?.toLowerCase().includes(query);
        const matchesTags = f.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchesMinistry = f.nodalMinistryName?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesDesc && !matchesTags && !matchesMinistry) {
          return false;
        }
      }

      // 2. Tab Filter (All, Central, State)
      if (selectedTab === 'Central' && f.level !== 'Central') return false;
      if (selectedTab === 'State' && f.level !== 'State') return false;

      // 3. Left Sidebar Level Filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(f.level)) return false;

      // 4. Left Sidebar State Filter
      if (selectedStates.length > 0) {
        const hasState = f.beneficiaryState?.some(s => selectedStates.includes(s));
        if (!hasState) return false;
      }

      // 5. Left Sidebar Ministry Filter
      if (selectedMinistries.length > 0 && !selectedMinistries.includes(f.nodalMinistryName)) return false;

      // 6. Left Sidebar Category Filter
      if (selectedCategories.length > 0) {
        const hasCategory = f.schemeCategory?.some(c => selectedCategories.includes(c));
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [schemesData, debouncedSearch, selectedTab, selectedLevels, selectedStates, selectedMinistries, selectedCategories]);

  // Sort schemes
  const sortedSchemes = useMemo(() => {
    const sorted = [...filteredSchemes];
    if (sortOption === 'name-asc') {
      sorted.sort((a, b) => (a.fields.schemeName || '').localeCompare(b.fields.schemeName || ''));
    } else if (sortOption === 'name-desc') {
      sorted.sort((a, b) => (b.fields.schemeName || '').localeCompare(a.fields.schemeName || ''));
    }
    // Default relevance sorting is as returned by the index order
    return sorted;
  }, [filteredSchemes, sortOption]);

  // Paginated schemes
  const paginatedSchemes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedSchemes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedSchemes, currentPage]);

  const totalPages = Math.ceil(sortedSchemes.length / itemsPerPage) || 1;

  // Filter helper functions
  const toggleFilter = (value, list, setList) => {
    setCurrentPage(1);
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedLevels([]);
    setSelectedStates([]);
    setSelectedMinistries([]);
    setSelectedCategories([]);
    setSearchQuery('');
    setSortOption('relevance');
    setSelectedTab('All');
    setCurrentPage(1);
  };

  const toggleAccordion = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Pagination page numbers generator
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
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
    return pages;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Breadcrumb & Clean Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
            <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Search Schemes</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-primary)]">
            Discover Government Schemes
          </h2>
        </div>
        
        {/* Reset button */}
        {(selectedLevels.length > 0 || selectedStates.length > 0 || selectedMinistries.length > 0 || selectedCategories.length > 0 || searchQuery) && (
          <button 
            onClick={clearAllFilters}
            className="flex items-center space-x-1 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/45 transition-all duration-200"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        
        {/* Left Column - Filters Panel */}
        <aside className="w-full lg:w-1/4 flex-shrink-0 animate-slide-left">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-[var(--card-shadow)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)]">Filters</h3>
            
            <div className="space-y-4">
              {loadingIndex ? (
                renderFilterSkeletons()
              ) : (
                <>
                  {/* Category Filter Accordion */}
                  <div className="border-b border-[var(--border-color)] pb-3">
                    <button 
                      onClick={() => toggleAccordion('category')}
                      className="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1"
                    >
                      <span>Category</span>
                      <span className={`transform transition-transform duration-200 ${expandedFilters.category ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedFilters.category && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                        {facets.categories.map(cat => (
                          <label key={cat} className="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              checked={selectedCategories.includes(cat)}
                              onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                              className="accent-[var(--color-primary)] rounded border-[var(--border-color)]"
                            />
                            <span>{cat}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* State Filter Accordion */}
                  <div className="border-b border-[var(--border-color)] pb-3">
                    <button 
                      onClick={() => toggleAccordion('state')}
                      className="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1"
                    >
                      <span>State</span>
                      <span className={`transform transition-transform duration-200 ${expandedFilters.state ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedFilters.state && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                        {facets.states.map(st => (
                          <label key={st} className="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              checked={selectedStates.includes(st)}
                              onChange={() => toggleFilter(st, selectedStates, setSelectedStates)}
                              className="accent-[var(--color-primary)] rounded border-[var(--border-color)]"
                            />
                            <span>{st}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ministry Filter Accordion */}
                  <div className="border-b border-[var(--border-color)] pb-3">
                    <button 
                      onClick={() => toggleAccordion('ministry')}
                      className="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1"
                    >
                      <span>Nodal Ministry</span>
                      <span className={`transform transition-transform duration-200 ${expandedFilters.ministry ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedFilters.ministry && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                        {facets.ministries.map(min => (
                          <label key={min} className="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              checked={selectedMinistries.includes(min)}
                              onChange={() => toggleFilter(min, selectedMinistries, setSelectedMinistries)}
                              className="accent-[var(--color-primary)] rounded border-[var(--border-color)]"
                            />
                            <span>{min}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Level Filter Accordion */}
                  <div className="pb-1">
                    <button 
                      onClick={() => toggleAccordion('level')}
                      className="flex w-full items-center justify-between font-bold text-sm text-[var(--text-primary)] py-1"
                    >
                      <span>Level</span>
                      <span className={`transform transition-transform duration-200 ${expandedFilters.level ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedFilters.level && (
                      <div className="mt-2 space-y-2">
                        {facets.levels.map(lvl => (
                          <label key={lvl} className="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              checked={selectedLevels.includes(lvl)}
                              onChange={() => toggleFilter(lvl, selectedLevels, setSelectedLevels)}
                              className="accent-[var(--color-primary)] rounded border-[var(--border-color)]"
                            />
                            <span>{lvl}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column - Results area */}
        <main className="w-full lg:w-3/4 flex-grow space-y-6 animate-fade-in">
          
          {/* Tabs and search filters bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border-color)]">
            
            {/* Sector Tabs */}
            <div className="flex space-x-2 rounded-lg bg-[var(--badge-bg)] p-1">
              {['All', 'Central', 'State'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setSelectedTab(tab); setCurrentPage(1); }}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    selectedTab === tab 
                      ? 'bg-[var(--bg-surface)] text-[var(--color-primary)] shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab === 'All' ? 'All Schemes' : tab === 'Central' ? 'Central Schemes' : 'State Schemes'}
                </button>
              ))}
            </div>

            {/* Sort options */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Sort By:</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] outline-none hover:border-[var(--color-primary)] transition-all duration-200"
              >
                <option value="relevance">Relevance</option>
                <option value="name-asc">Scheme Name (A-Z)</option>
                <option value="name-desc">Scheme Name (Z-A)</option>
              </select>
            </div>

          </div>

          {/* Search bar input container */}
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder={loadingIndex ? "Loading schemes database... please wait." : "Search schemes by name, keyword or department name..."}
              disabled={loadingIndex}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-input w-full pr-12 text-sm disabled:opacity-60"
            />
            <div className="absolute right-4 text-[var(--text-muted)] pointer-events-none">
              {loadingIndex ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[var(--color-primary)]"></div>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Counts & Status */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            {loadingIndex ? (
              <div className="flex items-center space-x-2">
                <span className="skeleton h-4 w-48 rounded"></span>
              </div>
            ) : (
              <div>
                Showing <span className="font-semibold text-[var(--text-primary)]">{sortedSchemes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {Math.min(currentPage * itemsPerPage, sortedSchemes.length)}
                </span>{' '}
                of <span className="font-semibold text-[var(--text-primary)]">{sortedSchemes.length}</span> schemes
              </div>
            )}
            {debouncedSearch && !loadingIndex && <div className="italic">Filtered by: &quot;{debouncedSearch}&quot;</div>}
          </div>

          {/* Schemes List */}
          <div className="space-y-4">
            {loadingIndex ? (
              renderCardSkeletons()
            ) : paginatedSchemes.length > 0 ? (
              paginatedSchemes.map(item => {
                const f = item.fields;
                return (
                  <article 
                    key={item.id} 
                    className="hover-scale flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-card)] p-6 transition-all duration-300"
                  >
                    <div>
                      {/* Top tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {f.level && (
                          <span className="rounded bg-[var(--badge-bg)] text-[var(--badge-text)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {f.level}
                          </span>
                        )}
                        {f.schemeCategory?.map(cat => (
                          <span key={cat} className="rounded bg-emerald-50 dark:bg-emerald-950/30 text-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors">
                        <Link to={`/schemes/${f.slug}`}>{f.schemeName}</Link>
                      </h4>

                      {/* Ministry info */}
                      <p className="mt-1 text-xs text-[var(--text-muted)] font-medium">
                        {f.nodalMinistryName}
                      </p>

                      {/* Description */}
                      <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
                        {f.briefDescription}
                      </p>
                    </div>

                    {/* Tags at bottom */}
                    {f.tags && f.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1 border-t border-[var(--border-color)] pt-3">
                        {f.tags.slice(0, 5).map(tag => (
                          <span key={tag} className="rounded bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 text-[10px] font-medium border border-[var(--border-color)]">
                            #{tag}
                          </span>
                        ))}
                        {f.tags.length > 5 && (
                          <span className="text-[10px] text-[var(--text-muted)] self-center pl-1">
                            +{f.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
                <svg className="h-12 w-12 text-[var(--border-color)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold">No schemes found matching your filters</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-4 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Clear all search filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-[var(--border-color)] pt-6">
              
              {/* Prev Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--color-primary)] disabled:opacity-40 disabled:hover:border-[var(--border-color)] transition-all duration-200"
              >
                ◀ Prev
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button 
                      onClick={() => setCurrentPage(1)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface-hover)] ${currentPage === 1 ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-xs text-[var(--text-muted)]">...</span>}
                  </>
                )}

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      currentPage === page 
                        ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-xs text-[var(--text-muted)]">...</span>}
                    <button 
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface-hover)] ${currentPage === totalPages ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--color-primary)] disabled:opacity-40 disabled:hover:border-[var(--border-color)] transition-all duration-200"
              >
                Next ▶
              </button>

            </nav>
          )}

        </main>
      </div>

    </div>
  );
}
