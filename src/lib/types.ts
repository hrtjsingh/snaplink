export interface Page {
  _id?: string
  ownerId: string
  title: string
  description: string
  html: string
  css: string
  js: string
  slug: string
  visibility: 'public' | 'private'
  createdAt: Date
  updatedAt: Date
  viewCount?: number
  lastViewedAt?: Date
  pwaEnabled?: boolean
}

export interface PageData {
  title: string
  description: string
  html: string
  css: string
  js: string
  visibility: 'public' | 'private'
}

export interface PageView {
  _id?: string
  slug: string
  ownerId: string
  viewedAt: Date
  durationMs?: number
  bounced?: boolean
  referrer?: string
}

export interface PageStats {
  slug: string
  title: string
  description: string
  visibility: 'public' | 'private'
  viewCount: number
  lastViewedAt: Date | null
  bounceRate: number
  avgDurationMs: number
  viewsThisMonth: number
  viewsLastMonth: number
}

export interface UserAnalytics {
  totalPages: number
  publicPages: number
  totalViews: number
  avgViewsPerPage: number
  avgBounceRate: number
  avgDurationMs: number
  viewsThisMonth: number
  viewsLastMonth: number
  monthOverMonthGrowth: number | null
  pages: PageStats[]
}

export interface PlatformStats {
  totalPages: number
  totalViews: number
  totalCreators: number
  engagementRate: number
  avgDurationMs: number
  viewsThisMonth: number
  viewsLastMonth: number
  pagesGrowth: number | null
  viewsGrowth: number | null
}
