# Asseta.xyz - Web3 RWA MCP Desktop Application

> **Multi-Agent Orchestration for Web3 Real World Assets using AWS and Chainlink**

Asseta.xyz is a Tauri desktop application that leverages Model Context Protocol (MCP) to enable multi-agent orchestration for building Web3 Real World Asset (RWA) projects. The platform integrates AWS cloud services and Chainlink oracles to create comprehensive blockchain solutions for asset tokenization, featuring specialized MCP servers for different blockchain ecosystems including Story Protocol for IP assets.

![Asseta.xyz](https://img.shields.io/badge/Platform-Desktop-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Tauri](https://img.shields.io/badge/Tauri-2+-24C8DB?logo=tauri)
![MCP](https://img.shields.io/badge/MCP-Protocol-purple)

## 🚀 **What is Asseta.xyz?**

Asseta.xyz is a revolutionary desktop application that uses Model Context Protocol (MCP) to orchestrate multiple AI agents for Web3 Real World Asset development. The platform provides a unified interface to manage blockchain projects that integrate:

- **🔗 Multiple Blockchain Networks**: Aptos, Sui, XRPL, Story Protocol
- **☁️ AWS Cloud Services**: Infrastructure automation and deployment
- **📡 Chainlink Oracles**: Real-world data feeds and decentralized services
- **🎨 Story Protocol**: IP asset management and licensing
- **🗂️ File System Operations**: Project management and code generation

---

## 🤖 **MCP Server Integration**

The application features a comprehensive MCP server management system with pre-configured templates for Web3 development:

### **Available MCP Servers**

| Server | Description | Tools | Category |
|--------|-------------|-------|----------|
| **Filesystem** | File operations and project navigation | File read/write, directory listing | Core |
| **Smart Contract MCP** | 50+ tools for smart contract development | Aptos CLI, Sui CLI, Foundry for Move/Solidity | Web3 |
| **AWS Amplify Frontend** | Frontend web application deployment | Build, customize, deploy web apps | AWS |
| **AWS S3** | Object storage and file management | Storage, file ops, static hosting | AWS |
| **AWS ECS** | Container orchestration service | Container deployment, orchestration | AWS |
| **AWS Lambda** | Serverless function development | Function deployment, serverless ops | AWS |
| **Web Search** | Research and documentation | Web search, content scraping | Utility |

### **MCP Features**

- **🔄 Real-time Server Management**: Start, stop, and restart MCP servers
- **⚙️ Environment Configuration**: Secure API key and environment setup
- **🛠️ Tool Discovery**: Automatic detection of available tools per server
- **📊 Status Monitoring**: Real-time server health and connection status
- **🎯 Custom Server Addition**: Add and configure custom MCP servers

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Desktop App                        │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (TypeScript)                               │
│  ├── Claude AI Integration (Anthropic SDK)                │
│  ├── MCP Service Layer                                     │
│  └── UI Components (Tailwind CSS)                         │
├─────────────────────────────────────────────────────────────┤
│  Rust Backend                                              │
│  ├── MCP Client Implementation                             │
│  ├── JSON-RPC Protocol Handling                           │
│  └── Process Management                                    │
├─────────────────────────────────────────────────────────────┤
│                    MCP Servers                             │
│  ├── 🗂️  Filesystem Server                                │
│  ├── 🌐  Story Protocol MCP                               │
│  ├── 📡  Chainlink MCP                                    │
│  ├── 🔷  Aptos MCP Server                                 │
│  ├── 🔹  Sui MCP Server                                   │
│  ├── 🟦  XRPL MCP Server                                  │
│  ├── ☁️   AWS MCP Server                                  │
│  └── 🔍  Web Search MCP                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive design
- **Monaco Editor** for code editing and syntax highlighting
- **Lucide React** for consistent iconography

### **Backend**
- **Tauri 2.0** for cross-platform desktop application
- **Rust** for high-performance native operations
- **Tokio** for async runtime and process management
- **Serde JSON** for data serialization

### **AI & Integration**
- **Anthropic Claude SDK** for AI agent conversations
- **Model Context Protocol (MCP)** for tool orchestration
- **JSON-RPC 2.0** for MCP server communication

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- Rust and Cargo ([Install Guide](https://rustup.rs/))
- Claude API Key ([Get Here](https://console.anthropic.com/))

### **Installation**

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd build-your-dream
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run tauri dev
   ```

4. **Production Build**
   ```bash
   npm run tauri build
   ```

### **Configuration**

1. **API Keys Setup**: Configure your Claude API key in the settings
2. **Workspace Selection**: Choose your project workspace folder
3. **MCP Servers**: Configure blockchain network credentials and API keys
4. **Environment Variables**: Set up AWS credentials, private keys, and other secrets

---

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── Sidebar.tsx      # Navigation and agent management
│   ├── ChatArea.tsx     # AI conversation interface
│   ├── FileManager.tsx  # Project file browser
│   ├── MCPManagerModal.tsx # MCP server management
│   └── auth/           # Authentication components
├── services/           # Core service layer
│   ├── mcpService.ts   # MCP protocol integration
│   ├── tauriMCPService.ts # Tauri backend communication
│   ├── claude.ts       # Claude AI integration
│   └── agentService.ts # Agent management
├── types/             # TypeScript definitions
│   ├── mcp.ts         # MCP-related types
│   ├── agent.ts       # Agent and conversation types
│   └── auth.ts        # Authentication types
└── utils/             # Utility functions
    └── logger.ts      # Logging system

src-tauri/
├── src/
│   ├── lib.rs         # Main Tauri application
│   ├── mcp.rs         # MCP client implementation
│   └── main.rs        # Application entry point
└── Cargo.toml         # Rust dependencies
```

---

## 🔧 **MCP Server Configuration**

### **Smart Contract Development**

#### **Smart Contract MCP**
```bash
npx -y @tamago-labs/smart-contract-mcp
```
**Prerequisites:**
- **Foundry** (for Ethereum/EVM): `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Aptos CLI**: `curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3`
- **Sui CLI**: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`

**Features:**
- 50+ MCP tools for comprehensive smart contract development
- Multi-blockchain support: Aptos (Move), Sui (Move), Ethereum/EVM (Solidity)
- CLI integration for Move and Solidity development and testing
- Production-ready tools for deployment, testing, and contract interaction

### **AWS Cloud Services**

#### **AWS Amplify Frontend MCP**
```bash
npx -y @aws/mcp-server-amplify-frontend
```
Environment variables:
- `AWS_REGION`: Target AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

#### **AWS S3 MCP**
```bash
npx -y @aws/mcp-server-s3
```
- Object storage and file management
- Static website hosting operations
- Bucket management and configuration

#### **AWS ECS MCP**
```bash
npx -y @aws/mcp-server-ecs
```
- Container orchestration and deployment
- Service management and scaling
- Task definition and cluster operations

#### **AWS Lambda MCP**
```bash
npx -y @aws/mcp-server-lambda
```
- Serverless function development and deployment
- Function management and monitoring
- Event trigger configuration

---

## 💬 **AI Agent Conversations**

The application features intelligent AI agents that can use MCP tools to perform real blockchain operations:

### **Example Workflow: Smart Contract Development**

1. **💬 User**: "Help me create a multi-chain DeFi protocol with Move contracts on Aptos and Solidity contracts on Ethereum"

2. **🤖 AI Agent**: Uses multiple MCP tools:
   - **Filesystem**: Creates project structure and manages code files
   - **Smart Contract MCP**: 
     - Aptos CLI tools for Move contract development
     - Sui CLI tools for Move testing and deployment
     - Foundry tools for Solidity contract creation
   - **AWS S3**: Stores contract artifacts and documentation
   - **AWS Lambda**: Deploys backend services for protocol interaction
   - **Web Search**: Researches best practices and security patterns

3. **📊 Result**: Complete multi-chain DeFi protocol with:
   - Move contracts deployed on Aptos and Sui
   - Solidity contracts deployed on Ethereum
   - AWS infrastructure for cross-chain operations
   - Frontend deployed via AWS Amplify
   - Comprehensive testing and documentation

---

## 🎯 **Key Features**

### **Multi-Agent Orchestration**
- **Specialized AI Agents**: Each agent focuses on specific domains
- **Tool Integration**: Real blockchain operations via MCP
- **Context Awareness**: Agents understand project state and history
- **Collaborative Workflow**: Agents work together on complex tasks

### **Blockchain Integration**
- **Multi-Chain Support**: Aptos, Sui, XRPL, Ethereum, Story Protocol
- **Real Operations**: Actual blockchain transactions and deployments
- **Oracle Integration**: Chainlink data feeds and services
- **Gas Optimization**: Smart contract efficiency analysis

### **Cloud Infrastructure**
- **AWS Automation**: Automated cloud deployment and management
- **Scalable Architecture**: Enterprise-grade infrastructure patterns
- **Security Best Practices**: Secure key management and access control
- **Cost Optimization**: Resource usage monitoring and optimization

---

## 🛡️ **Security Considerations**

### **Private Key Management**
- **Local Storage Only**: Private keys never leave your machine
- **Environment Variables**: Secure credential configuration
- **Process Isolation**: MCP servers run in separate processes
- **No Network Transmission**: Sensitive data stays local

### **API Security**
- **Encrypted Storage**: API keys encrypted at rest
- **Secure Communication**: TLS for all external API calls
- **Permission Model**: Granular access control for tools
- **Audit Logging**: Comprehensive operation logging

---

## 📈 **Use Cases**

### **Real Estate Tokenization**
- Property valuation and due diligence
- Regulatory compliance automation
- Smart contract deployment
- Investor portal creation
- Liquidity pool management

### **IP Asset Management**
- Copyright and trademark registration
- Licensing agreement automation
- Royalty distribution systems
- Revenue tracking and analytics
- Marketplace integration

### **Commodity Trading**
- Supply chain verification
- Quality assurance protocols
- Price feed integration
- Settlement automation
- Risk management tools

### **Art and Collectibles**
- Provenance tracking
- Authentication systems
- Fractionalized ownership
- Exhibition management
- Auction platform integration

---

## 🔮 **Roadmap**

### **Current Features** ✅
- MCP server management and integration
- Claude AI with tool calling capabilities
- Multi-blockchain support (Aptos, Sui, XRPL, Story Protocol)
- AWS cloud services integration
- File system operations and project management

### **Near Term** 🔄
- Enhanced security and key management
- Additional blockchain network support
- Advanced analytics and reporting
- Multi-project workspace support
- Team collaboration features

### **Future** 📅
- Visual workflow builder
- Custom agent creation tools
- Marketplace for MCP servers
- Enterprise deployment options
- Advanced compliance automation

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain test coverage for critical paths
- Update documentation for new features
- Follow semantic versioning for releases

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **Support & Community**

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

<div align="center">

**🚀 Building the Future of Web3 RWA Development**

*Powered by Model Context Protocol and Multi-Agent AI*

</div>
