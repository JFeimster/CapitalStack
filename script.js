document.documentElement.classList.add("js-enabled");

const REGISTRY_URL = "/data/funding-products.whitelabel.registry.json";
const PRIMARY_APPLICATION_URL = "{{primary_application_url}}";

const fallbackProducts = [
  {
    public_product_name: "Startup Funding Program",
    slug: "startup-funding-program",
    category: "business",
    funding_type: "unsecured_line",
    solution_family: "startup_credit_leverage",
    short_description: "Startup-friendly capital path for founders using credit, income, or eligible personal assets.",
    full_description: "A startup-friendly capital path for founders who need an option before business revenue is fully established.",
    amount_range: { min: 10000, max: 150000 },
    payment_type: "monthly",
    credit_tier: "good",
    minimums: { credit_score: 680, monthly_revenue: 0, time_in_business: "0 months" },
    term_length: "Revolving",
    pricing_summary: "0% intro / variable after",
    speed_to_funding: "2–3 weeks",
    qualification_snapshot: "680+ credit; 0 months in business",
    disqualifiers: ["Recent derogatory credit", "Open bankruptcy"],
    documents_required: ["ID", "Credit authorization", "Income verification"],
    primary_cta: { text: "Check eligibility", url_placeholder: PRIMARY_APPLICATION_URL },
    recommended_audience: ["startups", "founders", "credit-strong operators"],
    urgency_level: "low",
    flags: { featured: true, startup: true, revenue_required: false, collateral_required: false, real_estate: false, ecommerce: false },
    seo: {
      faqs: [
        { question: "Can startups qualify without business revenue?", answer: "Some startup-focused paths may work with limited or no business revenue if the overall profile is strong." }
      ]
    }
  },
  {
    public_product_name: "Fast Working Capital Advance",
    slug: "fast-working-capital-advance",
    category: "business",
    funding_type: "revenue_advance",
    solution_family: "fast_working_capital",
    short_description: "Fast-turn working capital for businesses that need speed and have active revenue.",
    full_description: "A fast working capital route for operators dealing with payroll gaps, inventory needs, or urgent cash-flow pressure.",
    amount_range: { min: 5000, max: 500000 },
    payment_type: "daily / weekly",
    credit_tier: "subprime",
    minimums: { credit_score: 500, monthly_revenue: 10000, time_in_business: "6 months" },
    term_length: "6–24 months",
    pricing_summary: "Factor-rate pricing may apply",
    speed_to_funding: "24 hours",
    qualification_snapshot: "500+ credit; $10,000/month revenue; 6 months in business",
    disqualifiers: ["Recent NSFs", "Unstable deposits"],
    documents_required: ["ID", "Recent bank statements"],
    primary_cta: { text: "Check eligibility", url_placeholder: PRIMARY_APPLICATION_URL },
    recommended_audience: ["small business owners needing fast working capital"],
    urgency_level: "high",
    flags: { featured: true, startup: false, revenue_required: true, collateral_required: false, real_estate: false, ecommerce: false },
    seo: {
      faqs: [
        { question: "How fast can this fund?", answer: "Fast working capital options can move quickly when the revenue profile and documentation support the file." }
      ]
    }
  },
  {
    public_product_name: "Business Line of Credit",
    slug: "business-line-of-credit",
    category: "business",
    funding_type: "revolving_line",
    solution_family: "revolving_access",
    short_description: "Flexible revolving access for businesses that want ongoing draw-based capital.",
    full_description: "A revolving access path for established businesses that want flexible capital instead of a one-and-done lump sum.",
    amount_range: { min: 5000, max: 500000 },
    payment_type: "weekly / monthly",
    credit_tier: "fair",
    minimums: { credit_score: 600, monthly_revenue: 15000, time_in_business: "1 year" },
    term_length: "1–3 years",
    pricing_summary: "Profile-dependent",
    speed_to_funding: "3 days",
    qualification_snapshot: "600+ credit; $15,000/month revenue; 1 year in business",
    disqualifiers: ["Open bankruptcy", "Major tax liens"],
    documents_required: ["ID", "Recent bank statements", "Business basic information"],
    primary_cta: { text: "Check eligibility", url_placeholder: PRIMARY_APPLICATION_URL },
    recommended_audience: ["established businesses needing flexible recurring access"],
    urgency_level: "medium",
    flags: { featured: true, startup: false, revenue_required: true, collateral_required: false, real_estate: false, ecommerce: false },
    seo: {
      faqs: [
        { question: "Who is this best for?", answer: "Businesses that want repeat draw access and can support the requested amount with revenue and credit profile." }
      ]
    }
  },
  {
    public_product_name: "Commercial Real Estate Loan",
    slug: "commercial-real-estate-loan",
    category: "real_estate",
    funding_type: "mortgage",
    solution_family: "real_estate_capital",
    short_description: "Property-focused capital for acquisition, refinance, bridge, rental, or commercial use.",
    full_description: "A real-estate capital route built around the property, borrower profile, deal structure, and exit plan.",
    amount_range: { min: 100000, max: 100000000 },
    payment_type: "monthly",
    credit_tier: "fair",
    minimums: { credit_score: 650, monthly_revenue: null, time_in_business: null },
    term_length: "Up to 30 years",
    pricing_summary: "Profile-dependent",
    speed_to_funding: "1–3 months",
    qualification_snapshot: "650+ credit; property file required",
    disqualifiers: ["Weak equity", "Unclear exit strategy", "Incomplete property file"],
    documents_required: ["ID", "Property summary", "Valuation support", "Deal documents"],
    primary_cta: { text: "Check eligibility", url_placeholder: PRIMARY_APPLICATION_URL },
    recommended_audience: ["investors", "rental operators", "developers", "owner-operators"],
    urgency_level: "low",
    flags: { featured: false, startup: false, revenue_required: false, collateral_required: true, real_estate: true, ecommerce: false },
    seo: {
      faqs: [
        { question: "Is collateral required?", answer: "Real-estate capital is typically underwritten around the property and deal structure." }
      ]
    }
  }
];

let allProducts = [];
let filteredProducts = [];
let lastFocusedElement = null;

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();
  setupRevealObserver();

  showLoadingCards();

  const rawProducts = await fetchProducts();
  allProducts = normalizeProducts(rawProducts);
  filteredProducts = [...allProducts];

  renderFilters(allProducts);
  renderStats(allProducts);
  renderFeatured(allProducts);
  applyFilters();
}

function cacheElements() {
  els.navToggle = document.querySelector("[data-nav-toggle]");
  els.navLinks = document.querySelector("[data-nav-links]");
  els.searchInput = document.getElementById("searchInput");
  els.sortSelect = document.getElementById("sortSelect");
  els.categoryFilter = document.getElementById("categoryFilter");
  els.fundingTypeFilter = document.getElementById("fundingTypeFilter");
  els.creditTierFilter = document.getElementById("creditTierFilter");
  els.urgencyFilter = document.getElementById("urgencyFilter");
  els.minAmountFilter = document.getElementById("minAmountFilter");
  els.maxAmountFilter = document.getElementById("maxAmountFilter");
  els.featuredOnlyFilter = document.getElementById("featuredOnlyFilter");
  els.startupFilter = document.getElementById("startupFilter");
  els.revenueRequiredFilter = document.getElementById("revenueRequiredFilter");
  els.noRevenueFilter = document.getElementById("noRevenueFilter");
  els.collateralFilter = document.getElementById("collateralFilter");
  els.noCollateralFilter = document.getElementById("noCollateralFilter");
  els.realEstateFilter = document.getElementById("realEstateFilter");
  els.ecommerceFilter = document.getElementById("ecommerceFilter");
  els.resetFilters = document.getElementById("resetFilters");
  els.productGrid = document.getElementById("productGrid");
  els.featuredGrid = document.getElementById("featuredGrid");
  els.statsGrid = document.getElementById("statsGrid");
  els.resultsCount = document.getElementById("resultsCount");
  els.emptyState = document.getElementById("emptyState");
  els.modalBackdrop = document.getElementById("modalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalContent = document.getElementById("modalContent");
}

function bindEvents() {
  const debouncedApply = debounce(applyFilters, 180);

  [
    els.searchInput,
    els.categoryFilter,
    els.fundingTypeFilter,
    els.creditTierFilter,
    els.urgencyFilter,
    els.minAmountFilter,
    els.maxAmountFilter,
    els.featuredOnlyFilter,
    els.startupFilter,
    els.revenueRequiredFilter,
    els.noRevenueFilter,
    els.collateralFilter,
    els.noCollateralFilter,
    els.realEstateFilter,
    els.ecommerceFilter,
    els.sortSelect
  ].filter(Boolean).forEach((el) => {
    const eventName = el.type === "search" || el.type === "number" ? "input" : "change";
    el.addEventListener(eventName, debouncedApply);
  });

  els.resetFilters?.addEventListener("click", resetFilters);
  els.modalClose?.addEventListener("click", closeProductModal);
  els.modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === els.modalBackdrop) closeProductModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modalBackdrop.hidden) {
      closeProductModal();
    }
  });

  els.navToggle?.addEventListener("click", () => {
    const isOpen = els.navLinks.classList.toggle("is-open");
    els.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  els.navLinks?.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      els.navLinks.classList.remove("is-open");
      els.navToggle?.setAttribute("aria-expanded", "false");
    }
  });
}

async function fetchProducts() {
  try {
    const response = await fetch(REGISTRY_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Registry request failed with status ${response.status}`);
    }
    const products = await response.json();
    return Array.isArray(products) ? products : fallbackProducts;
  } catch (error) {
    console.warn("CapitalStack registry unavailable. Rendering fallback products.", error);
    return fallbackProducts;
  }
}

function normalizeProducts(products) {
  return products
    .filter((product) => product && isPublicProduct(product))
    .map((product, index) => {
      const flags = product.flags || {};
      const minimums = product.minimums || {};
      const amountRange = product.amount_range || {};

      return {
        id: sanitizeText(product.slug || `product-${index}`),
        public_product_name: safeValue(product.public_product_name, "Funding Stack"),
        slug: sanitizeText(product.slug || `funding-stack-${index}`),
        category: safeValue(product.category, "Not listed"),
        funding_type: safeValue(product.funding_type, "Not listed"),
        solution_family: safeValue(product.solution_family, "Not listed"),
        short_description: safeValue(product.short_description, "Funding path details vary by profile."),
        full_description: safeValue(product.full_description, "Review the stack details and check fit before moving forward."),
        amount_range: {
          min: numberOrNull(amountRange.min),
          max: numberOrNull(amountRange.max)
        },
        payment_type: safeValue(product.payment_type, "Varies"),
        credit_tier: safeValue(product.credit_tier, "Profile-dependent"),
        minimums: {
          credit_score: numberOrNull(minimums.credit_score),
          monthly_revenue: numberOrNull(minimums.monthly_revenue),
          time_in_business: safeValue(minimums.time_in_business, "Not listed")
        },
        term_length: safeValue(product.term_length, "Varies"),
        pricing_summary: safeValue(product.pricing_summary, "Profile-dependent"),
        speed_to_funding: safeValue(product.speed_to_funding, "Varies"),
        qualification_snapshot: safeValue(product.qualification_snapshot, "Profile-dependent"),
        disqualifiers: safeArray(product.disqualifiers),
        documents_required: safeArray(product.documents_required),
        primary_cta: {
          text: safeValue(product.primary_cta?.text, "Check eligibility"),
          url_placeholder: safeValue(product.primary_cta?.url_placeholder, PRIMARY_APPLICATION_URL)
        },
        recommended_audience: safeArray(product.recommended_audience),
        urgency_level: safeValue(product.urgency_level, "Profile-dependent"),
        flags: {
          featured: Boolean(flags.featured),
          startup: Boolean(flags.startup),
          revenue_required: Boolean(flags.revenue_required),
          collateral_required: Boolean(flags.collateral_required),
          real_estate: Boolean(flags.real_estate),
          ecommerce: Boolean(flags.ecommerce)
        },
        seo: {
          faqs: Array.isArray(product.seo?.faqs)
            ? product.seo.faqs.map((faq) => ({
              question: safeValue(faq.question, "Question not listed"),
              answer: safeValue(faq.answer, "Answer varies by profile.")
            }))
            : []
        },
        searchBlob: buildSearchBlob(product)
      };
    });
}

function isPublicProduct(product) {
  const statusOk = !product.status || String(product.status).toLowerCase() === "active";
  const visibilityOk = !product.visibility || String(product.visibility).toLowerCase() === "public";
  const publicVisibilityOk = product.public_visibility !== false;
  return statusOk && visibilityOk && publicVisibilityOk;
}

function renderProducts(products) {
  if (!els.productGrid) return;

  els.productGrid.innerHTML = products.map((product) => productCardTemplate(product)).join("");

  els.productGrid.querySelectorAll("[data-view-stack]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = allProducts.find((item) => item.slug === button.dataset.viewStack);
      if (product) openProductModal(product);
    });
  });

  els.productGrid.querySelectorAll("[data-check-eligibility]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = link.getAttribute("href");
      if (isPlaceholderUrl(url)) {
        event.preventDefault();
        document.getElementById("find-your-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function renderFeatured(products) {
  if (!els.featuredGrid) return;

  const featured = products
    .filter((product) => product.flags.featured)
    .sort((a, b) => compareFeatured(a, b) || compareSpeed(a, b))
    .slice(0, 3);

  const displayProducts = featured.length ? featured : products.slice(0, 3);

  els.featuredGrid.innerHTML = displayProducts.map((product) => productCardTemplate(product, true)).join("");

  els.featuredGrid.querySelectorAll("[data-view-stack]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = allProducts.find((item) => item.slug === button.dataset.viewStack);
      if (product) openProductModal(product);
    });
  });
}

function renderStats(products) {
  if (!els.statsGrid) return;

  const amounts = products.map((product) => product.amount_range).filter(Boolean);
  const minAmounts = amounts.map((range) => range.min).filter(isFiniteNumber);
  const maxAmounts = amounts.map((range) => range.max).filter(isFiniteNumber);
  const fastFundingCount = products.filter((product) => parseSpeedToDays(product.speed_to_funding) <= 3).length;

  const stats = [
    ["Funding programs", products.length],
    ["Featured options", products.filter((product) => product.flags.featured).length],
    ["Lowest listed min", minAmounts.length ? formatCurrency(Math.min(...minAmounts)) : "Varies"],
    ["Highest listed max", maxAmounts.length ? formatCurrency(Math.max(...maxAmounts)) : "Varies"],
    ["Startup-friendly", products.filter((product) => product.flags.startup).length],
    ["Fast routes", fastFundingCount]
  ];

  els.statsGrid.innerHTML = stats.map(([label, value]) => `
    <article class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `).join("");
}

function renderFilters(products) {
  hydrateSelect(els.categoryFilter, products.map((product) => product.category), "All categories");
  hydrateSelect(els.fundingTypeFilter, products.map((product) => product.funding_type), "All funding types");
  hydrateSelect(els.creditTierFilter, products.map((product) => product.credit_tier), "All credit tiers");
  hydrateSelect(els.urgencyFilter, products.map((product) => product.urgency_level), "All urgency levels");
}

function hydrateSelect(select, values, defaultLabel) {
  if (!select) return;

  const uniqueValues = [...new Set(values.filter(Boolean))]
    .sort((a, b) => humanize(a).localeCompare(humanize(b)));

  select.innerHTML = `<option value="">${escapeHtml(defaultLabel)}</option>` + uniqueValues
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(humanize(value))}</option>`)
    .join("");
}

function applyFilters() {
  const query = els.searchInput?.value.trim().toLowerCase() || "";
  const selectedCategory = els.categoryFilter?.value || "";
  const selectedFundingType = els.fundingTypeFilter?.value || "";
  const selectedCreditTier = els.creditTierFilter?.value || "";
  const selectedUrgency = els.urgencyFilter?.value || "";
  const minAmount = numberOrNull(els.minAmountFilter?.value);
  const maxAmount = numberOrNull(els.maxAmountFilter?.value);

  filteredProducts = allProducts.filter((product) => {
    const matchesQuery = !query || product.searchBlob.includes(query);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesFundingType = !selectedFundingType || product.funding_type === selectedFundingType;
    const matchesCreditTier = !selectedCreditTier || product.credit_tier === selectedCreditTier;
    const matchesUrgency = !selectedUrgency || product.urgency_level === selectedUrgency;
    const matchesFeatured = !els.featuredOnlyFilter?.checked || product.flags.featured;
    const matchesStartup = !els.startupFilter?.checked || product.flags.startup;
    const matchesRevenueRequired = !els.revenueRequiredFilter?.checked || product.flags.revenue_required;
    const matchesNoRevenue = !els.noRevenueFilter?.checked || !product.flags.revenue_required;
    const matchesCollateral = !els.collateralFilter?.checked || product.flags.collateral_required;
    const matchesNoCollateral = !els.noCollateralFilter?.checked || !product.flags.collateral_required;
    const matchesRealEstate = !els.realEstateFilter?.checked || product.flags.real_estate || product.category === "real_estate";
    const matchesEcommerce = !els.ecommerceFilter?.checked || product.flags.ecommerce || product.searchBlob.includes("ecommerce") || product.searchBlob.includes("e-commerce");

    const productMin = product.amount_range.min;
    const productMax = product.amount_range.max;
    const matchesMinAmount = minAmount === null || (isFiniteNumber(productMax) && productMax >= minAmount);
    const matchesMaxAmount = maxAmount === null || (isFiniteNumber(productMin) && productMin <= maxAmount);

    return matchesQuery &&
      matchesCategory &&
      matchesFundingType &&
      matchesCreditTier &&
      matchesUrgency &&
      matchesFeatured &&
      matchesStartup &&
      matchesRevenueRequired &&
      matchesNoRevenue &&
      matchesCollateral &&
      matchesNoCollateral &&
      matchesRealEstate &&
      matchesEcommerce &&
      matchesMinAmount &&
      matchesMaxAmount;
  });

  filteredProducts = applySorting(filteredProducts);
  renderProducts(filteredProducts);
  updateResultsCount(filteredProducts.length);
  updateEmptyState(filteredProducts.length);
}

function applySorting(products) {
  const sortValue = els.sortSelect?.value || "featured";
  const sorted = [...products];

  switch (sortValue) {
    case "fastest":
      return sorted.sort(compareSpeed);
    case "highestMax":
      return sorted.sort((a, b) => valueOrNegativeInfinity(b.amount_range.max) - valueOrNegativeInfinity(a.amount_range.max));
    case "lowestCredit":
      return sorted.sort((a, b) => valueOrInfinity(a.minimums.credit_score) - valueOrInfinity(b.minimums.credit_score));
    case "lowestRevenue":
      return sorted.sort((a, b) => valueOrInfinity(a.minimums.monthly_revenue) - valueOrInfinity(b.minimums.monthly_revenue));
    case "az":
      return sorted.sort((a, b) => a.public_product_name.localeCompare(b.public_product_name));
    case "featured":
    default:
      return sorted.sort((a, b) => compareFeatured(a, b) || compareSpeed(a, b) || a.public_product_name.localeCompare(b.public_product_name));
  }
}

function openProductModal(product) {
  if (!els.modalBackdrop || !els.modalContent) return;

  lastFocusedElement = document.activeElement;

  const amountRange = formatAmountRange(product.amount_range);
  const minimums = formatMinimums(product.minimums);
  const ctaUrl = resolveCtaUrl(product.primary_cta.url_placeholder);
  const productFaqs = product.seo.faqs.length
    ? product.seo.faqs.map((faq) => `
      <details>
        <summary>${escapeHtml(faq.question)}</summary>
        <p>${escapeHtml(faq.answer)}</p>
      </details>
    `).join("")
    : `<p class="muted">Product-specific FAQs are not listed for this stack.</p>`;

  els.modalContent.innerHTML = `
    <p class="modal-kicker">Capital Stack Details</p>
    <h2 id="modalTitle">${escapeHtml(product.public_product_name)}</h2>
    <div class="card-topline">
      ${badgesTemplate(product)}
    </div>
    <p>${escapeHtml(product.full_description)}</p>

    <div class="detail-grid">
      ${detailBox("Amount", amountRange)}
      ${detailBox("Credit", minimums.credit)}
      ${detailBox("Revenue", minimums.revenue)}
      ${detailBox("Time in business", minimums.time)}
      ${detailBox("Term", product.term_length)}
      ${detailBox("Payment", product.payment_type)}
      ${detailBox("Pricing", product.pricing_summary)}
      ${detailBox("Speed", product.speed_to_funding)}
      ${detailBox("Credit tier", humanize(product.credit_tier))}
    </div>

    <div class="detail-section">
      <h3>Qualification snapshot</h3>
      <p>${escapeHtml(product.qualification_snapshot)}</p>
    </div>

    <div class="detail-section">
      <h3>Documents commonly requested</h3>
      ${listTemplate(product.documents_required)}
    </div>

    <div class="detail-section">
      <h3>Potential disqualifiers</h3>
      ${listTemplate(product.disqualifiers)}
    </div>

    <div class="detail-section">
      <h3>Recommended audience</h3>
      ${listTemplate(product.recommended_audience)}
    </div>

    <div class="detail-section">
      <h3>Product FAQs</h3>
      <div class="faq-list">${productFaqs}</div>
    </div>

    <div class="hero-actions">
      <a class="button button-primary" href="${escapeHtml(ctaUrl)}" data-modal-cta>Check Eligibility</a>
      <button class="button button-ghost" type="button" data-modal-close-secondary>Back to marketplace</button>
    </div>
  `;

  els.modalContent.querySelector("[data-modal-close-secondary]")?.addEventListener("click", closeProductModal);
  els.modalContent.querySelector("[data-modal-cta]")?.addEventListener("click", (event) => {
    const url = event.currentTarget.getAttribute("href");
    if (isPlaceholderUrl(url)) {
      event.preventDefault();
      closeProductModal();
      document.getElementById("find-your-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  els.modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  const panel = els.modalBackdrop.querySelector(".modal-panel");
  panel?.focus();
}

function closeProductModal() {
  if (!els.modalBackdrop) return;

  els.modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  els.modalContent.innerHTML = "";
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function formatCurrency(value) {
  if (!isFiniteNumber(value)) return "Varies";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatMinimums(minimums = {}) {
  const credit = isFiniteNumber(minimums.credit_score) ? `${minimums.credit_score}+` : "Profile-dependent";
  const revenue = minimums.monthly_revenue === 0
    ? "$0 listed"
    : isFiniteNumber(minimums.monthly_revenue)
      ? `${formatCurrency(minimums.monthly_revenue)}/mo`
      : "Not listed";
  const time = safeValue(minimums.time_in_business, "Not listed");
  return { credit, revenue, time };
}

function formatAmountRange(range = {}) {
  const min = isFiniteNumber(range.min) ? formatCurrency(range.min) : "Varies";
  const max = isFiniteNumber(range.max) ? formatCurrency(range.max) : "Varies";
  return `${min} – ${max}`;
}

function productCardTemplate(product, compact = false) {
  const minimums = formatMinimums(product.minimums);
  const description = compact ? truncateText(product.short_description, 115) : product.short_description;
  const cardClass = compact ? "feature-card" : "product-card";

  return `
    <article class="${cardClass}">
      <div class="card-topline">
        ${badgesTemplate(product)}
      </div>
      <h3>${escapeHtml(product.public_product_name)}</h3>
      <p>${escapeHtml(description)}</p>

      <div class="card-meta-grid">
        ${detailBox("Amount", formatAmountRange(product.amount_range), "meta-box")}
        ${detailBox("Min credit", minimums.credit, "meta-box")}
        ${detailBox("Min revenue", minimums.revenue, "meta-box")}
        ${detailBox("Time", minimums.time, "meta-box")}
        ${detailBox("Speed", product.speed_to_funding, "meta-box")}
        ${detailBox("Pricing", product.pricing_summary, "meta-box")}
      </div>

      <div class="badge-row" aria-label="Funding details">
        <span class="tag-pill">${escapeHtml(humanize(product.category))}</span>
        <span class="tag-pill">${escapeHtml(humanize(product.funding_type))}</span>
        <span class="tag-pill">${escapeHtml(humanize(product.solution_family))}</span>
        <span class="tag-pill">${escapeHtml(humanize(product.credit_tier))} credit</span>
        <span class="tag-pill">${escapeHtml(humanize(product.urgency_level))} urgency</span>
      </div>

      <div class="card-actions">
        <button class="button button-primary button-small" type="button" data-view-stack="${escapeHtml(product.slug)}">View Stack</button>
        <a class="button button-ghost button-small" href="${escapeHtml(resolveCtaUrl(product.primary_cta.url_placeholder))}" data-check-eligibility="${escapeHtml(product.slug)}">Check Eligibility</a>
      </div>
    </article>
  `;
}

function badgesTemplate(product) {
  const badges = [];

  if (product.flags.featured) badges.push(`<span class="pill pill-green">Featured</span>`);
  if (product.flags.startup) badges.push(`<span class="pill pill-blue">Startup-friendly</span>`);
  if (product.flags.revenue_required) badges.push(`<span class="pill pill-yellow">Revenue required</span>`);
  if (!product.flags.revenue_required) badges.push(`<span class="pill">No revenue listed</span>`);
  if (product.flags.collateral_required) badges.push(`<span class="pill pill-pink">Collateral</span>`);
  if (!product.flags.collateral_required) badges.push(`<span class="pill">No collateral listed</span>`);

  return badges.join("");
}

function detailBox(label, value, className = "meta-box") {
  return `
    <div class="${className}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(safeValue(value, "Not listed"))}</strong>
    </div>
  `;
}

function listTemplate(items) {
  const cleanItems = safeArray(items);
  if (!cleanItems.length) return `<p class="muted">Not listed.</p>`;

  return `
    <ul class="clean-list">
      ${cleanItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function resetFilters() {
  [
    els.searchInput,
    els.categoryFilter,
    els.fundingTypeFilter,
    els.creditTierFilter,
    els.urgencyFilter,
    els.minAmountFilter,
    els.maxAmountFilter
  ].filter(Boolean).forEach((el) => {
    el.value = "";
  });

  [
    els.featuredOnlyFilter,
    els.startupFilter,
    els.revenueRequiredFilter,
    els.noRevenueFilter,
    els.collateralFilter,
    els.noCollateralFilter,
    els.realEstateFilter,
    els.ecommerceFilter
  ].filter(Boolean).forEach((el) => {
    el.checked = false;
  });

  if (els.sortSelect) els.sortSelect.value = "featured";

  applyFilters();
}

function updateResultsCount(count) {
  if (!els.resultsCount) return;
  const label = count === 1 ? "funding stack" : "funding stacks";
  els.resultsCount.textContent = `${count} ${label} visible`;
}

function updateEmptyState(count) {
  if (!els.emptyState) return;
  els.emptyState.hidden = count !== 0;
}

function showLoadingCards() {
  if (!els.productGrid || !els.featuredGrid) return;

  els.productGrid.innerHTML = Array.from({ length: 6 }, () => `<div class="loading-card" aria-hidden="true"></div>`).join("");
  els.featuredGrid.innerHTML = Array.from({ length: 3 }, () => `<div class="loading-card" aria-hidden="true"></div>`).join("");
}

function buildSearchBlob(product) {
  const searchableSafeFields = [
    product.public_product_name,
    product.slug,
    product.category,
    product.funding_type,
    product.solution_family,
    product.short_description,
    product.full_description,
    product.payment_type,
    product.credit_tier,
    product.term_length,
    product.pricing_summary,
    product.speed_to_funding,
    product.qualification_snapshot,
    product.urgency_level,
    ...(Array.isArray(product.recommended_audience) ? product.recommended_audience : []),
    ...(Array.isArray(product.documents_required) ? product.documents_required : []),
    ...(Array.isArray(product.disqualifiers) ? product.disqualifiers : [])
  ];

  return searchableSafeFields
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function parseSpeedToDays(speed) {
  const value = String(speed || "").toLowerCase();

  if (!value || value.includes("varies")) return Number.POSITIVE_INFINITY;
  if (value.includes("instant")) return 0;
  if (value.includes("24 hour")) return 1;
  if (value.includes("48 hour")) return 2;

  const numbers = value.match(/\d+/g)?.map(Number) || [];
  const fastestNumber = numbers.length ? Math.min(...numbers) : Number.POSITIVE_INFINITY;

  if (value.includes("month")) return fastestNumber * 30;
  if (value.includes("week")) return fastestNumber * 7;
  if (value.includes("day")) return fastestNumber;
  if (value.includes("hour")) return Math.max(1, Math.ceil(fastestNumber / 24));

  return Number.POSITIVE_INFINITY;
}

function compareSpeed(a, b) {
  return parseSpeedToDays(a.speed_to_funding) - parseSpeedToDays(b.speed_to_funding);
}

function compareFeatured(a, b) {
  return Number(b.flags.featured) - Number(a.flags.featured);
}

function valueOrInfinity(value) {
  return isFiniteNumber(value) ? value : Number.POSITIVE_INFINITY;
}

function valueOrNegativeInfinity(value) {
  return isFiniteNumber(value) ? value : Number.NEGATIVE_INFINITY;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function safeValue(value, fallback = "Not listed") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeValue(item, "")).filter(Boolean);
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/[^\w\- ]+/g, "")
    .trim();
}

function humanize(value) {
  return safeValue(value, "Not listed")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncateText(value, maxLength = 120) {
  const text = safeValue(value, "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

function resolveCtaUrl(url) {
  const cleanUrl = safeValue(url, PRIMARY_APPLICATION_URL);
  return isPlaceholderUrl(cleanUrl) ? cleanUrl : cleanUrl;
}

function isPlaceholderUrl(url) {
  return !url || String(url).includes("{{") || String(url).includes("}}");
}

function debounce(fn, wait = 200) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn.apply(null, args), wait);
  };
}

function setupRevealObserver() {
  const targets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((target) => observer.observe(target));
}
