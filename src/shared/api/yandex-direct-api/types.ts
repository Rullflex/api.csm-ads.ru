export interface YandexDirectApiError {
  request_id: string
  error_code: number
  error_string: string
  error_detail: string
}

export interface GetAgencyClientsRequest {
  method: 'get'
  params: {
    SelectionCriteria: {
      Logins?: string[]
      Archived?: 'YES' | 'NO'
    }
    FieldNames: (
      | 'AccountQuality'
      | 'Archived'
      | 'ClientId'
      | 'ClientInfo'
      | 'CountryId'
      | 'CreatedAt'
      | 'Currency'
      | 'Grants'
      | 'Bonuses'
      | 'Login'
      | 'Notification'
      | 'OverdraftSumAvailable'
      | 'Phone'
      | 'Representatives'
      | 'Restrictions'
      | 'Settings'
      | 'Type'
      | 'VatRate'
      | 'ForbiddenPlatform'
      | 'AvailableCampaignTypes'
    )[]
    TinInfoFieldNames?: ('TinType' | 'Tin')[]
    OrganizationFieldNames?: (
      | 'Name'
      | 'EpayNumber'
      | 'RegNumber'
      | 'OksmNumber'
      | 'OkvedCode'
    )[]
    ContractFieldNames?: (
      | 'Number'
      | 'Date'
      | 'Price'
      | 'Type'
      | 'ActionType'
      | 'SubjectType'
    )[]
    ContragentFieldNames?: (
      | 'Name'
      | 'Phone'
      | 'EpayNumber'
      | 'RegNumber'
      | 'OksmNumber'
    )[]
    ContragentTinInfoFieldNames?: ('TinType' | 'Tin')[]
    Page?: {
      Limit: number
      Offset: number
    }
  }
}

export interface GetAgencyClientsResponse {
  Clients: ClientGetItem[]
  LimitedBy?: number
}

export interface ClientGetItem {
  AccountQuality?: number
  Archived: 'YES' | 'NO'
  ClientId: number
  ClientInfo?: string
  CountryId: number
  CreatedAt: string
  Currency: 'RUB' | 'BYN' | 'CHF' | 'EUR' | 'KZT' | 'TRY' | 'UAH' | 'USD'
  Grants?: GrantGetItem[]
  Bonuses?: BonusesGet
  Login: string
  Notification: NotificationGet
  OverdraftSumAvailable?: number
  Phone?: string
  Representatives?: Representative[]
  Restrictions?: ClientRestrictionItem[]
  Settings?: ClientSettingGetItem[]
  Type: string
  VatRate?: number
  ForbiddenPlatform: 'SEARCH' | 'NETWORK' | 'NONE'
  AvailableCampaignTypes:
    | 'TEXT_CAMPAIGN'
    | 'MOBILE_APP_CAMPAIGN'
    | 'DYNAMIC_TEXT_CAMPAIGN'
    | 'CPM_BANNER_CAMPAIGN'
    | 'SMART_CAMPAIGN'
    | 'CONTENT_PROMOTION'
    | 'BILLING_AGGREGATE'
    | 'UNIFIED_CAMPAIGN'
  TinInfo?: TinInfoGet
  ErirAttributes?: ErirAttributesGet
}

export interface GrantGetItem {
  Privilege: 'EDIT_CAMPAIGNS' | 'IMPORT_XLS' | 'TRANSFER_MONEY'
  Value: 'YES' | 'NO'
  Agency?: string
}

export interface BonusesGet {
  AwaitingBonus: number
  AwaitingBonusWithoutNds: number
}

export interface NotificationGet {
  Lang: 'RU' | 'UK' | 'EN' | 'TR'
  SmsPhoneNumber: string
  Email: string
  EmailSubscriptions: EmailSubscriptionItem[]
}

export interface EmailSubscriptionItem {
  Option:
    | 'RECEIVE_RECOMMENDATIONS'
    | 'TRACK_MANAGED_CAMPAIGNS'
    | 'TRACK_POSITION_CHANGES'
  Value: 'YES' | 'NO'
}

export interface Representative {
  Login: string
  Email: string
  Role: 'CHIEF' | 'DELEGATE' | 'READONLY' | 'UNKNOWN'
}

export interface ClientRestrictionItem {
  Element:
    | 'CAMPAIGNS_TOTAL_PER_CLIENT'
    | 'CAMPAIGNS_UNARCHIVED_PER_CLIENT'
    | 'ADGROUPS_TOTAL_PER_CAMPAIGN'
    | 'ADS_TOTAL_PER_ADGROUP'
    | 'KEYWORDS_TOTAL_PER_ADGROUP'
    | 'AD_EXTENSIONS_TOTAL'
    | 'STAT_REPORTS_TOTAL_IN_QUEUE'
    | 'FORECAST_REPORTS_TOTAL_IN_QUEUE'
    | 'WORDSTAT_REPORTS_TOTAL_IN_QUEUE'
    | 'API_POINTS'
    | 'GENERAL_DOMAIN_BLACKLIST_SIZE'
    | 'VIDEO_DOMAIN_BLACKLIST_SIZE'
  Value: number
}

export interface ClientSettingGetItem {
  Option:
    | 'CORRECT_TYPOS_AUTOMATICALLY'
    | 'DISPLAY_STORE_RATING'
    | 'SHARED_ACCOUNT_ENABLED'
  Value: 'YES' | 'NO'
}

export interface TinInfoGet {
  TinType:
    | 'PHYSICAL'
    | 'FOREIGN_PHYSICAL'
    | 'LEGAL'
    | 'FOREIGN_LEGAL'
    | 'INDIVIDUAL'
  Tin?: string
}

export interface ErirAttributesGet {
  Organization?: OrganizationGet
  Contract?: ContractGet
  Contragent?: ContragentGet
}

export interface OrganizationGet {
  Name?: string
  EpayNumber?: string
  RegNumber?: string
  OksmNumber?: string
  OkvedCode?: string
}

export interface ContractGet {
  Number?: string
  Date?: string
  Type?: 'CONTRACT' | 'INTERMEDIARY_CONTRACT' | 'ADDITIONAL_AGREEMENT'
  ActionType?: 'COMMERCIAL' | 'DISTRIBUTION' | 'CONCLUDE' | 'OTHER'
  SubjectType?:
    | 'REPRESENTATION'
    | 'MEDIATION'
    | 'DISTRIBUTION'
    | 'ORG_DISTRIBUTION'
    | 'OTHER'
  Price?: PriceGet
}

export interface PriceGet {
  Amount: number
  IncludingVat: 'YES' | 'NO'
}

export interface ContragentGet {
  Name?: string
  Phone?: string
  EpayNumber?: string
  RegNumber?: string
  OksmNumber?: string
  TinInfo?: TinInfoGet
}
