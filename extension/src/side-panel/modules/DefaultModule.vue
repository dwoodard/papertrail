<template>
  <div class="default-module">
    <div class="module-header">
      <div class="logo">📎</div>
      <div class="title">Papertrail</div>
    </div>
    <div class="module-content">
      <div class="modules-grid">
        <div v-for="module in modules" :key="module.id" class="module-card">
          <div class="card-icon">{{ module.icon }}</div>
          <div class="card-heading">{{ module.heading }}</div>
          <div class="card-description">
            {{ module.description }}
          </div>
          <a v-if="module.link" :href="module.link" target="_blank" rel="noopener" class="card-link">
            Open Module →
          </a>
          <div v-else class="card-placeholder">Coming Soon</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const modules = [
  {
    id: 'google-maps',
    icon: '📍',
    heading: 'Google Maps',
    description: 'Collect listings and business data from Google Maps',
    link: 'https://www.google.com/maps'
  },
  {
    id: 'yelp-leads',
    icon: '⭐',
    heading: 'Yelp Business Leads',
    description: 'Extract local service businesses and reviews'
  },
  {
    id: 'facebook-leads',
    icon: '👥',
    heading: 'Facebook Business Leads',
    description: 'Find local pages, contact info, and activity'
  },
  {
    id: 'contact-data',
    icon: '✉️',
    heading: 'Website Contact Data',
    description: 'Extract emails, phones, and business details'
  },
  {
    id: 'instagram-data',
    icon: '📸',
    heading: 'Instagram Business Data',
    description: 'Extract local business profiles and engagement'
  },
  {
    id: 'linkedin-leads',
    icon: '💼',
    heading: 'LinkedIn Company Leads',
    description: 'Find B2B companies and decision makers'
  },
  {
    id: 'bbb-data',
    icon: '✓',
    heading: 'BBB Business Data',
    description: 'Extract accredited businesses and complaints'
  },
  {
    id: 'chamber-leads',
    icon: '🏢',
    heading: 'Chamber of Commerce Leads',
    description: 'Find local registered business members'
  },
  {
    id: 'state-registry',
    icon: '📋',
    heading: 'State Business Registry Data',
    description: 'Extract registered companies by location'
  },
  {
    id: 'contractor-licenses',
    icon: '🔨',
    heading: 'Contractor License Data',
    description: 'Find licensed contractors and trade businesses'
  },
  {
    id: 'realtor-leads',
    icon: '🏠',
    heading: 'Real Estate Agent Leads',
    description: 'Extract realtor profiles and broker details'
  },
  {
    id: 'property-managers',
    icon: '🏘️',
    heading: 'Property Manager Leads',
    description: 'Find rental managers and apartment contacts'
  },
  {
    id: 'zillow-data',
    icon: '💰',
    heading: 'Zillow Property Data',
    description: 'Extract listings, agents, and pricing trends'
  },
  {
    id: 'airbnb-data',
    icon: '🛏️',
    heading: 'Airbnb Rental Data',
    description: 'Analyze short-term rental listings and pricing'
  },
  {
    id: 'indeed-jobs',
    icon: '💼',
    heading: 'Indeed Job Posting Data',
    description: 'Scrape hiring companies and job demand'
  },
  {
    id: 'craigslist-data',
    icon: '📄',
    heading: 'Craigslist Listing Data',
    description: 'Extract local service and product listings'
  },
  {
    id: 'facebook-marketplace',
    icon: '🛒',
    heading: 'Facebook Marketplace Data',
    description: 'Monitor local products, prices, and sellers'
  },
  {
    id: 'etsy-data',
    icon: '🎨',
    heading: 'Etsy Product Data',
    description: 'Extract handmade product listings and shops'
  },
  {
    id: 'walmart-data',
    icon: '🏬',
    heading: 'Walmart Product Data',
    description: 'Track product prices, sellers, and rankings'
  },
  {
    id: 'shopify-data',
    icon: '🛍️',
    heading: 'Shopify Store Data',
    description: 'Discover products, prices, and store trends'
  },

  {
    id: 'competitor-audit',
    icon: '🔍',
    heading: 'Competitor Website Audit',
    description: 'Scrape competitor pages, offers, and keywords'
  },
  {
    id: 'review-extractor',
    icon: '⭐',
    heading: 'Review Data Extractor',
    description: 'Pull reviews from Google, Yelp, Facebook, etc.'
  },
  {
    id: 'seo-audit',
    icon: '📊',
    heading: 'Local SEO Audit Data',
    description: 'Analyze rankings, reviews, categories, and gaps'
  },
  {
    id: 'gbp-audit',
    icon: '🗺️',
    heading: 'Google Business Profile Audit',
    description: 'Find missing info, weak profiles, and SEO issues'
  },
  {
    id: 'domain-tech',
    icon: '🌐',
    heading: 'Domain & Tech Stack Data',
    description: 'Detect websites, platforms, pixels, and tools'
  },
  {
    id: 'email-verify',
    icon: '✔️',
    heading: 'Email Verification Data',
    description: 'Validate emails and reduce bounce risk'
  }
]
</script>

<style scoped>
.default-module {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.logo {
  font-size: 20px;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #1a73e8;
}

.module-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.module-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.module-card:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
}

.card-icon {
  font-size: 48px;
  line-height: 1;
}

.card-heading {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
}

.card-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.card-link {
  display: inline-block;
  font-size: 13px;
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.card-link:hover {
  text-decoration: underline;
}

.card-placeholder {
  display: inline-block;
  font-size: 12px;
  color: #999;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}
</style>
