export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  description: string;
  color: string;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'file' | 'system';
  metadata?: {
    language?: string;
    fileName?: string;
    fileSize?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  assetType: string;
  value: string;
  progress: number;
  startDate: Date;
  estimatedCompletion: Date;
}

export const agents: Agent[] = [
  {
    id: 'pm',
    name: 'Project Manager',
    role: 'Project Orchestrator',
    avatar: '🎯',
    status: 'online',
    description: 'Coordinates all agents and manages project timeline',
    color: 'bg-blue-500'
  },
  {
    id: 'legal',
    name: 'Legal Compliance',
    role: 'Regulatory Expert',
    avatar: '⚖️',
    status: 'online',
    description: 'Ensures SEC compliance and legal requirements',
    color: 'bg-red-500'
  },
  {
    id: 'smart-contract',
    name: 'Smart Contract',
    role: 'Blockchain Developer',
    avatar: '🔗',
    status: 'away',
    description: 'Creates blockchain technology for asset tokenization',
    color: 'bg-purple-500'
  },
  {
    id: 'aws',
    name: 'AWS Q Agent',
    role: 'Infrastructure Consultant',
    avatar: '☁️',
    status: 'online',
    description: 'Designs and sets up cloud infrastructure',
    color: 'bg-orange-500'
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Agent',
    role: 'App Developer',
    avatar: '💻',
    status: 'busy',
    description: 'Builds investor-facing website and dashboard',
    color: 'bg-green-500'
  }
];

export const currentProject: Project = {
  id: 'manhattan-office',
  name: 'Manhattan Office Building',
  description: '$5M Manhattan office building tokenization',
  status: 'in_progress',
  assetType: 'Real Estate',
  value: '$5,000,000',
  progress: 65,
  startDate: new Date('2025-06-01'),
  estimatedCompletion: new Date('2025-07-15')
};

export const messages: Message[] = [
  {
    id: '1',
    agentId: 'pm',
    content: 'Welcome to your Manhattan Office Building tokenization project! I\'ve initiated the process and coordinated with all specialist agents.',
    timestamp: new Date('2025-06-19T09:00:00'),
    type: 'text'
  },
  {
    id: '2',
    agentId: 'legal',
    content: 'I\'ve completed the regulatory analysis for your Manhattan property. The asset qualifies for Regulation D 506(c) exemption. Preparing compliance documentation now.',
    timestamp: new Date('2025-06-19T09:15:00'),
    type: 'text'
  },
  {
    id: '3',
    agentId: 'legal',
    content: `// SEC Compliance Framework

class SECCompliance {
  constructor(assetType, jurisdiction) {
    this.assetType = assetType;
    this.jurisdiction = jurisdiction;
    this.regulations = this.loadRegulations();
  }

  validateOffering() {
    // Regulation D 506(c) validation
    return this.checkAccreditedInvestors() && 
           this.checkDisclosureRequirements();
  }

  generateDisclosures() {
    return {
      riskFactors: this.assessRisks(),
      financialStatements: this.prepareFinancials(),
      operatingAgreement: this.draftAgreement()
    };
  }
}`,
    timestamp: new Date('2025-06-19T09:30:00'),
    type: 'code',
    metadata: {
      language: 'javascript',
      fileName: 'SEC_Compliance.js'
    }
  },
  {
    id: '4',
    agentId: 'smart-contract',
    content: 'Smart contract architecture designed! Creating ERC-1400 security token with built-in compliance and transfer restrictions.',
    timestamp: new Date('2025-06-19T10:00:00'),
    type: 'text'
  },
  {
    id: '5',
    agentId: 'smart-contract',
    content: `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ManhattanOfficeToken is ERC20, Ownable {
    mapping(address => bool) public accreditedInvestors;
    uint256 public constant MAX_SUPPLY = 5000000; // $5M / $1 per token
    
    modifier onlyAccredited(address investor) {
        require(accreditedInvestors[investor], "Investor not accredited");
        _;
    }
    
    constructor() ERC20("Manhattan Office Token", "MOT") {}
    
    function addAccreditedInvestor(address investor) external onlyOwner {
        accreditedInvestors[investor] = true;
    }
    
    function transfer(address to, uint256 amount) 
        public 
        onlyAccredited(msg.sender) 
        onlyAccredited(to) 
        override 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
}`,
    timestamp: new Date('2025-06-19T10:15:00'),
    type: 'code',
    metadata: {
      language: 'solidity',
      fileName: 'ManhattanOfficeToken.sol'
    }
  },
  {
    id: '6',
    agentId: 'aws',
    content: 'Cloud infrastructure blueprint ready. Designing secure, scalable architecture with AWS Lambda, RDS, and CloudFront for optimal performance.',
    timestamp: new Date('2025-06-19T10:30:00'),
    type: 'text'
  },
  {
    id: '7',
    agentId: 'aws',
    content: `Resources:

🔄 AWS Lambda Functions: 12
💾 RDS PostgreSQL: Primary + Read Replica
🌐 CloudFront Distribution: Global CDN
🔒 WAF + Shield: DDoS Protection
📊 CloudWatch: Monitoring & Alerting
🔐 Cognito: User Authentication

Estimated Monthly Cost: $847
Expected Load: 10,000 users, 1M API calls`,
    timestamp: new Date('2025-06-19T10:45:00'),
    type: 'text'
  },
  {
    id: '8',
    agentId: 'fullstack',
    content: 'Investor portal wireframes completed. Building responsive React dashboard with real-time portfolio tracking and secure authentication.',
    timestamp: new Date('2025-06-19T11:00:00'),
    type: 'text'
  },
  {
    id: '9',
    agentId: 'fullstack',
    content: `Key features implemented:

✅ Responsive dashboard design
✅ Real-time token price updates
✅ Portfolio performance charts
✅ Secure wallet integration
✅ KYC/AML compliance flow
🔄 Trading interface (in progress)
🔄 Document repository (in progress)`,
    timestamp: new Date('2025-06-19T11:15:00'),
    type: 'text'
  },
  {
    id: '10',
    agentId: 'pm',
    content: 'Project status update: Legal compliance ✅ Smart contracts 🔄 AWS infrastructure 🔄 Frontend development 🔄',
    timestamp: new Date('2025-06-19T11:30:00'),
    type: 'system'
  },
  {
    id: '11',
    agentId: 'legal',
    content: 'Compliance update: All SEC filings prepared. Form D ready for submission. Investor accreditation verification system implemented.',
    timestamp: new Date('2025-06-19T12:00:00'),
    type: 'text'
  },
  {
    id: '12',
    agentId: 'pm',
    content: 'Milestone achieved! 🎉 Legal framework completed ahead of schedule. Smart contract deployment scheduled for tomorrow.',
    timestamp: new Date('2025-06-19T12:30:00'),
    type: 'system'
  },
  {
    id: '13',
    agentId: 'aws',
    content: `Infrastructure deployment status:

✅ VPC and Security Groups configured
✅ RDS PostgreSQL cluster deployed
✅ Lambda functions packaged and ready
🔄 CloudFront distribution propagating
🔄 SSL certificates provisioning
⏳ Load balancer configuration pending`,
    timestamp: new Date('2025-06-19T13:00:00'),
    type: 'text'
  },
  {
    id: '14',
    agentId: 'fullstack',
    content: 'Frontend development progress update: Authentication system complete, working on investor dashboard now. ETA for MVP: 48 hours.',
    timestamp: new Date('2025-06-19T13:30:00'),
    type: 'text'
  }
];
