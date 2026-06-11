<?php
// Secure parameter check
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
// Validate slug format to prevent directory traversal
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $slug)) {
    renderError("Invalid Scheme Request", "The requested scheme URL is malformed or invalid.");
    exit;
}

$detailsPath = __DIR__ . "/schemes_details/{$slug}.json";
if (!file_exists($detailsPath)) {
    renderError("Scheme Not Found", "The scheme you are looking for does not exist in our static archive vault.");
    exit;
}

$rawJson = file_get_contents($detailsPath);
$data = json_decode($rawJson, true);

if (!$data || !isset($data['scheme'])) {
    renderError("Data Corruption", "The cached data for this scheme is malformed or could not be parsed.");
    exit;
}

$scheme = $data['scheme'];
$documents = $data['documents'] ?? null;
$faqs = $data['faqs']['en']['faqs'] ?? [];

$langData = $scheme['en'] ?? null;
if (!$langData) {
    renderError("Language Unavailable", "English language contents for this scheme are not available.");
    exit;
}

$details = $langData['basicDetails'] ?? [];
$content = $langData['schemeContent'] ?? [];
$eligibility = $langData['eligibilityCriteria'] ?? [];
$process = $langData['applicationProcess'] ?? [];

// Define page parameters for header.php
$page_title = ($details['schemeShortTitle'] ?? 'Scheme') . " | FinnDot - Discover Government Schemes";
$page_description = mb_strimwidth(strip_tags(renderSlateContentPlain($content['detailedDescription'] ?? [])), 0, 150, "...");

include __DIR__ . '/includes/header.php';

// Helper function to recursively render Slate JSON to HTML
function renderSlateContent($nodes) {
    if (!$nodes) return '';
    if (is_string($nodes)) return '<p>' . htmlspecialchars($nodes) . '</p>';
    if (!is_array($nodes)) return '';
    
    $html = '';
    foreach ($nodes as $node) {
        if (!$node) continue;
        
        $type = isset($node['type']) ? $node['type'] : '';
        switch ($type) {
            case 'paragraph':
                $html .= '<p class="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">';
                $html .= renderSlateContent($node['children'] ?? null);
                $html .= '</p>';
                break;
            case 'ol_list':
                $html .= '<ol class="list-decimal pl-6 mb-4 space-y-2 text-sm text-[var(--text-secondary)]">';
                $html .= renderSlateContent($node['children'] ?? null);
                $html .= '</ol>';
                break;
            case 'ul_list':
                $html .= '<ul class="list-disc pl-6 mb-4 space-y-2 text-sm text-[var(--text-secondary)]">';
                $html .= renderSlateContent($node['children'] ?? null);
                $html .= '</ul>';
                break;
            case 'list_item':
                $html .= '<li>';
                $html .= renderSlateContent($node['children'] ?? null);
                $html .= '</li>';
                break;
            default:
                if (isset($node['text'])) {
                    $text = htmlspecialchars($node['text']);
                    if (!empty($node['bold'])) {
                        $text = '<strong class="font-semibold text-[var(--text-primary)]">' . $text . '</strong>';
                    }
                    if (!empty($node['italic'])) {
                        $text = '<em class="italic">' . $text . '</em>';
                    }
                    if (!empty($node['underline'])) {
                        $text = '<span class="underline">' . $text . '</span>';
                    }
                    $html .= $text;
                } else if (isset($node['children'])) {
                    $html .= renderSlateContent($node['children']);
                }
                break;
        }
    }
    return $html;
}

// Sub-helper to extract plain text for SEO Meta Description
function renderSlateContentPlain($nodes) {
    if (!$nodes) return '';
    if (is_string($nodes)) return $nodes;
    if (!is_array($nodes)) return '';
    
    $text = '';
    foreach ($nodes as $node) {
        if (!$node) continue;
        if (isset($node['text'])) {
            $text .= $node['text'];
        } elseif (isset($node['children'])) {
            $text .= renderSlateContentPlain($node['children']);
        }
    }
    return $text;
}

// Standalone error screen renderer
function renderError($title, $msg) {
    $page_title = "Error | FinnDot Search";
    include __DIR__ . '/includes/header.php';
    ?>
    <div class="mx-auto max-w-2xl px-4 py-16 text-center">
        <svg class="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2"><?php echo htmlspecialchars($title); ?></h3>
        <p class="text-sm text-[var(--text-secondary)] mb-6"><?php echo htmlspecialchars($msg); ?></p>
        <a 
          href="/" 
          class="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-all duration-200"
        >
          Return to Search
        </a>
    </div>
    <?php
    include __DIR__ . '/includes/footer.php';
}
?>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  
  <!-- Top navigation path -->
  <div class="mb-6 flex items-center space-x-2 text-xs text-[var(--text-muted)]">
    <a href="/" class="hover:text-[var(--color-primary)]">Home</a>
    <span>/</span>
    <a href="/" class="hover:text-[var(--color-primary)]">Search</a>
    <span>/</span>
    <span class="text-[var(--text-secondary)] line-clamp-1"><?php echo htmlspecialchars($details['schemeShortTitle'] ?? 'Scheme Details'); ?></span>
  </div>

  <!-- Main Grid: Details + Side documents & FAQs -->
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
    
    <!-- Left 2 Columns - Scheme Info -->
    <section class="lg:col-span-2 space-y-6">
      <div class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
        
        <!-- Badges -->
        <div class="flex flex-wrap gap-2 mb-4">
          <?php if (isset($details['level']['label'])): ?>
            <span class="rounded bg-[var(--badge-bg)] text-[var(--badge-text)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <?php echo htmlspecialchars($details['level']['label']); ?>
            </span>
          <?php endif; ?>
          <?php if (isset($details['schemeType']['label'])): ?>
            <span class="rounded bg-emerald-50 dark:bg-emerald-950/30 text-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <?php echo htmlspecialchars($details['schemeType']['label']); ?>
            </span>
          <?php endif; ?>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-bold text-[var(--text-primary)] sm:text-2xl mb-2 leading-snug font-sans">
          <?php echo htmlspecialchars($details['schemeName'] ?? ''); ?>
        </h3>
        
        <!-- Ministry name -->
        <p class="text-xs text-[var(--text-muted)] font-semibold mb-6">
          <?php echo htmlspecialchars($details['nodalMinistryName']['label'] ?? ''); ?>
        </p>

        <!-- Interactive Tab Headers -->
        <div class="flex flex-wrap border-b border-[var(--border-color)] mb-6 overflow-x-auto">
          <?php
          $tabsConfig = [
            ['id' => 'details', 'label' => 'Details'],
            ['id' => 'benefits', 'label' => 'Benefits'],
            ['id' => 'eligibility', 'label' => 'Eligibility'],
            ['id' => 'exclusions', 'label' => 'Exclusions'],
            ['id' => 'process', 'label' => 'How to Apply']
          ];
          foreach ($tabsConfig as $i => $tab):
            $isActive = ($i === 0);
          ?>
            <button
              data-tab="<?php echo $tab['id']; ?>"
              class="tab-btn border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 <?php echo $isActive ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'; ?>"
            >
              <?php echo $tab['label']; ?>
            </button>
          <?php endforeach; ?>
        </div>

        <!-- Tab content panels -->
        <div class="slate-content min-h-[200px]">
          <!-- Details Tab Content -->
          <div id="tab-content-details" class="tab-panel">
            <h4 class="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">About the Scheme</h4>
            <?php 
            if (isset($content['detailedDescription'])) {
                echo renderSlateContent($content['detailedDescription']);
            } else {
                echo '<p class="text-xs text-[var(--text-muted)]">No detailed description available.</p>';
            }
            ?>
          </div>

          <!-- Benefits Tab Content -->
          <div id="tab-content-benefits" class="tab-panel hidden">
            <h4 class="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Scheme Benefits</h4>
            <?php 
            if (isset($content['benefits'])) {
                echo renderSlateContent($content['benefits']);
            } else {
                echo '<p class="text-xs text-[var(--text-muted)]">No benefits details listed.</p>';
            }
            ?>
          </div>

          <!-- Eligibility Tab Content -->
          <div id="tab-content-eligibility" class="tab-panel hidden">
            <h4 class="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Eligibility Criteria</h4>
            <?php 
            if (isset($eligibility['description'])) {
                echo renderSlateContent($eligibility['description']);
            } else {
                echo '<p class="text-xs text-[var(--text-muted)]">No eligibility criteria details listed.</p>';
            }
            ?>
          </div>

          <!-- Exclusions Tab Content -->
          <div id="tab-content-exclusions" class="tab-panel hidden">
            <h4 class="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Exclusions</h4>
            <?php 
            if (isset($eligibility['exclusions'])) {
                echo renderSlateContent($eligibility['exclusions']);
            } else {
                echo '<p class="text-xs text-[var(--text-muted)]">No exclusion details listed under this scheme.</p>';
            }
            ?>
          </div>

          <!-- How to Apply Tab Content -->
          <div id="tab-content-process" class="tab-panel hidden">
            <h4 class="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Application Process</h4>
            <?php if (isset($process['process'])): ?>
              <div class="mb-6">
                <h5 class="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Process:</h5>
                <?php echo renderSlateContent($process['process']); ?>
              </div>
            <?php endif; ?>
            <?php if (isset($process['references'])): ?>
              <div>
                <h5 class="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">References & External Links:</h5>
                <?php echo renderSlateContent($process['references']); ?>
              </div>
            <?php endif; ?>
            <?php if (!isset($process['process']) && !isset($process['references'])): ?>
              <p class="text-xs text-[var(--text-muted)]">No application details listed.</p>
            <?php endif; ?>
          </div>
        </div>

      </div>
    </section>

    <!-- Right Column - Side Panels -->
    <aside class="space-y-6">
      
      <!-- Documents Required Panel -->
      <div class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
        <h4 class="text-sm font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)] uppercase tracking-wider">
          Documents Required
        </h4>
        <div class="slate-content">
          <?php 
          if (isset($documents['en']['documents_required'])) {
              echo renderSlateContent($documents['en']['documents_required']);
          } else {
              echo '<p class="text-xs text-[var(--text-muted)]">No document requirements specified.</p>';
          }
          ?>
        </div>
      </div>

      <!-- FAQs Panel -->
      <?php if (!empty($faqs)): ?>
        <div class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
          <h4 class="text-sm font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)] uppercase tracking-wider">
            Frequently Asked Questions
          </h4>
          <div class="space-y-3">
            <?php foreach ($faqs as $index => $faq): ?>
              <div class="border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                <button
                  data-faq-index="<?php echo $index; ?>"
                  class="faq-toggle-btn flex w-full items-center justify-between text-left text-xs font-bold text-[var(--text-primary)] py-1 focus:outline-none hover:text-[var(--color-primary)] transition-colors duration-200"
                >
                  <span><?php echo htmlspecialchars($faq['question'] ?? ''); ?></span>
                  <span id="faq-arrow-<?php echo $index; ?>" class="ml-2 text-xs flex-shrink-0 text-[var(--text-muted)]">▼</span>
                </button>
                <div id="faq-answer-<?php echo $index; ?>" class="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed hidden slate-content animate-fade-in">
                  <?php echo renderSlateContent($faq['answer'] ?? []); ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endif; ?>

    </aside>

  </div>
  
</div>

<!-- Inline JavaScript for Tabs & Accordions -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  // Tabs switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Deactivate all tabs & panels
      tabBtns.forEach(b => {
        b.classList.remove('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
        b.classList.add('border-transparent', 'text-[var(--text-secondary)]');
      });
      tabPanels.forEach(p => p.classList.add('hidden'));

      // Activate selected tab & panel
      btn.classList.remove('border-transparent', 'text-[var(--text-secondary)]');
      btn.classList.add('border-[var(--color-primary)]', 'text-[var(--color-primary)]');
      
      const targetPanel = document.getElementById(`tab-content-${targetTab}`);
      if (targetPanel) targetPanel.classList.remove('hidden');
    });
  });

  // FAQ toggles logic
  const faqToggles = document.querySelectorAll('.faq-toggle-btn');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const idx = toggle.getAttribute('data-faq-index');
      const answerDiv = document.getElementById(`faq-answer-${idx}`);
      const arrowSpan = document.getElementById(`faq-arrow-${idx}`);

      if (answerDiv && arrowSpan) {
        const isHidden = answerDiv.classList.contains('hidden');
        if (isHidden) {
          answerDiv.classList.remove('hidden');
          arrowSpan.textContent = '▲';
        } else {
          answerDiv.classList.add('hidden');
          arrowSpan.textContent = '▼';
        }
      }
    });
  });
});
</script>

<?php
include __DIR__ . '/includes/footer.php';
?>
