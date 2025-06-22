import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Plus, Paperclip, TrendingUp, TrendingDown, Lock, DollarSign } from 'lucide-react';
import { RWAProject, ProjectChatMessage } from '../../../types/trading';

interface ProjectChatProps {
  project: RWAProject;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({ project }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ProjectChatMessage[]>(project.chatHistory);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: ProjectChatMessage = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response based on message content
    setTimeout(() => {
      let aiResponse = '';
      const lowerMessage = message.toLowerCase();

      // Trading Actions
      if (lowerMessage.includes('buy') && (lowerMessage.includes('token') || lowerMessage.includes(project.symbol.toLowerCase()))) {
        aiResponse = `I can help you buy ${project.symbol} tokens! 

Current price: ${formatCurrency(project.price)}
Minimum investment: ${formatCurrency(project.investmentRequirements.minimumInvestment)}
Available liquidity: ${(project.liquidity * 100).toFixed(1)}%

To proceed, please specify:
• How much would you like to invest? (e.g., "$5,000" or "100 tokens")
• Order type: Market order (immediate) or Limit order (specific price)

Note: ${project.investmentRequirements.accreditedInvestorOnly ? 'This requires accredited investor status.' : 'Open to all qualified investors.'}`;
      } 
      else if (lowerMessage.includes('sell') && (lowerMessage.includes('token') || lowerMessage.includes(project.symbol.toLowerCase()))) {
        aiResponse = `I can help you sell your ${project.symbol} tokens.

Current price: ${formatCurrency(project.price)}
Your holdings: ${project.vault.userStaked > 0 ? `${formatCurrency(project.vault.userStaked)} staked` : 'Please specify your holdings'}

To proceed:
• How many tokens would you like to sell?
• Market order (current price) or Limit order (set your price)?

${project.investmentRequirements.lockupPeriod ? `⚠️ Note: There's a ${project.investmentRequirements.lockupPeriod} day lockup period. ` : ''}${project.investmentRequirements.earlyWithdrawalPenalty ? `Early withdrawal incurs a ${project.investmentRequirements.earlyWithdrawalPenalty}% penalty.` : ''}`;
      }
      // Staking Actions
      else if (lowerMessage.includes('stake') && !lowerMessage.includes('unstake')) {
        aiResponse = `Great choice! Staking ${project.symbol} tokens earns you ${project.vault.apy}% APY.

Current staking info:
• Your staked amount: ${formatCurrency(project.vault.userStaked)}
• Pending rewards: ${formatCurrency(project.vault.rewards)}
• Lock period: ${project.vault.lockPeriod} days
• Total pool: ${formatCurrency(project.vault.totalStaked)}

To stake more:
• How much would you like to stake?
• You can stake any amount of ${project.symbol} tokens you own
• Rewards are calculated daily and can be claimed anytime

Just tell me the amount like "stake $1,000" or "stake 50 tokens"`;
      }
      else if (lowerMessage.includes('unstake') || lowerMessage.includes('withdraw') || lowerMessage.includes('claim')) {
        aiResponse = `I can help you with staking rewards and withdrawals.

Your staking position:
• Staked: ${formatCurrency(project.vault.userStaked)}
• Rewards: ${formatCurrency(project.vault.rewards)}
• APY: ${project.vault.apy}%

Available actions:
• "Claim rewards" - Withdraw ${formatCurrency(project.vault.rewards)} in earnings
• "Unstake [amount]" - Withdraw principal (subject to lock period)
• "Check lock period" - See when you can withdraw

${project.vault.lockPeriod > 0 ? `⏰ Lock period: ${project.vault.lockPeriod} days remaining` : '✅ No lock period - withdraw anytime'}`;
      }
      // Price and Market Info
      else if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('performance')) {
        aiResponse = `📊 ${project.name} (${project.symbol}) Market Data:

Current Price: ${formatCurrency(project.price)}
24h Change: ${project.performance24h > 0 ? '+' : ''}${project.performance24h.toFixed(2)}% ${project.performance24h > 0 ? '📈' : '📉'}
Market Cap: ${formatCurrency(project.marketCap)}
24h Volume: ${formatCurrency(project.volume24h)}
Liquidity: ${(project.liquidity * 100).toFixed(1)}%

Recent orderbook:
• Highest buy: ${formatCurrency(Math.max(...project.orderbook.filter(o => o.type === 'buy').map(o => o.price)))}
• Lowest sell: ${formatCurrency(Math.min(...project.orderbook.filter(o => o.type === 'sell').map(o => o.price)))}

Ready to trade? Just say "buy" or "sell"!`;
      }
      // KYC and Compliance
      else if (lowerMessage.includes('kyc') || lowerMessage.includes('verification') || lowerMessage.includes('document')) {
        aiResponse = `🛡️ KYC Requirements for ${project.name}:

Verification Level: ${project.kycRequirements.level.toUpperCase()}
Required Documents: ${project.kycRequirements.requiredDocuments.join(', ')}
${project.kycRequirements.accreditationRequired ? '⚠️ Accredited investor status required' : '✅ Open to all qualified investors'}
Minimum Age: ${project.kycRequirements.minimumAge} years

Process:
1. Upload required documents
2. Identity verification (2-3 business days)
3. ${project.kycRequirements.accreditationRequired ? 'Accreditation review' : 'Final approval'}
4. Trading access granted

${project.kycRequirements.restrictedCountries.length > 0 ? `❌ Restricted countries: ${project.kycRequirements.restrictedCountries.join(', ')}` : ''}

Ready to start KYC? I can guide you through each step!`;
      }
      // Risk and Legal
      else if (lowerMessage.includes('risk') || lowerMessage.includes('legal') || lowerMessage.includes('regulation')) {
        aiResponse = `⚖️ Legal & Risk Information:

Legal Structure: ${project.legalStructure.entityType}
Jurisdiction: ${project.jurisdiction}
Custodian: ${project.legalStructure.custodian}
Auditor: ${project.legalStructure.auditor}

Key Risk Factors:
${project.riskFactors.slice(0, 3).map((risk, i) => `${i + 1}. ${risk}`).join('\n')}

Regulatory Compliance: ${project.regulatoryCompliance.join(', ')}

This information is provided for transparency. Please consult with your financial advisor before investing.`;
      }
      // Yield and Returns
      else if (lowerMessage.includes('yield') || lowerMessage.includes('return') || lowerMessage.includes('income')) {
        aiResponse = `💰 Yield Information for ${project.name}:

Annual Yield: ${project.yield}%
${project.propertyDetails ? `
Rental Income: ${formatCurrency(project.propertyDetails.rentalIncome.monthly)}/month
Occupancy Rate: ${project.propertyDetails.occupancyRate}%
Net Income: ${formatCurrency(project.propertyDetails.rentalIncome.monthly - (project.propertyDetails.expenses.management + project.propertyDetails.expenses.maintenance + project.propertyDetails.expenses.taxes + project.propertyDetails.expenses.insurance))}/month` : ''}

Additional Earning Opportunities:
• Staking Rewards: ${project.vault.apy}% APY
• Capital Appreciation: Historical ${project.propertyDetails?.valuation.appreciationRate || 'N/A'}% annually

Want to start earning? You can:
• Buy tokens for yield exposure
• Stake tokens for additional rewards`;
      }
      // Property/Asset Details
      else if (lowerMessage.includes('property') || lowerMessage.includes('asset') || lowerMessage.includes('building')) {
        if (project.propertyDetails) {
          aiResponse = `🏢 Property Details:

Type: ${project.propertyDetails.propertyType.replace('-', ' ')}
Size: ${project.propertyDetails.size.area.toLocaleString()} ${project.propertyDetails.size.unit}
Year Built: ${project.propertyDetails.yearBuilt}
Location: ${project.location}

Financial Performance:
• Current Valuation: ${formatCurrency(project.propertyDetails.valuation.currentValue)}
• Appreciation Rate: ${project.propertyDetails.valuation.appreciationRate}%/year
• Occupancy: ${project.propertyDetails.occupancyRate}%
• Monthly Rent: ${formatCurrency(project.propertyDetails.rentalIncome.monthly)}

The property generates consistent income through ${project.propertyDetails.rentalIncome.leaseTerms.toLowerCase()}.`;
        } else if (project.bondDetails) {
          aiResponse = `📋 Bond Details:

Type: ${project.bondDetails.bondType.replace('-', ' ')}
Credit Rating: ${project.bondDetails.creditRating}
Coupon Rate: ${project.bondDetails.couponRate}%
Maturity: ${project.bondDetails.maturityDate.toLocaleDateString()}
Payment Frequency: ${project.bondDetails.paymentFrequency}

Issuer: ${project.bondDetails.issuer.name}
Face Value: ${formatCurrency(project.bondDetails.faceValue)}
${project.bondDetails.collateral ? `Collateral: ${project.bondDetails.collateral.type}` : ''}`;
        }
      }
      // General Help
      else if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what can')) {
        aiResponse = `👋 I'm your ${project.name} assistant! Here's what I can help you with:

🔹 Trading Actions:
• "Buy tokens" - Purchase ${project.symbol}
• "Sell tokens" - Liquidate holdings
• "Check price" - Current market data

🔹 Staking & Rewards:
• "Stake tokens" - Earn ${project.vault.apy}% APY
• "Claim rewards" - Withdraw earnings
• "Check staking" - View your position

🔹 Information:
• "KYC requirements" - Verification process
• "Risk factors" - Investment risks
• "Property details" - Asset information

🔹 Quick Commands:
Just type what you want to do! Examples:
• "Buy $5,000 of tokens"
• "Stake 100 tokens"
• "What's the current price?"
• "Claim my rewards"`;
      }
      // Specific dollar amounts or token amounts
      else if (lowerMessage.match(/\$[0-9,]+|[0-9,]+ tokens?/)) {
        const amount = lowerMessage.match(/\$([0-9,]+)|([0-9,]+) tokens?/);
        const value = amount ? amount[1] || amount[2] : '0';
        
        if (lowerMessage.includes('buy')) {
          aiResponse = `Perfect! You want to buy ${amount[0]} of ${project.symbol}.

Order Summary:
• Amount: ${amount[0]}
• Current Price: ${formatCurrency(project.price)}
• Estimated Tokens: ${amount[1] ? Math.floor(parseInt(amount[1].replace(',', '')) / project.price) : Math.floor(parseInt(value.replace(',', '')))} ${project.symbol}

Confirm your order:
• "Confirm buy order" - Execute at market price
• "Set limit order at $X" - Wait for specific price
• "Cancel" - Cancel this order

${project.investmentRequirements.lockupPeriod ? `⚠️ Reminder: ${project.investmentRequirements.lockupPeriod} day lockup period applies` : ''}`;
        } else if (lowerMessage.includes('stake')) {
          aiResponse = `Excellent! Staking ${amount[0]} for ${project.vault.apy}% APY.

Staking Details:
• Amount to stake: ${amount[0]}
• Annual Rewards: ~${formatCurrency(parseInt(value.replace(',', '')) * (project.vault.apy / 100))}
• Lock Period: ${project.vault.lockPeriod} days
• Daily Rewards: ~${formatCurrency(parseInt(value.replace(',', '')) * (project.vault.apy / 100) / 365)}

Ready to stake?
• "Confirm staking" - Execute the stake
• "Cancel" - Cancel this action`;
        }
      }
      else {
        // Default response
        aiResponse = `Hello! I'm the AI assistant for ${project.name} (${project.symbol}). 

I can help you with:
💼 Trading: "buy tokens", "sell tokens", "check price"
🏦 Staking: "stake tokens", "claim rewards" 
📋 Information: "KYC requirements", "risk factors"

Current price: ${formatCurrency(project.price)} (${project.performance24h > 0 ? '+' : ''}${project.performance24h.toFixed(2)}%)

What would you like to do?`;
      }

      const response: ProjectChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        timestamp: new Date(),
        type: 'assistant'
      };

      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const renderMessage = (msg: ProjectChatMessage) => {
    return (
      <div key={msg.id} className="group hover:bg-slate-800/30 px-4 py-3 transition-colors">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${
              msg.type === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {msg.type === 'user' ? '👤' : '🤖'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="font-semibold text-white">
                {msg.type === 'user' ? 'You' : `${project.name} Assistant`}
              </span>
              <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="mt-1">
              <div className="text-slate-200 text-sm leading-relaxed mt-1">
                {msg.content.split('\n').map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-medium">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg">
              # {project.name.toLowerCase().replace(/\s+/g, '-')}-assistant
            </h2>
            <p className="text-sm text-slate-400">
              Trade, stake, and get project information
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickAction('buy tokens')}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs font-medium transition-colors"
          >
            <TrendingUp className="w-3 h-3" />
            Buy Tokens
          </button>
          <button
            onClick={() => handleQuickAction('sell tokens')}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
          >
            <TrendingDown className="w-3 h-3" />
            Sell Tokens
          </button>
          <button
            onClick={() => handleQuickAction('stake tokens')}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Lock className="w-3 h-3" />
            Stake
          </button>
          <button
            onClick={() => handleQuickAction('claim rewards')}
            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg text-xs font-medium transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Claim
          </button>
          <button
            onClick={() => handleQuickAction('check price')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            📊 Price
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="py-2">
          {messages.length > 0 ? (
            messages.map(renderMessage)
          ) : (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">Ready to trade {project.symbol}?</h3>
              <p className="text-sm mb-4">Use the quick actions above or type your request</p>
              <div className="text-xs text-slate-500">
                Try: "buy $5000 tokens" or "stake 100 tokens"
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end space-x-3">
            <button 
              type="button"
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Buy, sell, stake ${project.symbol} or ask questions...`}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="button"
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
              >
                <Paperclip size={16} />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!message.trim()}
              className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};