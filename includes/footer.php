      </main> <!-- Closing main-content -->
      <footer class="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface-header)] py-8 transition-colors duration-300">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            <!-- Logo & Powered By -->
            <div class="space-y-4">
              <?php 
                $class = "h-7 w-auto text-[var(--text-primary)] transition-colors duration-300";
                include __DIR__ . '/logo.php'; 
              ?>
              <div class="flex space-x-3">
                <button 
                  aria-label="Connect on Social Media"
                  class="rounded border border-[var(--border-color)] bg-[var(--bg-surface-card)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-200"
                >
                  Connect on Social Media
                </button>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 class="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Quick Links</h4>
              <ul class="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">About Us</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Contact Us</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Screen Reader</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Accessibility Statement</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Frequently Asked Questions (FAQs)</a></li>
              </ul>
            </div>

            <!-- Legal / Secondary Links -->
            <div>
              <h4 class="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Policies</h4>
              <ul class="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Disclaimer</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Terms & Conditions</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Hyperlink Policy</a></li>
                <li><a href="#" class="hover:text-[var(--color-primary)] transition-colors">Copyright Policy</a></li>
              </ul>
            </div>

          </div>

          <div class="mt-8 border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-[var(--text-muted)] text-center sm:text-left">
              © 2026 FinnDot. All rights reserved.
            </p>
            <div class="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
              <span>Last Updated On: 03/05/2026</span>
              <span>|</span>
              <span>Version: v3.1.8</span>
            </div>
          </div>

        </div>
      </footer>
    </div> <!-- Closing app-container -->

    <!-- Global Theme Switcher & Actions Scripts -->
    <script src="/assets/js/theme.js"></script>
  </body>
</html>
