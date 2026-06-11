import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// ==========================================
// ARCHIVE APPROACH CONFIGURATION
// Set USE_LOCAL_ARCHIVE to true to load from crawled local JSON files
// Set USE_LOCAL_ARCHIVE to false to fetch directly from the live myScheme API
// ==========================================
const USE_LOCAL_ARCHIVE = true;

const apiKey = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

export default function SchemeDetailPage() {
  const { slug } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [scheme, setScheme] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'benefits', 'eligibility', 'exclusions', 'process'

  useEffect(() => {
    const fetchSchemeData = async () => {
      setLoading(true);
      setError(null);

      if (USE_LOCAL_ARCHIVE) {
        // --- 1. FULL STATIC ARCHIVE APPROACH ---
        try {
          // Fetch the unified local JSON file containing details, documents, and FAQs
          const response = await fetch(`/schemes_details/${slug}.json`);
          if (!response.ok) {
            throw new Error(`Failed to load local scheme file (Status: ${response.status}).`);
          }
          const data = await response.json();
          
          if (!data.scheme) {
            throw new Error('Malformed local scheme data.');
          }

          setScheme(data.scheme);
          setDocuments(data.documents);
          setFaqs(data.faqs?.en?.faqs || []);

        } catch (err) {
          console.error("Local archive fetch error:", err);
          setError(err.message || 'Failed to load local archive data.');
        } finally {
          setLoading(false);
        }
      } else {
        // --- 2. DYNAMIC LIVE API FETCH APPROACH ---
        const headers = {
          'x-api-key': apiKey,
          'Origin': 'https://www.myscheme.gov.in',
          'Referer': 'https://www.myscheme.gov.in/'
        };

        try {
          // Fetch main scheme details
          const schemeRes = await fetch(`https://api.myscheme.gov.in/schemes/v6/public/schemes?slug=${slug}&lang=en`, { headers });
          const schemeData = await schemeRes.json();
          
          if (schemeData.statusCode !== 200 || !schemeData.data) {
            throw new Error('Scheme not found or API error.');
          }

          const schemeDetails = schemeData.data;
          setScheme(schemeDetails);
          
          const schemeId = schemeDetails._id;

          // Fetch documents and FAQs in parallel
          const [docsRes, faqsRes] = await Promise.all([
            fetch(`https://api.myscheme.gov.in/schemes/v6/public/schemes/${schemeId}/documents?lang=en`, { headers }),
            fetch(`https://api.myscheme.gov.in/schemes/v6/public/schemes/${schemeId}/faqs?lang=en`, { headers })
          ]);

          const docsJson = await docsRes.json();
          const faqsJson = await faqsRes.json();

          if (docsJson.statusCode === 200) {
            setDocuments(docsJson.data);
          }
          if (faqsJson.statusCode === 200) {
            setFaqs(faqsJson.data?.en?.faqs || []);
          }

        } catch (err) {
          console.error("Live API fetch error:", err);
          setError(err.message || 'Failed to load live scheme details.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSchemeData();
  }, [slug]);

  // Recursively render the Slate-like rich JSON editor blocks returned by the API
  const renderSlateContent = (nodes) => {
    if (!nodes) return null;
    if (typeof nodes === 'string') return <p>{nodes}</p>;
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node, index) => {
      if (!node) return null;
      
      switch (node.type) {
        case 'paragraph':
          return (
            <p key={index} className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              {renderSlateContent(node.children)}
            </p>
          );
        case 'ol_list':
          return (
            <ol key={index} className="list-decimal pl-6 mb-4 space-y-2 text-sm text-[var(--text-secondary)]">
              {renderSlateContent(node.children)}
            </ol>
          );
        case 'ul_list':
          return (
            <ul key={index} className="list-disc pl-6 mb-4 space-y-2 text-sm text-[var(--text-secondary)]">
              {renderSlateContent(node.children)}
            </ul>
          );
        case 'list_item':
          return (
            <li key={index}>
              {renderSlateContent(node.children)}
            </li>
          );
        default:
          // Check for raw text node
          if (node.text !== undefined) {
            let el = node.text;
            if (node.bold) el = <strong className="font-semibold text-[var(--text-primary)]">{el}</strong>;
            if (node.italic) el = <em className="italic">{el}</em>;
            if (node.underline) el = <span className="underline">{el}</span>;
            return <React.Fragment key={index}>{el}</React.Fragment>;
          }
          
          // Render child elements if type is not recognized but has children
          if (node.children) {
            return <React.Fragment key={index}>{renderSlateContent(node.children)}</React.Fragment>;
          }
          return null;
      }
    });
  };

  // FAQ open/close accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--color-primary)]"></div>
        <p className="text-sm font-semibold text-[var(--text-secondary)] animate-pulse">Loading scheme details...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Failed to Load Scheme</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{error || 'Scheme could not be found.'}</p>
        <Link 
          to="/search" 
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-all duration-200"
        >
          Return to Search
        </Link>
      </div>
    );
  }

  const langData = scheme.en;
  const details = langData.basicDetails;
  const content = langData.schemeContent;
  const eligibility = langData.eligibilityCriteria;
  const process = langData.applicationProcess;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top navigation path */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-[var(--text-muted)]">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-[var(--color-primary)]">Search</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)] line-clamp-1">{details.schemeShortTitle || 'Scheme Details'}</span>
      </div>

      {/* Main Grid: Details + Side documents & FAQs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left 2 Columns - Scheme Info */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {details.level?.label && (
                <span className="rounded bg-[var(--badge-bg)] text-[var(--badge-text)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {details.level.label}
                </span>
              )}
              {details.schemeType?.label && (
                <span className="rounded bg-emerald-50 dark:bg-emerald-950/30 text-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {details.schemeType.label}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl mb-2 leading-snug">
              {details.schemeName}
            </h3>
            
            {/* Ministry name */}
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-6">
              {details.nodalMinistryName?.label}
            </p>

            {/* Interactive Tab Headers */}
            <div className="flex flex-wrap border-b border-[var(--border-color)] mb-6 overflow-x-auto">
              {[
                { id: 'details', label: 'Details' },
                { id: 'benefits', label: 'Benefits' },
                { id: 'eligibility', label: 'Eligibility' },
                { id: 'exclusions', label: 'Exclusions' },
                { id: 'process', label: 'How to Apply' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="slate-content min-h-[200px]">
              {activeTab === 'details' && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">About the Scheme</h4>
                  {content?.detailedDescription ? (
                    renderSlateContent(content.detailedDescription)
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">No detailed description available.</p>
                  )}
                </div>
              )}

              {activeTab === 'benefits' && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Scheme Benefits</h4>
                  {content?.benefits ? (
                    renderSlateContent(content.benefits)
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">No benefits details listed.</p>
                  )}
                </div>
              )}

              {activeTab === 'eligibility' && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Eligibility Criteria</h4>
                  {eligibility?.description ? (
                    renderSlateContent(eligibility.description)
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">No eligibility criteria details listed.</p>
                  )}
                </div>
              )}

              {activeTab === 'exclusions' && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Exclusions</h4>
                  {eligibility?.exclusions ? (
                    renderSlateContent(eligibility.exclusions)
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">No exclusion details listed under this scheme.</p>
                  )}
                </div>
              )}

              {activeTab === 'process' && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Application Process</h4>
                  
                  {process?.process ? (
                    <div className="mb-6">
                      <h5 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Process:</h5>
                      {renderSlateContent(process.process)}
                    </div>
                  ) : null}

                  {process?.references ? (
                    <div>
                      <h5 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">References & External Links:</h5>
                      {renderSlateContent(process.references)}
                    </div>
                  ) : null}

                  {!process?.process && !process?.references && (
                    <p className="text-xs text-[var(--text-muted)]">No application details listed.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Right Column - Side Panels (Documents required + FAQ Accordions) */}
        <aside className="space-y-6">
          
          {/* Documents Required Panel */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)] uppercase tracking-wider">
              Documents Required
            </h4>
            <div className="slate-content">
              {documents?.en?.documents_required ? (
                renderSlateContent(documents.en.documents_required)
              ) : (
                <p className="text-xs text-[var(--text-muted)]">No document requirements specified.</p>
              )}
            </div>
          </div>

          {/* FAQs Panel */}
          {faqs.length > 0 && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-[var(--card-shadow)]">
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)] uppercase tracking-wider">
                Frequently Asked Questions
              </h4>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="flex w-full items-center justify-between text-left text-xs font-bold text-[var(--text-primary)] py-1 focus:outline-none hover:text-[var(--color-primary)] transition-colors duration-200"
                    >
                      <span>{faq.question}</span>
                      <span className="ml-2 text-xs flex-shrink-0 text-[var(--text-muted)]">
                        {openFaqIndex === index ? '▲' : '▼'}
                      </span>
                    </button>
                    {openFaqIndex === index && (
                      <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed animate-fade-in slate-content">
                        {renderSlateContent(faq.answer)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>

      </div>
      
    </div>
  );
}
