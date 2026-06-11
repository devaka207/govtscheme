<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo isset($page_title) ? htmlspecialchars($page_title) : 'Search Schemes | myScheme - One-stop discovery platform of Government schemes'; ?></title>
    <meta name="description" content="<?php echo isset($page_description) ? htmlspecialchars($page_description) : 'myScheme is a national platform that aims to offer one-stop search and discovery of Indian Government schemes. Search over 4,700 schemes.'; ?>" />
    <meta name="keywords" content="myScheme, Government Schemes, India, Search Schemes, Find Eligibility, Sarkari Yojana" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    
    <!-- Compiled Tailwind CSS -->
    <link rel="stylesheet" href="/assets/css/style.css" />

    <!-- Immediate Theme Loader to prevent style flash -->
    <script>
      if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    </script>
  </head>
  <body class="bg-[var(--bg-app)] text-[var(--text-primary)] font-sans transition-colors duration-300">
    <div class="app-container min-h-screen flex flex-col">
      <header class="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface-header)] shadow-[var(--shadow-header)] transition-colors duration-300">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <!-- Logos & Branding -->
          <div class="flex items-center">
            <a href="/" class="flex items-center">
              <!-- Vector Finn Logo -->
              <?php 
                $class = "h-8 w-auto text-[var(--text-primary)] transition-colors duration-300";
                include __DIR__ . '/logo.php'; 
              ?>
            </a>
          </div>

          <!-- Header Controls -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            
            <!-- Language Picker Dropdown -->
            <div class="relative group">
              <button 
                aria-label="Language Selector"
                class="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-card)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-primary)] transition-all duration-200"
              >
                <svg class="h-4 w-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V14a2 2 0 00-2-2h-1.5a3 3 0 01-3-3V7a2 2 0 00-2-2H9.836a6 6 0 00-1.8 1.8z" />
                </svg>
                <span class="hidden sm:inline text-[var(--text-secondary)]">English</span>
              </button>
              <div class="absolute right-0 mt-1 hidden w-32 origin-top-right rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-card)] shadow-lg group-hover:block transition-all duration-200">
                <div class="py-1">
                  <button class="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-surface-hover)] text-[var(--color-primary)] font-semibold">
                    English
                  </button>
                  <button class="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]">
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>

            <!-- Theme Toggle Button -->
            <button 
              id="theme-toggle"
              aria-label="Toggle Theme"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-card)] hover:border-[var(--color-primary)] transition-all duration-200"
            >
              <svg class="hidden dark:block h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 7.072l-.707.707" />
              </svg>
              <svg class="block dark:hidden h-5 w-5 text-gray-500 hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- Sign In Button -->
            <button 
              aria-label="Sign In"
              class="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              Sign In
            </button>

          </div>
        </div>
      </header>
      <main class="main-content flex-grow">
