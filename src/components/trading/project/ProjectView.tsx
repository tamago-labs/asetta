import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins, Lock, MessageCircle, BarChart3, Users, Shield, FileText, Building2, AlertTriangle } from 'lucide-react';
import { RWAProject } from '../../../types/trading';
import { ProjectChat } from '../chat/ProjectChat';

interface ProjectViewProps {
  project: RWAProject;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orderbook' | 'vault' | 'assistant'>('assistant');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);

  const isPositive = project.performance24h >= 0;

  const buyOrders = project.orderbook.filter(order => order.type === 'buy').slice(0, 10);
  const sellOrders = project.orderbook.filter(order => order.type === 'sell').slice(0, 10);

  const renderCustomContent = () => {
    return project.customContent
      .filter(content => content.visible)
      .sort((a, b) => a.order - b.order)
      .map((content) => (
        <div key={content.id} className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">{content.title}</h3>
          <div className="text-slate-300 whitespace-pre-line">{content.content}</div>
        </div>
      ));
  };

  const renderPropertyDetails = () => {
    if (!project.propertyDetails) return null;

    const { propertyDetails } = project;
    const netIncome = propertyDetails.rentalIncome.monthly -
      (propertyDetails.expenses.management + propertyDetails.expenses.maintenance +
        propertyDetails.expenses.taxes + propertyDetails.expenses.insurance);

    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Property Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Property Type</div>
            <div className="text-white capitalize">{propertyDetails.propertyType.replace('-', ' ')}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Size</div>
            <div className="text-white">{propertyDetails.size.area.toLocaleString()} {propertyDetails.size.unit}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Year Built</div>
            <div className="text-white">{propertyDetails.yearBuilt}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Occupancy Rate</div>
            <div className="text-green-400">{propertyDetails.occupancyRate}%</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Monthly Rental Income</div>
            <div className="text-green-400">{formatCurrency(propertyDetails.rentalIncome.monthly)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Net Monthly Income</div>
            <div className="text-green-400">{formatCurrency(netIncome)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Current Valuation</div>
            <div className="text-white">{formatCurrency(propertyDetails.valuation.currentValue)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Annual Appreciation</div>
            <div className="text-green-400">{propertyDetails.valuation.appreciationRate}%</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBondDetails = () => {
    if (!project.bondDetails) return null;

    const { bondDetails } = project;
    const daysToMaturity = Math.ceil((bondDetails.maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Bond Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Bond Type</div>
            <div className="text-white capitalize">{bondDetails.bondType.replace('-', ' ')}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Credit Rating</div>
            <div className="text-white">{bondDetails.creditRating}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Coupon Rate</div>
            <div className="text-green-400">{bondDetails.couponRate}%</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Payment Frequency</div>
            <div className="text-white capitalize">{bondDetails.paymentFrequency.replace('-', ' ')}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Face Value</div>
            <div className="text-white">{formatCurrency(bondDetails.faceValue)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Days to Maturity</div>
            <div className="text-white">{daysToMaturity.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Issuer</div>
            <div className="text-white">{bondDetails.issuer.name}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Credit Score</div>
            <div className="text-white">{bondDetails.issuer.creditScore}</div>
          </div>
        </div>
        {bondDetails.collateral && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Collateral</div>
            <div className="text-white">{bondDetails.collateral.type}: {formatCurrency(bondDetails.collateral.value)}</div>
            <div className="text-sm text-slate-300 mt-1">{bondDetails.collateral.description}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-screen  overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start gap-4">
          <img
            src={project.images[0] || '/api/placeholder/100/100'}
            alt={project.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className="text-lg font-mono text-slate-400">{project.symbol}</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${isPositive
                ? 'bg-green-900/80 text-green-300'
                : 'bg-red-900/80 text-red-300'
                }`}>
                {isPositive ? '+' : ''}{project.performance24h.toFixed(2)}%
              </span>
            </div>
            <p className="text-slate-400 capitalize">{project.assetType.replace('-', ' ')} • {project.location} • {project.jurisdiction}</p>
            <div className="flex items-center gap-6 mt-2">
              <div className="text-2xl font-bold text-white">{formatCurrency(project.price)}</div>
              <div className="text-sm text-slate-400">
                Market Cap: {formatCurrency(project.marketCap)}
              </div>
              <div className="text-sm text-slate-400">
                24h Volume: {formatCurrency(project.volume24h)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b  border-slate-700">
        <div className="flex px-0">
          {[
            { id: 'assistant', label: 'Assistant', icon: MessageCircle },
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'orderbook', label: 'Orderbook', icon: TrendingUp },
            { id: 'vault', label: 'Vault', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1   flex flex-col overflow-hidden">
        {/* Main Content with scrolling - Fixed height to leave space for chat */}
        <div className="flex-1 overflow-y-auto ">
          {activeTab === 'overview' && (
            <div className="space-y-6 m-6 ">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Supply</div>
                  <div className="text-xl font-bold text-white">{project.totalSupply.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Yield</div>
                  <div className="text-xl font-bold text-green-400">{project.yield}%</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Liquidity</div>
                  <div className="text-xl font-bold text-white">{(project.liquidity * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Min Investment</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(project.investmentRequirements.minimumInvestment)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                <p className="text-slate-300 leading-relaxed">{project.description}</p>
              </div>

              {/* Investment Requirements */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Investment Requirements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Minimum Investment</div>
                    <div className="text-white">{formatCurrency(project.investmentRequirements.minimumInvestment)}</div>
                  </div>
                  {project.investmentRequirements.maximumInvestment && (
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Maximum Investment</div>
                      <div className="text-white">{formatCurrency(project.investmentRequirements.maximumInvestment)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Accredited Investor</div>
                    <div className={project.investmentRequirements.accreditedInvestorOnly ? "text-red-400" : "text-green-400"}>
                      {project.investmentRequirements.accreditedInvestorOnly ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                  {project.investmentRequirements.lockupPeriod && (
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Lockup Period</div>
                      <div className="text-white">{project.investmentRequirements.lockupPeriod} days</div>
                    </div>
                  )}
                </div>
              </div>

              {/* KYC Requirements */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  KYC Requirements
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">KYC Level</div>
                    <div className="text-white capitalize">{project.kycRequirements.level}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Minimum Age</div>
                    <div className="text-white">{project.kycRequirements.minimumAge} years</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-slate-400 mb-2">Required Documents</div>
                  <div className="flex flex-wrap gap-2">
                    {project.kycRequirements.requiredDocuments.map((doc, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                {project.kycRequirements.restrictedCountries.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Restricted Countries</div>
                    <div className="text-sm text-red-400">{project.kycRequirements.restrictedCountries.join(', ')}</div>
                  </div>
                )}
              </div>

              {/* Legal Structure */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Legal Structure
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Entity Type</div>
                    <div className="text-white">{project.legalStructure.entityType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Registration</div>
                    <div className="text-white">{project.legalStructure.registrationNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Custodian</div>
                    <div className="text-white">{project.legalStructure.custodian}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Auditor</div>
                    <div className="text-white">{project.legalStructure.auditor}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-slate-400 mb-2">Regulatory Approvals</div>
                  <div className="flex flex-wrap gap-2">
                    {project.legalStructure.regulatoryApprovals.map((approval, index) => (
                      <span key={index} className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-sm">
                        {approval}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Risk Factors
                </h3>
                <div className="space-y-2">
                  {project.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-slate-300 text-sm">{risk}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property/Bond Details */}
              {renderPropertyDetails()}
              {renderBondDetails()}

              {/* Custom Content */}
              {renderCustomContent()}
            </div>
          )}

          {activeTab === 'orderbook' && (
            <div className="grid grid-cols-2 gap-6 m-6">
              {/* Buy Orders */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Buy Orders
                </h3>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-3 border-b border-slate-700 text-sm font-medium text-slate-400">
                    <div>Price</div>
                    <div>Amount</div>
                    <div>Total</div>
                  </div>
                  {buyOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-3 gap-4 p-3 border-b border-slate-700 text-sm">
                      <div className="text-green-400">{formatCurrency(order.price)}</div>
                      <div className="text-white">{order.amount.toLocaleString()}</div>
                      <div className="text-slate-300">{formatCurrency(order.total)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Orders */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Sell Orders
                </h3>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-3 border-b border-slate-700 text-sm font-medium text-slate-400">
                    <div>Price</div>
                    <div>Amount</div>
                    <div>Total</div>
                  </div>
                  {sellOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-3 gap-4 p-3 border-b border-slate-700 text-sm">
                      <div className="text-red-400">{formatCurrency(order.price)}</div>
                      <div className="text-white">{order.amount.toLocaleString()}</div>
                      <div className="text-slate-300">{formatCurrency(order.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="space-y-6 m-6">
              {/* Vault Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Staked</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(project.vault.totalStaked)}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">APY</div>
                  <div className="text-xl font-bold text-green-400">{project.vault.apy}%</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Lock Period</div>
                  <div className="text-xl font-bold text-white">{project.vault.lockPeriod} days</div>
                </div>
              </div>

              {/* Your Staking */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Staking</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Staked Amount</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(project.vault.userStaked)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Pending Rewards</div>
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(project.vault.rewards)}</div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-slate-300 text-sm mb-2">💬 Use the Assistant tab to:</p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>• Stake more tokens</div>
                    <div>• Claim rewards</div>
                    <div>• Check staking status</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="h-full">
              <ProjectChat project={project} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};