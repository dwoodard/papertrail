<template>
  <div class="default-module">
    <div class="module-content">
      <div class="modules-grid">
        <div v-for="module in modules" :key="module.id" class="module-card">
          <div class="card-icon">
            <component :is="module.icon" :size="40" />
          </div>
          <div class="card-content">
            <div class="card-heading">{{ module.heading }}</div>
            <div class="card-description">
              {{ module.description }}
            </div>
            <button v-if="module.link" class="card-link" @click="handleModuleLink(module.link)">
              Open Module →
            </button>
            <div v-else class="card-placeholder">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapPin,
  Star,
  Users,
  Mail,
  Camera,
  Briefcase,
  CheckCircle,
  Building2,
  ClipboardList,
  Hammer,
  Home,
  Building,
  DollarSign,
  Bed,
  FileText,
  ShoppingCart,
  Palette,
  Store,
  ShoppingBag,
  Search,
  BarChart3,
  Map,
  Globe,
} from '@lucide/vue'

const modulesRaw = [
  {
    id: 'google-maps',
    icon: MapPin,
    heading: 'Google Maps',
    description: 'Collect listings and business data from Google Maps',
    link: 'https://www.google.com/maps'
  },
  {
    id: 'youtube-leads',
    icon: Camera,
    heading: 'YouTube Channel Data',
    description: 'Extract video data, channel insights, and engagement',
    link: 'https://www.youtube.com'
  },
  {
    id: 'yelp-leads',
    icon: Star,
    heading: 'Yelp Business Leads',
    description: 'Extract local service businesses and reviews',
    link: 'https://www.yelp.com'
  },

  {
    id: 'facebook-leads',
    icon: Users,
    heading: 'Facebook Business Leads',
    description: 'Find local pages, contact info, and activity',
    link: 'https://www.facebook.com'
  },
  {
    id: 'contact-data',
    icon: Mail,
    heading: 'Website Contact Data',
    description: 'Extract emails, phones, and business details'
  },
  {
    id: 'instagram-data',
    icon: Camera,
    heading: 'Instagram Business Data',
    description: 'Extract local business profiles and engagement'
  },
  {
    id: 'linkedin-leads',
    icon: Briefcase,
    heading: 'LinkedIn Company Leads',
    description: 'Find B2B companies and decision makers',
    link: 'https://www.linkedin.com/in/'
  },
  {
    id: 'bbb-data',
    icon: CheckCircle,
    heading: 'BBB Business Data',
    description: 'Extract accredited businesses and complaints'
  },
  {
    id: 'chamber-leads',
    icon: Building2,
    heading: 'Chamber of Commerce Leads',
    description: 'Find local registered business members'
  },
  {
    id: 'state-registry',
    icon: ClipboardList,
    heading: 'State Business Registry Data',
    description: 'Extract registered companies by location'
  },
  {
    id: 'contractor-licenses',
    icon: Hammer,
    heading: 'Contractor License Data',
    description: 'Find licensed contractors and trade businesses'
  },
  {
    id: 'realtor-leads',
    icon: Home,
    heading: 'Real Estate Agent Leads',
    description: 'Extract realtor profiles and broker details'
  },
  {
    id: 'property-managers',
    icon: Building,
    heading: 'Property Manager Leads',
    description: 'Find rental managers and apartment contacts'
  },
  {
    id: 'zillow-data',
    icon: DollarSign,
    heading: 'Zillow Property Data',
    description: 'Extract listings, agents, and pricing trends'
  },
  {
    id: 'airbnb-data',
    icon: Bed,
    heading: 'Airbnb Rental Data',
    description: 'Analyze short-term rental listings and pricing'
  },
  {
    id: 'indeed-jobs',
    icon: Briefcase,
    heading: 'Indeed Job Posting Data',
    description: 'Scrape hiring companies and job demand'
  },
  {
    id: 'craigslist-data',
    icon: FileText,
    heading: 'Craigslist Listing Data',
    description: 'Extract local service and product listings'
  },
  {
    id: 'facebook-marketplace',
    icon: ShoppingCart,
    heading: 'Facebook Marketplace Data',
    description: 'Monitor local products, prices, and sellers'
  },
  {
    id: 'etsy-data',
    icon: Palette,
    heading: 'Etsy Product Data',
    description: 'Extract handmade product listings and shops'
  },
  {
    id: 'walmart-data',
    icon: Store,
    heading: 'Walmart Product Data',
    description: 'Track product prices, sellers, and rankings'
  },
  {
    id: 'shopify-data',
    icon: ShoppingBag,
    heading: 'Shopify Store Data',
    description: 'Discover products, prices, and store trends'
  },

  {
    id: 'competitor-audit',
    icon: Search,
    heading: 'Competitor Website Audit',
    description: 'Scrape competitor pages, offers, and keywords'
  },
  {
    id: 'review-extractor',
    icon: Star,
    heading: 'Review Data Extractor',
    description: 'Pull reviews from Google, Yelp, Facebook, etc.'
  },
  {
    id: 'seo-audit',
    icon: BarChart3,
    heading: 'Local SEO Audit Data',
    description: 'Analyze rankings, reviews, categories, and gaps'
  },
  {
    id: 'gbp-audit',
    icon: Map,
    heading: 'Google Business Profile Audit',
    description: 'Find missing info, weak profiles, and SEO issues'
  },
  {
    id: 'domain-tech',
    icon: Globe,
    heading: 'Domain & Tech Stack Data',
    description: 'Detect websites, platforms, pixels, and tools'
  },
  {
    id: 'email-verify',
    icon: CheckCircle,
    heading: 'Email Verification Data',
    description: 'Validate emails and reduce bounce risk'
  }
]

const modules = [...modulesRaw].sort((a, b) => {
  const aHasLink = a.link ? 1 : 0
  const bHasLink = b.link ? 1 : 0
  return bHasLink - aHasLink
})

function handleModuleLink(link) {
  // Open external links in the browser (current tab)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url: link })
    }
  })
}
</script>

<style scoped>
.default-module {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.module-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.module-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.module-card:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
}

.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  color: #1a73e8;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-heading {
  font-size: 15px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}

.card-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.card-link {
  display: block;
  font-size: 12px;
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  margin-top: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-align: left;
}

.card-link:hover {
  text-decoration: underline;
}

.card-placeholder {
  display: block;
  font-size: 11px;
  color: #999;
  font-style: italic;
  margin-top: 8px;
  text-align: left;
}
</style>
