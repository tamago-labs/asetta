export interface RWAProject {
  id: string;
  name: string;
  symbol: string;
  assetType: 'real-estate' | 'commodity' | 'art' | 'infrastructure' | 'bonds' | 'securities';
  totalSupply: number;
  price: number;
  marketCap: number;
  yield: number;
  images: string[];
  description: string;
  location?: string;
  documents: string[];
  performance24h: number;
  volume24h: number;
  liquidity: number;
  orderbook: OrderBookEntry[];
  vault: VaultInfo;
  chatHistory: ProjectChatMessage[];
  
  // Enhanced RWA properties
  jurisdiction: string;
  regulatoryCompliance: string[];
  kycRequirements: KYCRequirement;
  investmentRequirements: InvestmentRequirement;
  legalStructure: LegalStructure;
  riskFactors: string[];
  propertyDetails?: PropertyDetails;
  bondDetails?: BondDetails;
  customContent: CustomContent[];
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface KYCRequirement {
  level: 'basic' | 'enhanced' | 'institutional';
  requiredDocuments: string[];
  accreditationRequired: boolean;
  minimumAge: number;
  restrictedCountries: string[];
  complianceChecks: string[];
}

export interface InvestmentRequirement {
  minimumInvestment: number;
  maximumInvestment?: number;
  accreditedInvestorOnly: boolean;
  lockupPeriod?: number;
  earlyWithdrawalPenalty?: number;
  investorLimits?: {
    maxInvestors: number;
    maxRetailPercentage: number;
  };
}

export interface LegalStructure {
  entityType: string;
  registrationNumber: string;
  custodian: string;
  auditor: string;
  legalCounsel: string;
  regulatoryApprovals: string[];
  insuranceCoverage?: {
    provider: string;
    coverage: number;
    type: string;
  };
}

export interface PropertyDetails {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'mixed-use';
  size: {
    area: number;
    unit: 'sqft' | 'sqm';
  };
  yearBuilt: number;
  occupancyRate: number;
  rentalIncome: {
    monthly: number;
    leaseTerms: string;
    tenantProfile: string;
  };
  valuation: {
    currentValue: number;
    lastAppraisal: Date;
    appreciationRate: number;
  };
  expenses: {
    management: number;
    maintenance: number;
    taxes: number;
    insurance: number;
  };
}

export interface BondDetails {
  bondType: 'corporate' | 'municipal' | 'treasury' | 'asset-backed';
  creditRating: string;
  maturityDate: Date;
  couponRate: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  faceValue: number;
  issuer: {
    name: string;
    creditScore: number;
    financialStatement: string;
  };
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
}

export interface CustomContent {
  id: string;
  type: 'section' | 'metric' | 'chart' | 'document' | 'video' | 'image';
  title: string;
  content: string;
  order: number;
  visible: boolean;
  metadata?: Record<string, any>;
}

export interface OrderBookEntry {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  timestamp: Date;
  user: string;
}

export interface VaultInfo {
  totalStaked: number;
  apy: number;
  userStaked: number;
  rewards: number;
  lockPeriod: number;
}

export interface ProjectChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}