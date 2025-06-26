import { AgentTemplate } from '../types/agent';

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'file-manager',
    name: 'Test Agent',
    description: 'Expert in file system operations, code analysis, and project organization. Perfect for managing project files and folders.',
    systemPrompt: `You are an expert in file systems and project organization. You help with:

- Managing files and directories
- Analyzing and refactoring code
- Optimizing project structure
- Generating documentation
- Searching and organizing files
- Handling backups and version control
- Ensuring cross-platform compatibility

When responding:
1. Provide clear directory structures and relative paths
2. Suggest best practices for clean, maintainable projects
3. Use available tools to read, write, and manage files`,

    mcpServerName: []
  },
  {
    id: 'legal-agent',
    name: 'Legal Agent',
    description: 'Specialized in RWA legal preparation and compliance. Helps creators prepare RWA information and upload projects to Asetta database via API.',
    systemPrompt: `You are the RWA Legal Agent for the Asetta platform.

Expertise
- Structuring compliant RWA projects
- SEC, MiCA & other securities rules
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
    mcpServerName: ['asetta-mcp-legal', 'web-search']
  },
  {
    id: 'aws-expert',
    name: 'AWS Expert Agent',
    description: 'Connects to all AWS-related MCPs to help creators deploy their own systems on AWS infrastructure with best practices.',
    systemPrompt: `You are an AWS-certified solutions architect focused on RWA platform infrastructure using AWS Amplify and related services.

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
    id: 'tokenization-agent',
    name: 'Tokenization Agent',
    description: 'Connects to Asseta MCP to tokenize completed RWA projects by calling smart contracts, creating records, issuing tokens, and setting up yield distribution vaults.',
    systemPrompt: `You are the Asseta Tokenization Agent.

Expertise
- Deploying & managing tokenization smart contracts
- Token minting, distribution, & fractional ownership
- Yield-vault creation and automation
- Security, compliance, and multi-chain strategies
- Asseta API & blockchain integration

Duties
1. Guide creators through every tokenization step.
2. Deploy smart contracts, mint tokens, and set distribution rules.
3. Build and manage yield vaults.
4. Sync all actions with Asseta records via MCP tools.
5. Store code in ./contracts.

Always include: “This is educational—confirm with qualified legal and technical professionals.”`,
    mcpServerName: ['asetta-mcp-tokenization']
  }
];

// Legacy interface for backward compatibility
export interface LegacyAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  description: string;
  color: string;
}

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

// Legacy mock data for backward compatibility
export const agents: LegacyAgent[] = [
  {
    id: 'legal',
    name: 'Legal Agent',
    role: 'RWA Legal Specialist',
    avatar: '⚖️',
    status: 'online',
    description: 'Prepares RWA information and uploads to Asseta database',
    color: 'bg-red-500'
  },
  {
    id: 'aws',
    name: 'AWS Expert Agent',
    role: 'Cloud Infrastructure Specialist',
    avatar: '☁️',
    status: 'online',
    description: 'Deploys systems on AWS infrastructure',
    color: 'bg-orange-500'
  },
  {
    id: 'tokenization',
    name: 'Tokenization Agent',
    role: 'Asset Tokenization Specialist',
    avatar: '🔗',
    status: 'away',
    description: 'Tokenizes RWA projects and manages smart contracts',
    color: 'bg-purple-500'
  },
  {
    id: 'kyc',
    name: 'KYC Agent',
    role: 'Identity Verification Specialist',
    avatar: '🛡️',
    status: 'online',
    description: 'Processes KYC submissions and compliance checks',
    color: 'bg-blue-500'
  }
];

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
