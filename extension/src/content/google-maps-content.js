// ============================================================================
// Google Maps Scraper - Content Script
// ============================================================================

console.log('[Maps Scraper] ✅ Content script loaded at', new Date().toLocaleTimeString());
console.log('[Maps Scraper] Current URL:', window.location.href);

const CONFIG = {
    SELECTORS: {
        feedContainer: ['div[role="feed"]', 'div[role="main"] div[role="feed"]'],
        listing: ['div[role="feed"] div[role="article"]', 'div[role="feed"] [role="article"]'],
        listingName: ['div[role="article"] span', 'div[role="article"] h3'],
        clickTarget: ['div[role="article"] a', 'a.hfpxzc'],
        panelContainer: ['div[role="main"]', 'aside[role="complementary"]'],
        name: ['h1.DUwDvf', 'h1[data-item-id]', 'div[role="heading"] h1'],
        category: ['button[aria-label*="category"]', 'button span:not(:empty)'],
        rating: ['[role="img"][aria-label*="star"]', 'span[aria-label*="star rating"]', 'span[aria-label*="stars"]'],
        address: ['button[aria-label*="address"]', 'a[aria-label*="address"]', 'div[aria-label*="address"]'],
        website: ['a[aria-label^="Website"]', 'a[aria-label*="website"]', 'a[href*="http"]'],
        phone: ['button[aria-label*="call"]', 'a[aria-label*="phone"]', 'a[href*="tel:"]', 'button span[dir="ltr"]'],
        plusCode: ['button[aria-label*="Plus Code"]', 'button[aria-label*="plus code"]'],
        hours: ['button[aria-label*="Hours"]', 'button[aria-label*="hours"]', 'button[aria-label*="Open"]']
    },
    DEBOUNCE_MS: 800,
    MIN_DELAY_MS: 400,
    MAX_DELAY_MS: 1200,
    DETAIL_MIN_DELAY_MS: 2200,
    DETAIL_MAX_DELAY_MS: 4800,
    LONG_PAUSE_MIN_MS: 8000,
    LONG_PAUSE_MAX_MS: 16000,
    LONG_PAUSE_CHANCE: 0.15,
    SCROLL_DELAY_MIN_MS: 1500,
    SCROLL_DELAY_MAX_MS: 2800
};

// ============================================================================
// Selector Helper - Tries multiple selectors in order
// ============================================================================

function findElement(selectors, root = document) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    for (const selector of selectorArray) {
        const element = root.querySelector(selector);
        if (element) return element;
    }
    return null;
}

function findAllElements(selectors, root = document) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    for (const selector of selectorArray) {
        const elements = root.querySelectorAll(selector);
        if (elements.length > 0) return elements;
    }
    return [];
}

// ============================================================================
// Text-Based Extraction Helper
// ============================================================================
// Google Maps now stores data as plain text content in buttons/links,
// not in aria-labels. This helper searches for elements by text pattern.

function findElementByText(selector, textPattern, root = document) {
    if (!textPattern) return null;
    const elements = root.querySelectorAll(selector);
    const patterns = Array.isArray(textPattern) ? textPattern : [textPattern];

    for (const el of elements) {
        const text = el.textContent?.toLowerCase() || '';
        for (const pattern of patterns) {
            if (text.includes(pattern.toLowerCase())) {
                return el;
            }
        }
    }
    return null;
}

// ============================================================================
// State
// ============================================================================

let isScraping = false;
let panelObserver = null;
let debounceTimer = null;
let capturedNames = new Set(); // dedupe check
let currentSessionKeyword = 'unknown'; // persist keyword across entire scrape session
let shouldScrollToBottom = true; // toggle for scroll behavior

// ============================================================================
// Utilities
// ============================================================================

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function sanitizeValue(value) {
    if (value === null || value === undefined) return 'N/A';
    const str = String(value).trim();
    if (str === '') return 'N/A';
    // Replace newlines and multiple spaces with single space, trim again
    return str.replace(/\s+/g, ' ').trim();
}

function sanitizeEntry(entry) {
    const sanitized = {};
    for (const [key, value] of Object.entries(entry)) {
        // Sanitize all string fields
        if (typeof value === 'string') {
            sanitized[key] = sanitizeValue(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function extractKeyword() {
    const url = window.location.href;

    // Try to extract search query from data parameter (e.g., "!1srock+landscaping+Davis+County!")
    // This handles when you're on a place detail page but searching for something
    const dataMatch = url.match(/!1s([^!]+)!/);
    if (dataMatch) {
        return decodeURIComponent(dataMatch[1].replace(/\+/g, ' '));
    }

    // Try to extract from /search/ path (e.g., "/maps/search/rock+landscaping+Davis+County/@35...")
    const searchMatch = url.match(/\/maps\/search\/([^/@]+)/);
    if (searchMatch) {
        return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    }

    // Try to extract from /place/ path (only if no search query found)
    const placeMatch = url.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch) {
        return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }

    // Fallback: extract from page title (e.g., "rock landscaping Davis County - Google Maps")
    const title = document.title;
    const titleMatch = title.match(/^([^-]+)\s*-\s*Google Maps/);
    if (titleMatch) {
        return titleMatch[1].trim();
    }

    return 'unknown';
}

function extractCoordinates() {
    // Try to extract lat/lng from URL (format: @lat,lng,zoom)
    const url = window.location.href;
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
        return {
            latitude: coordMatch[1],
            longitude: coordMatch[2]
        };
    }
    return { latitude: 'N/A', longitude: 'N/A' };
}

function extractPlaceId() {
    // Try to extract place ID from URL (0x... format)
    const url = window.location.href;
    const placeIdMatch = url.match(/0x[a-f0-9]+/i);
    return placeIdMatch ? placeIdMatch[0] : 'N/A';
}

function extractOpenClosedStatus() {
    // Look for "Open now" or "Closed" text in the hours section
    const hoursEl = findElement(CONFIG.SELECTORS.hours);
    if (!hoursEl) return 'N/A';

    const text = hoursEl.innerText?.toLowerCase() || '';
    const ariaLabel = hoursEl.getAttribute('aria-label')?.toLowerCase() || '';
    const fullText = text + ' ' + ariaLabel;

    if (fullText.includes('open now') || fullText.includes('currently open')) return 'Open';
    if (fullText.includes('closed') || fullText.includes('closes')) return 'Closed';
    if (fullText.includes('open 24')) return 'Open 24h';

    return 'N/A';
}

function extractPriceRange() {
    // Look for price indicator ($, $$, $$$, $$$$)
    const priceElements = Array.from(document.querySelectorAll('span, button, div'))
        .filter(el => {
            const text = el.innerText?.trim() || '';
            return /^\$+$/.test(text) && text.length <= 4;
        });

    if (priceElements.length > 0) {
        return priceElements[0].innerText.trim();
    }

    // Fallback: search for text like "Price: $$$"
    const allText = findElement(CONFIG.SELECTORS.panelContainer)?.innerText || '';
    const priceMatch = allText.match(/\$+/);
    return priceMatch ? priceMatch[0] : 'N/A';
}

function extractDetails() {
    console.log(`[Maps Scraper] 🔎 Extracting details from page...`);

    // Get panel container FIRST, then scope all searches to it
    const panelContainer = findElement(CONFIG.SELECTORS.panelContainer);
    console.log(`[Maps Scraper]   Panel container: ${panelContainer ? '✓' : '✗'}`);

    if (!panelContainer) {
        console.warn('[Maps Scraper] ⚠️ Detail panel not found!');
        return {
            name: 'N/A', category: 'N/A', rating: 'N/A', reviews: 'N/A', address: 'N/A',
            website: 'N/A', phone: 'N/A', plusCode: 'N/A', hours: 'N/A', status: 'N/A',
            priceRange: 'N/A', latitude: 'N/A', longitude: 'N/A', placeId: 'N/A',
            mapsUrl: window.location.href, isSponsored: false, keyword: currentSessionKeyword,
            capturedAt: new Date().toISOString(), source: 'unknown'
        };
    }

    // Name: Try multiple selectors, skip "Results" if found
    let nameEl = findElement(CONFIG.SELECTORS.name, panelContainer);
    let name = nameEl?.innerText?.trim() || 'N/A';

    // If we got "Results" (the Maps UI), look for the actual business name
    if (name === 'Results') {
        const allH1s = Array.from(panelContainer.querySelectorAll('h1'));
        for (const h1 of allH1s) {
            const text = h1.innerText?.trim() || '';
            if (text && text !== 'Results') {
                nameEl = h1;
                name = text;
                break;
            }
        }
    }
    console.log(`[Maps Scraper]   Name: "${name}" ${nameEl ? '✓' : '✗'}`);

    let isSponsored = false;
    const sponsoredBadge = panelContainer.innerText?.toLowerCase().includes('sponsored');
    isSponsored = sponsoredBadge || false;

    // Category: First button in panel (usually right after name)
    const categoryEl = panelContainer.querySelector('button');
    const category = categoryEl?.innerText?.trim() || 'N/A';
    console.log(`[Maps Scraper]   Category: "${category}" ${categoryEl ? '✓' : '✗'}`);

    const ratingEl = findElement(CONFIG.SELECTORS.rating, panelContainer);
    const rating = ratingEl?.innerText?.trim() || 'N/A';
    console.log(`[Maps Scraper]   Rating: "${rating}" ${ratingEl ? '✓' : '✗'}`);

    let reviews = 'N/A';
    const reviewSpans = Array.from(panelContainer.querySelectorAll('span'));
    for (const span of reviewSpans) {
        const text = span.innerText?.trim() || '';
        if (text.match(/^\d+\s*reviews?$/i) || text.match(/^\(\d+\s*reviews?\)$/i)) {
            reviews = text.replace(/[()]/g, '').trim();
            break;
        }
    }
    console.log(`[Maps Scraper]   Reviews: "${reviews}" ${reviews !== 'N/A' ? '✓' : '✗'}`);

    // Address: Look for buttons/links starting with address or containing street patterns
    let address = 'N/A';
    const addressButtons = Array.from(panelContainer.querySelectorAll('button, a')).filter(el => {
        const text = el.innerText?.toLowerCase() || '';
        return text.includes('address') || text.match(/\d+.*(?:st|ave|rd|ln|way|blvd|drive|dr\.)/i);
    });

    if (addressButtons.length > 0) {
        // Prefer the one with most text (likely to be actual address)
        const addressBtn = addressButtons.reduce((prev, curr) =>
            (curr.innerText?.length || 0) > (prev.innerText?.length || 0) ? curr : prev
        );
        if (addressBtn) {
            const fullText = addressBtn.innerText?.trim() || '';
            address = fullText.replace(/^address:\s*/i, '').trim();
            console.log(`[Maps Scraper]   Address: "${address}" ✓`);
        }
    }
    if (address === 'N/A') {
        console.log(`[Maps Scraper]   Address: "N/A" ✗`);
    }

    // Website: Find link with "Website" text (prefer href over text)
    let website = 'N/A';
    const websiteEl = panelContainer.querySelector('a[href*="http"]');
    if (websiteEl) {
        website = websiteEl.href || websiteEl.innerText?.trim() || 'N/A';
    }
    console.log(`[Maps Scraper]   Website: "${website}" ${websiteEl ? '✓' : '✗'}`);

    // Phone: Look for phone number pattern (###) ### - #### or similar
    let phone = 'N/A';
    const allText = panelContainer.innerText || '';
    const phoneMatch = allText.match(/\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/);
    if (phoneMatch) {
        phone = `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`;
        console.log(`[Maps Scraper]   Phone: "${phone}" ✓`);
    } else {
        // Fallback: look for button with "phone" that contains a number
        const phoneButtons = Array.from(panelContainer.querySelectorAll('button, a')).filter(el => {
            const text = el.innerText?.toLowerCase() || '';
            return text.includes('phone') || text.match(/\d/);
        });
        if (phoneButtons.length > 0) {
            // Find the one most likely to be a phone number (has digits, not "send to phone")
            const phoneBtn = phoneButtons.find(btn => {
                const text = btn.innerText?.trim() || '';
                return text.match(/\d/) && !text.toLowerCase().includes('send');
            });
            if (phoneBtn) {
                const fullText = phoneBtn.innerText?.trim() || '';
                phone = fullText.replace(/^phone:\s*/i, '').trim();
                console.log(`[Maps Scraper]   Phone: "${phone}" ✓`);
            }
        }
        if (phone === 'N/A') {
            console.log(`[Maps Scraper]   Phone: "N/A" ✗`);
        }
    }

    // Plus Code: Find button with "Plus code:" text within panel
    const plusEl = findElementByText('button', 'plus code', panelContainer);
    let plusCode = 'N/A';
    if (plusEl) {
        const fullText = plusEl.innerText?.trim() || '';
        const match = fullText.match(/plus\s+code:\s*([A-Z0-9+]+)/i);
        if (match) {
            plusCode = match[1];
        } else {
            plusCode = fullText.replace(/^plus\s+code:\s*/i, '').trim();
        }
    }
    console.log(`[Maps Scraper]   Plus Code: "${plusCode}" ${plusEl ? '✓' : '✗'}`);

    // Hours: Find button with "Hours", "Open", or "Closes" text within panel
    const hoursEl = findElementByText('button', ['hours', 'open', 'closes'], panelContainer);
    let hours = 'N/A';
    if (hoursEl) {
        const text = hoursEl.innerText?.trim();
        if (text) hours = text;
    }
    console.log(`[Maps Scraper]   Hours: "${hours}" ${hoursEl ? '✓' : '✗'}`);

    if (name === 'N/A') {
        console.warn('[Maps Scraper] ⚠️ NAME NOT FOUND! Page structure may have changed.');
        console.log('[Maps Scraper] H1 elements in panel:', Array.from(panelContainer.querySelectorAll('h1')).map(h => h.innerText).slice(0, 5));
    }

    const coords = extractCoordinates();
    const status = extractOpenClosedStatus();
    const priceRange = extractPriceRange();
    const placeId = extractPlaceId();
    const mapsUrl = window.location.href;

    return {
        name,
        category,
        rating,
        reviews,
        address,
        website,
        phone,
        plusCode,
        hours,
        status,
        priceRange,
        latitude: coords.latitude,
        longitude: coords.longitude,
        placeId,
        mapsUrl,
        isSponsored,
        keyword: currentSessionKeyword,
        capturedAt: new Date().toISOString(),
        source: 'unknown'
    };
}

function alreadyCaptured(name) {
    return capturedNames.has(name.toLowerCase());
}

function markCaptured(name) {
    capturedNames.add(name.toLowerCase());
}

function extractPlaceIdFromListing(listingEl) {
    // Try to extract place ID from the listing's href
    const clickTarget = listingEl.querySelector(CONFIG.SELECTORS.clickTarget);
    if (clickTarget && clickTarget.href) {
        const placeIdMatch = clickTarget.href.match(/0x[a-f0-9]+/i);
        if (placeIdMatch) return placeIdMatch[0];
    }
    return 'N/A';
}

// ============================================================================
// Passive Capture - Mutation Observer
// ============================================================================

function initPassiveCapture() {
    if (panelObserver) return;

    currentSessionKeyword = extractKeyword(); // Capture keyword when passive mode starts
    console.log(`[Maps Scraper] Passive capture activated for keyword: "${currentSessionKeyword}"`);

    const panelContainer = findElement(CONFIG.SELECTORS.panelContainer);

    if (!panelContainer) {
        console.warn('[Maps Scraper] Panel container not found');
        return;
    }

    const observer = new MutationObserver(() => {
        console.log('[Maps Scraper] 🔄 DOM mutation detected, debouncing...');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const nameEl = document.querySelector(CONFIG.SELECTORS.name);
            if (nameEl && !alreadyCaptured(nameEl.innerText)) {
                const entry = extractDetails();
                entry.source = 'passive';
                markCaptured(entry.name);
                saveEntry(entry);
                console.log(`[Maps Scraper] ✅ Passive captured: "${entry.name}"`);
            } else if (nameEl) {
                console.log(`[Maps Scraper] ⏭️ Already captured: "${nameEl.innerText}"`);
            }
        }, CONFIG.DEBOUNCE_MS);
    });

    observer.observe(panelContainer, { childList: true, subtree: true });
    panelObserver = observer;
    console.log('[Maps Scraper] Passive capture initialized');
}

function stopPassiveCapture() {
    if (panelObserver) {
        panelObserver.disconnect();
        panelObserver = null;
        clearTimeout(debounceTimer);
        console.log('[Maps Scraper] Passive capture stopped');
    }
}

// ============================================================================
// Bulk Scrape
// ============================================================================

async function loadCapturedNames() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
            // Load all captured names and placeIds to skip duplicates efficiently
            capturedNames = new Set(results.map(r => r.name.toLowerCase()));
            console.log(`[Maps Scraper] Loaded ${results.length} existing results to check against`);
            resolve();
        });
    });
}

async function scrollListingIntoView(targetPlaceId, targetName) {
    console.log(`[Maps Scraper] Scrolling listing into view: ${targetName} (${targetPlaceId})`);

    try {
        // Find the listing by placeId
        const listings = findAllElements(CONFIG.SELECTORS.listing);
        let targetListing = null;

        for (const listing of listings) {
            const placeId = extractPlaceIdFromListing(listing);
            if (placeId === targetPlaceId) {
                targetListing = listing;
                console.log(`[Maps Scraper] Found listing, scrolling into view...`);
                break;
            }
        }

        if (!targetListing) {
            console.log(`[Maps Scraper] Listing not found on page`);
            return;
        }

        // Scroll into view
        targetListing.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight it temporarily
        const originalBg = targetListing.style.backgroundColor;
        targetListing.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
        targetListing.style.transition = 'background-color 0.3s';

        setTimeout(() => {
            targetListing.style.backgroundColor = originalBg;
        }, 2000);

        console.log(`[Maps Scraper] ✅ Scrolled listing into view`);
    } catch (err) {
        console.error('[Maps Scraper] Error scrolling listing:', err);
    }
}

async function enrichSingleResult(targetPlaceId, targetName, mapsUrl) {
    console.log(`[Maps Scraper] Attempting to enrich: ${targetName} (${targetPlaceId})`);
    console.log(`[Maps Scraper] Maps URL: ${mapsUrl}`);

    try {
        // Check if detail panel is already open (user clicked listing manually)
        let panelContainer = document.querySelector(CONFIG.SELECTORS.panelContainer)
            || document.querySelector(CONFIG.SELECTORS.panelContainerAlt);

        if (panelContainer && document.querySelector(CONFIG.SELECTORS.name)) {
            console.log(`[Maps Scraper] ✅ Detail panel already open, extracting data now...`);
        } else {
            // Fallback: Find and click listing if panel not open
            console.log(`[Maps Scraper] ⏳ Panel not open, searching for listing...`);

            const listings = findAllElements(CONFIG.SELECTORS.listing);
            let targetListing = null;

            for (const listing of listings) {
                const placeId = extractPlaceIdFromListing(listing);
                if (placeId === targetPlaceId) {
                    targetListing = listing;
                    console.log(`[Maps Scraper] ✅ Found listing`);
                    break;
                }
            }

            if (!targetListing) {
                console.log(`[Maps Scraper] ❌ Could not find listing with Place ID ${targetPlaceId}`);
                console.log(`[Maps Scraper] 💡 Try clicking the listing manually first, then click Fetch Data again`);
                return;
            }

            console.log(`[Maps Scraper] 🖱️ Clicking listing to open detail panel...`);

            // Scroll listing into view first
            targetListing.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(500);

            // Click the listing
            const clickTarget = targetListing.querySelector(CONFIG.SELECTORS.clickTarget) || targetListing;
            const clickHandler = (e) => {
                if (clickTarget.tagName === 'A') {
                    e.preventDefault();
                }
            };
            clickTarget.addEventListener('click', clickHandler, true);
            clickTarget.click();
            clickTarget.removeEventListener('click', clickHandler, true);

            console.log(`[Maps Scraper] ⏳ Waiting for detail panel to load...`);
            await sleep(5000);
        }

        // Extract and merge details
        const fullDetails = extractDetails();
        fullDetails.source = 'bulk';

        console.log(`[Maps Scraper] 📊 Extracted all fields:`, {
            name: fullDetails.name,
            category: fullDetails.category,
            rating: fullDetails.rating,
            reviews: fullDetails.reviews,
            phone: fullDetails.phone,
            website: fullDetails.website,
            address: fullDetails.address,
            hours: fullDetails.hours,
            plusCode: fullDetails.plusCode,
            status: fullDetails.status,
            priceRange: fullDetails.priceRange,
            placeId: fullDetails.placeId
        });

        await mergeEntry(fullDetails);
        console.log(`[Maps Scraper] 📤 Sending ENRICHMENT_COMPLETE message:`, {
            name: fullDetails.name,
            source: fullDetails.source,
            placeId: fullDetails.placeId
        });
        sendMessage({ type: 'ENRICHMENT_COMPLETE', entry: fullDetails });
        console.log(`[Maps Scraper] ✅ Single enrichment complete`);
    } catch (err) {
        console.error('[Maps Scraper] Error enriching single result:', err);
    }
}

async function bulkScrape(options = {}) {
    isScraping = true;
    shouldScrollToBottom = options.scrollToBottom !== false;
    const statusFilter = options.statusFilter || 'all';
    currentSessionKeyword = extractKeyword(); // Capture keyword ONCE at start
    console.log(`[Maps Scraper] Starting bulk scrape for keyword: "${currentSessionKeyword}"`);
    console.log(`[Maps Scraper] Scroll to bottom: ${shouldScrollToBottom}`);
    console.log(`[Maps Scraper] Status filter: ${statusFilter}`);

    // Send current keyword to popup
    sendMessage({ type: 'KEYWORD_ACTIVE', keyword: currentSessionKeyword });

    // Load already-captured names from storage to avoid clicking duplicates
    await loadCapturedNames();

    // Pre-load results into a map for fast lookups in Phase 2
    const placeIdMap = await new Promise((resolve) => {
        chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
            const map = new Map(results.map(r => [r.placeId, r]));
            resolve(map);
        });
    });

    try {
        // Phase 1: Scroll and collect all listings
        const listings = await phase1ScrollCollect();
        const total = listings.length;
        console.log(`[Maps Scraper] Found ${total} listings`);

        // Capture place IDs during Phase 1 so we can find listings by ID after navigation
        const listingPlaceIds = listings.map(l => extractPlaceIdFromListing(l));

        // Save the search URL so we can return to it after each detail click
        const searchUrl = window.location.href;
        console.log(`[Maps Scraper] Search URL captured: ${searchUrl.substring(0, 100)}...`);

        // Phase 2: Click each and extract details
        for (let i = 0; i < total; i++) {
            if (!isScraping) break; // allow stop signal

            const itemStartTime = Date.now();
            console.log(`[Maps Scraper] ⏱️ [${i + 1}/${total}] Starting item processing...`);

            // After clicking a detail panel, the URL changes to a /place/ URL and the
            // feed disappears. Navigate back using browser history to avoid full page reload.
            if (!window.location.href.includes(searchUrl.split('?')[0].split('@')[0])) {
                console.log(`[Maps Scraper] 🔄 Going back to search results using history...`);
                window.history.back();

                // Wait for URL to change and listings to reappear
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        const currentUrl = window.location.href;
                        const isBackOnSearch = currentUrl.includes(searchUrl.split('?')[0].split('@')[0]);
                        const feed = document.querySelector(CONFIG.SELECTORS.feedContainer)
                            || document.querySelector(CONFIG.SELECTORS.feedContainerAlt);
                        const listings = findAllElements(CONFIG.SELECTORS.listing);

                        if (isBackOnSearch && feed && listings.length > 0) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 500);

                    // Timeout after 10 seconds
                    setTimeout(() => {
                        clearInterval(check);
                        resolve();
                    }, 10000);
                });

                await sleep(rand(1000, 2000));
                console.log(`[Maps Scraper] ✅ Back on search results, ${document.querySelectorAll(CONFIG.SELECTORS.listing).length} listings visible`);
            }

            // Re-query fresh listings and find our target by placeId or index
            const freshListings = document.querySelectorAll(CONFIG.SELECTORS.listing);
            const targetPlaceId = listingPlaceIds[i];

            let listing = null;
            if (targetPlaceId && targetPlaceId !== 'N/A') {
                for (const el of freshListings) {
                    if (extractPlaceIdFromListing(el) === targetPlaceId) {
                        listing = el;
                        break;
                    }
                }
            }
            // Fallback to index if placeId lookup fails
            if (!listing) {
                listing = freshListings[i] || null;
            }

            if (!listing) {
                console.log(`[Maps Scraper] [${i + 1}/${total}] Listing no longer in DOM, skipping`);
                sendProgress(i + 1, total, null);
                continue;
            }

            // Scroll the listing into view so it's clickable
            listing.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(300);
            const name = listing.querySelector(CONFIG.SELECTORS.listingName)?.innerText?.trim() || 'N/A';
            const placeId = extractPlaceIdFromListing(listing);

            console.log(`[Maps Scraper] [${i + 1}/${total}] Processing: "${name}"`);

            // Skip based on filter (using pre-loaded map for fast lookups)
            if (placeId !== 'N/A') {
                const existing = placeIdMap.get(placeId);
                if (existing) {
                    if (statusFilter === 'pending' && existing.source === 'bulk') {
                        console.log(`[Maps Scraper] ⏭️  Already attempted enrichment, skipping (filter: pending)`);
                        sendProgress(i + 1, total, null);
                        continue;
                    }

                    if (statusFilter !== 'pending') {
                        const isComplete = existing.source === 'bulk' || (
                            (existing.phone && existing.phone !== 'N/A') ||
                            (existing.website && existing.website !== 'N/A') ||
                            (existing.address && existing.address !== 'N/A') ||
                            (existing.hours && existing.hours !== 'N/A')
                        );
                        if (isComplete) {
                            console.log(`[Maps Scraper] ⏭️  Already have complete data, skipping`);
                            sendProgress(i + 1, total, null);
                            continue;
                        }
                    }
                }
            }

            // Human-like delay before clicking
            const delayBefore = rand(CONFIG.MIN_DELAY_MS, CONFIG.MAX_DELAY_MS);
            console.log(`[Maps Scraper] ⏳ Waiting ${delayBefore}ms before click...`);
            await sleep(delayBefore);

            const clickTarget = listing.querySelector(CONFIG.SELECTORS.clickTarget) || listing;
            const currentUrl = window.location.href;
            console.log(`[Maps Scraper] 🖱️  Clicking... (URL before: ${currentUrl.substring(0, 100)}...)`);

            // Prevent navigation to full page while allowing sidebar panel to load
            const clickHandler = (e) => {
                if (clickTarget.tagName === 'A') {
                    e.preventDefault();
                }
            };
            clickTarget.addEventListener('click', clickHandler, true);
            clickTarget.click();
            clickTarget.removeEventListener('click', clickHandler, true);

            // Wait for panel to load
            const delayAfter = rand(CONFIG.DETAIL_MIN_DELAY_MS, CONFIG.DETAIL_MAX_DELAY_MS);
            console.log(`[Maps Scraper] ⏳ Waiting ${delayAfter}ms for panel to load...`);
            await sleep(delayAfter);

            const urlAfter = window.location.href;
            console.log(`[Maps Scraper] 📄 URL after click: ${urlAfter.substring(0, 100)}...`);

            // Extract details
            const fullDetails = extractDetails();
            console.log(`[Maps Scraper] ✅ Extracted: "${fullDetails.name}" | Phone: ${fullDetails.phone} | Website: ${fullDetails.website}`);
            fullDetails.source = 'bulk';
            await mergeEntry(fullDetails);

            // Occasional long pause
            if (Math.random() < CONFIG.LONG_PAUSE_CHANCE) {
                const pauseMs = rand(CONFIG.LONG_PAUSE_MIN_MS, CONFIG.LONG_PAUSE_MAX_MS);
                console.log(`[Maps Scraper] 😴 Taking random pause: ${(pauseMs / 1000).toFixed(1)}s...`);
                await sleep(pauseMs);
            }

            // Send current page listings to keep it updated during Phase 2
            const listings = findAllElements(CONFIG.SELECTORS.listing);
            const pageListings = Array.from(listings).map(listing => extractPlaceIdFromListing(listing)).filter(id => id !== 'N/A');
            sendMessage({ type: 'PAGE_LISTINGS', placeIds: pageListings });

            const itemDuration = ((Date.now() - itemStartTime) / 1000).toFixed(1);
            console.log(`[Maps Scraper] ✅ Item [${i + 1}/${total}] complete in ${itemDuration}s`);
            sendProgress(i + 1, total, fullDetails);
        }
    } catch (err) {
        console.error('[Maps Scraper] Error during bulk scrape:', err);
    } finally {
        isScraping = false;
        sendMessage({ type: 'SCRAPE_DONE' });
        console.log('[Maps Scraper] Bulk scrape completed');
    }
}

async function phase1ScrollCollect() {
    const feed = findElement(CONFIG.SELECTORS.feedContainer);

    if (!feed) {
        throw new Error('Feed container not found');
    }

    let prevCount = 0;
    const processedPlaceIds = new Set(); // Track which listings we've already saved

    while (isScraping) {
        const listings = findAllElements(CONFIG.SELECTORS.listing);
        const count = listings.length;

        if (count === prevCount) {
            break;
        }

        // Save basic entry for each NEW listing found during scroll
        const allListings = Array.from(listings);
        for (const listing of allListings) {
            const placeId = extractPlaceIdFromListing(listing);
            // Extract name from the link's aria-label (contains "Name · Visited link" format)
            const clickTarget = listing.querySelector(CONFIG.SELECTORS.clickTarget);
            const name = clickTarget?.getAttribute('aria-label')?.split('·')[0].trim() || 'N/A';

            // Only save if we haven't already processed this placeId
            if (placeId && placeId !== 'N/A' && !processedPlaceIds.has(placeId)) {
                processedPlaceIds.add(placeId);

                // Create basic entry with keyword - will be enriched later in phase2
                const basicEntry = {
                    name,
                    placeId,
                    keyword: currentSessionKeyword,
                    capturedAt: new Date().toISOString(),
                    source: 'partial',  // Mark as incomplete - will be enriched later
                    // Placeholder fields (will be filled in during enrichment)
                    category: 'N/A',
                    rating: 'N/A',
                    reviews: 'N/A',
                    address: 'N/A',
                    website: 'N/A',
                    phone: 'N/A',
                    plusCode: 'N/A',
                    hours: 'N/A',
                    status: 'N/A',
                    priceRange: 'N/A',
                    latitude: 'N/A',
                    longitude: 'N/A',
                    mapsUrl: window.location.href,
                    isSponsored: false
                };

                // Save immediately so results appear in UI as we scroll
                await new Promise((resolve) => {
                    chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
                        const existingIndex = results.findIndex(r => r.placeId === placeId);
                        if (existingIndex === -1) {
                            results.push(basicEntry);
                            console.log(`[Maps Scraper] 📝 Saved partial entry: "${name}" (${placeId})`);
                        }
                        chrome.storage.local.set({ 'pt.observations': results }, resolve);
                    });
                });
            }
        }

        prevCount = count;

        // Send current page listings to popup
        const pageListings = Array.from(listings).map(listing => extractPlaceIdFromListing(listing)).filter(id => id !== 'N/A');
        sendMessage({ type: 'PAGE_LISTINGS', placeIds: pageListings });

        // Only scroll if shouldScrollToBottom is enabled
        if (shouldScrollToBottom) {
            feed.scrollTop = feed.scrollHeight;
            await sleep(rand(CONFIG.SCROLL_DELAY_MIN_MS, CONFIG.SCROLL_DELAY_MAX_MS));
        } else {
            // Just a small delay to let content load without scrolling
            await sleep(rand(CONFIG.SCROLL_DELAY_MIN_MS / 2, CONFIG.SCROLL_DELAY_MAX_MS / 2));
        }
    }

    return Array.from(document.querySelectorAll(CONFIG.SELECTORS.listing));
}

// ============================================================================
// Storage & Communication
// ============================================================================

async function mergeEntry(fullDetails) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
            const sanitized = sanitizeEntry(fullDetails);
            const placeId = sanitized.placeId;
            console.log(`[Maps Scraper] 💾 Merging entry: "${sanitized.name}" (PlaceID: ${placeId})`);

            if (placeId && placeId !== 'N/A') {
                const existingIndex = results.findIndex(r => r.placeId === placeId);
                if (existingIndex !== -1) {
                    results[existingIndex] = { ...results[existingIndex], ...sanitized };
                    console.log(`[Maps Scraper] ✅ Merged into existing entry at index ${existingIndex}`);
                    chrome.storage.local.set({ 'pt.observations': results }, resolve);
                    return;
                }
            }

            results.push(sanitized);
            console.log(`[Maps Scraper] ✅ Saved as new entry (total: ${results.length})`);
            chrome.storage.local.set({ 'pt.observations': results }, resolve);
        });
    });
}

async function saveEntry(entry) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
            const sanitized = sanitizeEntry(entry);
            console.log(`[Maps Scraper] 💾 Saving entry: "${sanitized.name}" (PlaceID: ${sanitized.placeId})`);
            const exists = results.some(r => r.placeId && r.placeId === sanitized.placeId);
            if (!exists) {
                results.push(sanitized);
                console.log(`[Maps Scraper] ✅ Saved successfully (total: ${results.length})`);
                chrome.storage.local.set({ 'pt.observations': results }, resolve);
            } else {
                console.log(`[Maps Scraper] ⏭️ Entry already exists, skipping`);
                resolve();
            }
        });
    });
}

function sendMessage(message) {
    console.log(`[Maps Scraper] 📤 Sending message: "${message.type}"`);
    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
            console.log(`[Maps Scraper] ℹ️ Message sent but no receiver (popup may be closed)`);
        } else {
            console.log(`[Maps Scraper] ✅ Message sent, response:`, response);
        }
    });
}

function sendProgress(done, total, entry) {
    if (entry) {
        const fieldsFound = [
            entry.name !== 'N/A' && 'name',
            entry.category !== 'N/A' && 'category',
            entry.rating !== 'N/A' && 'rating',
            entry.reviews !== 'N/A' && 'reviews',
            entry.address !== 'N/A' && 'address',
            entry.website !== 'N/A' && 'website',
            entry.phone !== 'N/A' && 'phone',
            entry.hours !== 'N/A' && 'hours'
        ].filter(Boolean).length;

        console.log(`[Maps Scraper] 📤 Progress ${done}/${total}:`);
        console.log(`    Name: "${entry.name}"`);
        console.log(`    PlaceID: "${entry.placeId}"`);
        console.log(`    Source: "${entry.source}"`);
        console.log(`    Fields populated: ${fieldsFound}/8 (category, rating, reviews, address, website, phone, hours, placeId)`);
        console.log(`    Full entry:`, {
            name: entry.name,
            category: entry.category,
            rating: entry.rating,
            reviews: entry.reviews,
            address: entry.address,
            website: entry.website,
            phone: entry.phone,
            hours: entry.hours,
            plusCode: entry.plusCode,
            status: entry.status,
            priceRange: entry.priceRange,
            placeId: entry.placeId,
            source: entry.source
        });
    } else {
        console.log(`[Maps Scraper] 📤 Progress ${done}/${total} - (no entry data)`);
    }

    sendMessage({
        type: 'PROGRESS',
        done,
        total,
        entry
    });
}

// ============================================================================
// Message Listener
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[Maps Scraper] 📨 Message received: "${message.type}" at ${new Date().toLocaleTimeString()}`);

    if (message.type === 'ACTIVATE') {
        console.log(`[Maps Scraper] 🔄 ACTIVATE: ${message.active ? 'Starting' : 'Stopping'} passive capture`);
        if (message.active) {
            initPassiveCapture();
        } else {
            stopPassiveCapture();
        }
        sendResponse({ success: true });
    } else if (message.type === 'BULK_SCRAPE') {
        console.log(`[Maps Scraper] 🚀 BULK_SCRAPE started - scrollToBottom: ${message.scrollToBottom}, filter: ${message.statusFilter}`);
        if (!isScraping) {
            bulkScrape({
                scrollToBottom: message.scrollToBottom,
                statusFilter: message.statusFilter
            }).catch(err => {
                console.error('[Maps Scraper] ❌ BULK_SCRAPE error:', err);
            });
        } else {
            console.log('[Maps Scraper] ⚠️ Scrape already in progress, ignoring new request');
        }
        sendResponse({ success: true });
    } else if (message.type === 'STOP_SCRAPE') {
        console.log('[Maps Scraper] ⏹️ STOP_SCRAPE received');
        isScraping = false;
        sendResponse({ success: true });
    } else if (message.type === 'LOAD_CAPTURED') {
        console.log('[Maps Scraper] 📂 LOAD_CAPTURED requested');
        chrome.storage.local.get(['pt.observations'], ({ 'pt.observations': results = [] }) => {
            capturedNames = new Set(results.map(r => r.name.toLowerCase()));
            console.log(`[Maps Scraper] ✅ Loaded ${results.length} existing results`);
            sendResponse({ count: results.length });
        });
        return true;
    } else if (message.type === 'ENRICH_SINGLE') {
        console.log(`[Maps Scraper] 🔍 ENRICH_SINGLE requested: "${message.name}" (${message.placeId})`);
        enrichSingleResult(message.placeId, message.name, message.mapsUrl).catch(err => {
            console.error('[Maps Scraper] ❌ ENRICH_SINGLE error:', err);
        });
        sendResponse({ success: true });
    } else if (message.type === 'SCROLL_TO_LISTING') {
        console.log(`[Maps Scraper] 📍 SCROLL_TO_LISTING requested: "${message.name}" (${message.placeId})`);
        scrollListingIntoView(message.placeId, message.name).catch(err => {
            console.error('[Maps Scraper] ❌ SCROLL_TO_LISTING error:', err);
        });
        sendResponse({ success: true });
    } else {
        console.log(`[Maps Scraper] ⚠️ Unknown message type: "${message.type}"`);
    }
});
