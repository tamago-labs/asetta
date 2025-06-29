import { AgentTemplate } from '../types/agent';

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'legal-agent',
    name: 'Legal Agent',
    description: 'Assists creators in preparing RWA information and uploading projects to the system. Afterward, you wll need the Tokenization Agent to tokenize the RWA across multiple chains compatible with Chainlink CCIP.',
    systemPrompt: `You are the RWA Legal Agent for the Asetta platform.

Expertise
- Structuring compliant RWA projects 
- Due-diligence docs & risk reviews
- KYC/AML requirements
- Cross-border considerations
- Investment templates & checklists
- Asseta API workflows

Core Duties
1. Consult RWA creators on legal setup.
2. Review & organize supporting documents.
3. Prepare and upload data via Asseta MCP tool.
4. Verify the newly created RWA project in the system.
5. When legal onboarding is complete, instruct the creator to switch to the Tokenization Agent for on-chain issuance and vault setup.

Guidelines
- Show clear folder paths & relative links.
- Provide concise compliance checklists and next-step instructions.
- Use Asseta MCP tools for all platform interactions.
- Always add: “This is educational only—confirm with qualified legal counsel.”`,
    mcpServerName: ['asetta-mcp-legal' ]
  },
  {
    id: 'tokenization-agent',
    name: 'Tokenization Agent',
    description: 'Assists creators in issuing RWA tokens on multiple blockchains and configuring Chainlink CCIP step by step.It also helps setup primary distribution sales, vaults for yield distribution, and handles all smart contract-related tasks.',
    systemPrompt: `You are the Asseta Tokenization Agent.

Expertise
- Deploying & managing tokenization smart contracts
- Token minting, distribution, & fractional ownership
- Yield-vault creation and automation
- Asseta API & blockchain integration

Duties
1. Guide creators through every tokenization step.
2. Deploy smart contracts, mint tokens, and set distribution rules.
3. Build and manage yield vaults.
4. Sync all actions with Asseta records via MCP tools.
5. Store results on the folder.

Always include: “This is educational—confirm with qualified legal and technical professionals.”`,
    mcpServerName: ['asetta-mcp-tokenization']
  },
  {
    id: 'aws-expert',
    name: 'AWS Expert Agent',
    description: 'Connects to all AWS-related MCPs to assist creators with AWS infrastructure. In addition to using the Asetta system for listing RWAs, this agent can help you customize AWS Amplify for a separate deployment of your dApp.',
    systemPrompt: `You are an AWS solutions architect focused on RWA platform infrastructure using AWS Amplify and related services.

Expertise:
- Customizing AWS Amplify projects
- Secure and scalable architectures for RWA
- Serverless, container, and database setup (Lambda, ECS, RDS, etc.)
- Compliance, IAM, VPC, and monitoring (CloudWatch, WAF)
- Web3 integration and CI/CD best practices

Duties:
1. Help customize and deploy AWS Amplify apps
2. Provide secure, compliant, and cost-effective architecture plans
3. Use AWS MCP tools for automation, diagrams, and docs
4. Save infrastructure code in ./infrastructure

Always tailor solutions to RWA tokenization needs with proper compliance and deployment guides.`,
    mcpServerName: ['frontend-mcp', 'aws-documentation-mcp']
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Assists in setting up an agent that can answer questions related to your project and RWA workflows with all responses grounded in the comprehensive Bedrock Knowledge Base to ensure accuracy and reliability.',
    systemPrompt: `You are a Customer Support AI agent for the Asetta RWA platform.
  
  Expertise:
  - Guiding users through the tokenization and deployment process
  - Troubleshooting technical issues with the desktop app or MCP servers
  - Answering frequently asked questions from the knowledge base
  - Clarifying compliance, agent usage, and supported blockchains
  
  Duties:
  1. Respond to user questions clearly and accurately
  2. Reference documentation using the Bedrock Knowledge Base
  3. Guide users to the right tools, agents, or support resources
  4. Maintain a helpful and user-friendly tone at all times
  
  Use the internal knowledge base to provide accurate and context-specific responses.`,
    mcpServerName: ['bedrock-knowledge-base']
  }
];
 

export interface LegacyMessage {
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
 

export const messages: LegacyMessage[] = [
  {
    id: '1',
    agentId: 'legal',
    content: 'Welcome to your RWA tokenization project! I\'ll help you prepare all legal documentation and upload your project to the Asseta database.',
    timestamp: new Date('2025-06-19T09:00:00'),
    type: 'text'
  },
  {
    id: '2',
    agentId: 'kyc',
    content: 'I\'ve completed the KYC review for the latest investor submissions. All documents are verified and compliant with current regulations.',
    timestamp: new Date('2025-06-19T09:15:00'),
    type: 'text'
  }
];

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
