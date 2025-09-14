export interface Campaign {
  name: string
  fullUrl: string
  titles: string[]
  texts: string[]
  images: string[]
  videos: string[]
  sitelinks: Sitelink[]
  regions: string
  audience: Audience
  campaignTarget: CampaignTarget
  campaignRecomendations: CampaignRecomendations
}

export interface Sitelink {
  href: string
  name: string
  description: string
}

export interface Audience {
  type: 'AUTO' | 'MANUAL'
  gender: 'ALL' | 'Male' | 'Female'
  ageFrom: 'Age0' | 'Age18' | 'Age25' | 'Age35' | 'Age45' | 'Age55'
  ageTo: 'Age18' | 'Age25' | 'Age35' | 'Age45' | 'Age55' | 'AgeUnlimited'
  interests?: string[]
  negativeKeywords?: string[]
  devices: ('desktop' | 'mobile' | 'tablet')[]
}

export interface CampaignTarget {
  type: 'INVOLVED_CONVERSION' | 'DIRECT_CLICK'
  priceStrategy: 'AVG_PRICE' | 'OPTIMUM'
  price: number
  metrikaCounters: string[]
  weeklyBudget: number
  targetActions: TargetAction[]
}

export interface TargetAction {
  name: string
  price: number
  metricaId: string
}

export interface CampaignRecomendations {
  acceptRecommendations: boolean
  acceptAdditionalRecommendations: boolean
  enableAlternativeTexts: boolean
}
