import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, Settings, HelpCircle, Plus, FileText, X } from 'lucide-react';
import { RWAProject } from '../../types/trading';
import { TradingSidebar } from './sidebar/TradingSidebar';
import { HomeView } from './project/HomeView';
import { ProjectView } from './project/ProjectView';
import { FileManager } from '../FileManager';
import { SettingsModal } from '../setup/SettingsModal';
import { MCPManagerModal } from '../MCPManagerModal';
import { OnboardingManager } from '../auth/AuthComponents';
import { AppSettings } from '../../types/auth';
import { authService } from '../../services/auth';

interface TradingModeProps {
  onBackToWelcome: () => void;
}

export const TradingMode: React.FC<TradingModeProps> = ({ onBackToWelcome }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<RWAProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMCPManager, setShowMCPManager] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false); // Default hidden for trading mode

  useEffect(() => {
    // Load settings
    const savedSettings = authService.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }

    // Enhanced mock RWA projects data
    const mockProjects: RWAProject[] = [
      {
        id: '1',
        name: 'Manhattan Luxury Apartments',
        symbol: 'MLA',
        assetType: 'real-estate',
        totalSupply: 1000000,
        price: 12.50,
        marketCap: 12500000,
        yield: 6.8,
        images: ['/api/placeholder/300/200'],
        description: 'Premium real estate investment opportunity in the heart of Manhattan. This tokenized property offers consistent rental income and potential for capital appreciation in one of the worlds most desirable real estate markets.',
        location: 'New York, NY',
        documents: ['prospectus.pdf', 'valuation.pdf', 'legal.pdf'],
        performance24h: 2.3,
        volume24h: 125000,
        liquidity: 0.85,
        jurisdiction: 'United States (Delaware)',
        regulatoryCompliance: ['SEC Regulation D', 'FINRA Compliance'],
        kycRequirements: {
          level: 'enhanced',
          requiredDocuments: ['Government ID', 'Proof of Address', 'Income Verification', 'Accreditation Letter'],
          accreditationRequired: true,
          minimumAge: 21,
          restrictedCountries: ['Iran', 'North Korea', 'Syria'],
          complianceChecks: ['AML Screening', 'OFAC Check', 'PEP Screening']
        },
        investmentRequirements: {
          minimumInvestment: 25000,
          maximumInvestment: 500000,
          accreditedInvestorOnly: true,
          lockupPeriod: 180,
          earlyWithdrawalPenalty: 5,
          investorLimits: {
            maxInvestors: 99,
            maxRetailPercentage: 0
          }
        },
        legalStructure: {
          entityType: 'Delaware Statutory Trust',
          registrationNumber: 'DE-2024-MLA-001',
          custodian: 'Bank of New York Mellon',
          auditor: 'PwC LLP',
          legalCounsel: 'Skadden, Arps, Slate, Meagher & Flom',
          regulatoryApprovals: ['SEC 506(c) Exemption', 'Delaware Banking Commission'],
          insuranceCoverage: {
            provider: 'Lloyd\'s of London',
            coverage: 50000000,
            type: 'Property & Casualty'
          }
        },
        riskFactors: [
          'Real estate market volatility may affect property values',
          'Interest rate changes may impact property financing costs',
          'Local economic conditions may affect rental demand',
          'Property maintenance and capital improvements required',
          'Limited liquidity during lockup period',
          'Regulatory changes may affect investment structure'
        ],
        propertyDetails: {
          propertyType: 'residential',
          size: { area: 125000, unit: 'sqft' },
          yearBuilt: 2018,
          occupancyRate: 94,
          rentalIncome: {
            monthly: 185000,
            leaseTerms: 'Multi-year leases with annual escalation',
            tenantProfile: 'High-income professionals and executives'
          },
          valuation: {
            currentValue: 35000000,
            lastAppraisal: new Date('2024-01-15'),
            appreciationRate: 4.2
          },
          expenses: {
            management: 12500,
            maintenance: 8000,
            taxes: 15000,
            insurance: 3500
          }
        },
        customContent: [
          {
            id: 'amenities',
            type: 'section',
            title: 'Premium Amenities',
            content: 'The building features a 24/7 concierge service, state-of-the-art fitness center, rooftop terrace with Manhattan skyline views, private wine storage, and valet parking. Residents enjoy access to exclusive dining facilities and a business center.',
            order: 1,
            visible: true
          },
          {
            id: 'location',
            type: 'section',
            title: 'Prime Location Benefits',
            content: 'Located in the prestigious Upper East Side, the property is within walking distance of Central Park, world-class shopping on Madison Avenue, and top-rated restaurants. Excellent transportation links provide easy access to major business districts.',
            order: 2,
            visible: true
          }
        ],
        createdBy: 'Manhattan Real Estate Partners',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-12-15'),
        orderbook: [
          { id: '1', type: 'buy', price: 12.45, amount: 1000, total: 12450, timestamp: new Date(), user: 'user1' },
          { id: '2', type: 'buy', price: 12.40, amount: 2500, total: 31000, timestamp: new Date(), user: 'user2' },
          { id: '3', type: 'buy', price: 12.35, amount: 1500, total: 18525, timestamp: new Date(), user: 'user3' },
          { id: '4', type: 'sell', price: 12.55, amount: 800, total: 10040, timestamp: new Date(), user: 'user4' },
          { id: '5', type: 'sell', price: 12.60, amount: 1200, total: 15120, timestamp: new Date(), user: 'user5' },
        ],
        vault: {
          totalStaked: 2500000,
          apy: 8.5,
          userStaked: 15000,
          rewards: 125.50,
          lockPeriod: 90
        },
        chatHistory: [
          {
            id: '1',
            content: 'Welcome! How can I assist you with Manhattan Luxury Apartments today?',
            timestamp: new Date(Date.now() - 3600000),
            type: 'assistant'
          }
        ]
      },
      {
        id: '2',
        name: 'Swiss Corporate Bonds',
        symbol: 'SCB',
        assetType: 'bonds',
        totalSupply: 500000,
        price: 45.80,
        marketCap: 22900000,
        yield: 4.8,
        images: ['/api/placeholder/300/200'],
        description: 'High-grade corporate bonds issued by leading Swiss companies. Provides stable income with quarterly coupon payments and principal protection at maturity.',
        location: 'Switzerland',
        documents: ['prospectus.pdf', 'credit_analysis.pdf', 'terms.pdf'],
        performance24h: 0.5,
        volume24h: 89000,
        liquidity: 0.92,
        jurisdiction: 'Switzerland (FINMA)',
        regulatoryCompliance: ['FINMA Regulations', 'SIX Exchange Rules'],
        kycRequirements: {
          level: 'basic',
          requiredDocuments: ['Government ID', 'Proof of Address'],
          accreditationRequired: false,
          minimumAge: 18,
          restrictedCountries: ['Iran', 'North Korea'],
          complianceChecks: ['AML Screening', 'Sanctions Check']
        },
        investmentRequirements: {
          minimumInvestment: 5000,
          maximumInvestment: 1000000,
          accreditedInvestorOnly: false,
          lockupPeriod: 1095,
          investorLimits: {
            maxInvestors: 500,
            maxRetailPercentage: 80
          }
        },
        legalStructure: {
          entityType: 'Swiss Investment Fund',
          registrationNumber: 'CH-2024-SCB-002',
          custodian: 'Credit Suisse (Switzerland) Ltd',
          auditor: 'KPMG Switzerland',
          legalCounsel: 'Lenz & Staehelin',
          regulatoryApprovals: ['FINMA Authorization', 'SIX Listing Approval']
        },
        riskFactors: [
          'Credit risk of underlying bond issuers',
          'Interest rate risk affecting bond prices',
          'Currency risk for non-CHF investors',
          'Liquidity risk during market stress',
          'Regulatory changes in Swiss financial markets'
        ],
        bondDetails: {
          bondType: 'corporate',
          creditRating: 'AA-',
          maturityDate: new Date('2027-12-31'),
          couponRate: 4.8,
          paymentFrequency: 'quarterly',
          faceValue: 1000,
          issuer: {
            name: 'Swiss Corporate Bond Portfolio',
            creditScore: 750,
            financialStatement: 'Audited financials available'
          }
        },
        customContent: [
          {
            id: 'portfolio',
            type: 'section',
            title: 'Bond Portfolio Composition',
            content: 'The portfolio consists of 15 carefully selected Swiss corporate bonds from sectors including banking (25%), pharmaceuticals (20%), industrials (20%), consumer goods (15%), technology (10%), and utilities (10%). All bonds maintain investment-grade ratings.',
            order: 1,
            visible: true
          }
        ],
        createdBy: 'Alpine Asset Management',
        createdAt: new Date('2024-02-01'),
        lastUpdated: new Date('2024-12-15'),
        orderbook: [
          { id: '6', type: 'buy', price: 45.75, amount: 500, total: 22875, timestamp: new Date(), user: 'user6' },
          { id: '7', type: 'buy', price: 45.70, amount: 1000, total: 45700, timestamp: new Date(), user: 'user7' },
          { id: '8', type: 'sell', price: 45.85, amount: 300, total: 13755, timestamp: new Date(), user: 'user8' },
          { id: '9', type: 'sell', price: 45.90, amount: 750, total: 34425, timestamp: new Date(), user: 'user9' },
        ],
        vault: {
          totalStaked: 5200000,
          apy: 5.2,
          userStaked: 22500,
          rewards: 89.25,
          lockPeriod: 180
        },
        chatHistory: []
      },
      {
        id: '3',
        name: 'Renewable Energy Infrastructure',
        symbol: 'REI',
        assetType: 'infrastructure',
        totalSupply: 2000000,
        price: 8.25,
        marketCap: 16500000,
        yield: 9.5,
        images: ['/api/placeholder/300/200'],
        description: 'Investment in renewable energy infrastructure including solar farms and wind turbines. Generates steady income from energy production while contributing to sustainable development.',
        location: 'California, USA',
        documents: ['technical.pdf', 'financial.pdf', 'environmental.pdf'],
        performance24h: 4.1,
        volume24h: 75000,
        liquidity: 0.78,
        jurisdiction: 'United States (California)',
        regulatoryCompliance: ['FERC Regulations', 'CPUC Compliance', 'EPA Standards'],
        kycRequirements: {
          level: 'enhanced',
          requiredDocuments: ['Government ID', 'Proof of Address', 'Tax Returns'],
          accreditationRequired: false,
          minimumAge: 18,
          restrictedCountries: ['Iran', 'North Korea', 'Russia'],
          complianceChecks: ['AML Screening', 'OFAC Check']
        },
        investmentRequirements: {
          minimumInvestment: 10000,
          maximumInvestment: 250000,
          accreditedInvestorOnly: false,
          lockupPeriod: 365,
          investorLimits: {
            maxInvestors: 200,
            maxRetailPercentage: 60
          }
        },
        legalStructure: {
          entityType: 'California Limited Partnership',
          registrationNumber: 'CA-2024-REI-003',
          custodian: 'Wells Fargo Corporate Trust',
          auditor: 'Deloitte & Touche LLP',
          legalCounsel: 'Latham & Watkins LLP',
          regulatoryApprovals: ['FERC Market-Based Rate Authority', 'CPUC Certificate'],
          insuranceCoverage: {
            provider: 'Munich Re',
            coverage: 100000000,
            type: 'Infrastructure & Environmental'
          }
        },
        riskFactors: [
          'Weather dependency affecting energy generation',
          'Regulatory changes in renewable energy policy',
          'Technology obsolescence risk',
          'Power purchase agreement counterparty risk',
          'Maintenance and operational risks',
          'Grid interconnection and transmission risks'
        ],
        customContent: [
          {
            id: 'facilities',
            type: 'section',
            title: 'Infrastructure Portfolio',
            content: 'The portfolio includes 3 solar farms (150 MW total capacity) in Kern County and 2 wind farms (100 MW total capacity) in Riverside County. All facilities are covered by 20-year power purchase agreements with investment-grade utilities.',
            order: 1,
            visible: true
          },
          {
            id: 'environmental',
            type: 'section',
            title: 'Environmental Impact',
            content: 'These renewable energy assets prevent approximately 180,000 tons of CO2 emissions annually, equivalent to removing 39,000 cars from the road. The project contributes to California\'s goal of 100% clean electricity by 2045.',
            order: 2,
            visible: true
          }
        ],
        createdBy: 'GreenTech Infrastructure Partners',
        createdAt: new Date('2024-03-01'),
        lastUpdated: new Date('2024-12-15'),
        orderbook: [
          { id: '10', type: 'buy', price: 8.20, amount: 2000, total: 16400, timestamp: new Date(), user: 'user10' },
          { id: '11', type: 'buy', price: 8.15, amount: 3000, total: 24450, timestamp: new Date(), user: 'user11' },
          { id: '12', type: 'sell', price: 8.30, amount: 1500, total: 12450, timestamp: new Date(), user: 'user12' },
        ],
        vault: {
          totalStaked: 1800000,
          apy: 11.2,
          userStaked: 8250,
          rewards: 67.80,
          lockPeriod: 365
        },
        chatHistory: []
      }
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingsUpdate = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    authService.saveSettings(updatedSettings);
  };

  const handleResetApp = () => {
    authService.logout();
    localStorage.removeItem('hasSeenOnboarding');
    onBackToWelcome();
  };

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading trading platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <TradingSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
        />

        {/* Main Content */}
        <div className="flex-1 h-full">
          {selectedProject ? (
            <ProjectView project={selectedProject} />
          ) : (
            <HomeView 
              projects={projects} 
              onProjectSelect={setSelectedProjectId}
            />
          )}
        </div>

        {/* File Manager - Toggleable */}
        {showFileManager && (
          <div className="w-80 h-full">
            <FileManager
              projectPath={settings?.workspace?.defaultFolder || null}
              onFileSelect={() => {}}
              selectedFile={null}
              onProjectPathChange={() => {}}
              onHide={() => setShowFileManager(false)}
            />
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      {!showFileManager && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setShowFileManager(true)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors bg-slate-800 shadow-lg text-slate-400 hover:text-white"
            title="Show File Explorer"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 z-30 flex gap-2">
        <button
          onClick={onBackToWelcome}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors bg-slate-800 shadow-lg"
          title="Back to Mode Selection"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowOnboarding(true)}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors bg-slate-800 shadow-lg"
          title="Help Tour"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowMCPManager(true)}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors bg-slate-800 shadow-lg"
          title="Manage MCP Servers"
        >
          <Server className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors bg-slate-800 shadow-lg"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      {showSettings && settings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
          onResetApp={handleResetApp}
        />
      )}

      {showMCPManager && (
        <MCPManagerModal
          isOpen={showMCPManager}
          onClose={() => setShowMCPManager(false)}
        />
      )}

      {showOnboarding && (
        <OnboardingManager
          isActive={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};