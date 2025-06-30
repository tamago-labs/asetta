# Asetta.xyz

> **Multi-Agent Orchestration for Web3 Real World Assets using AWS and Chainlink**

![Tauri](https://img.shields.io/badge/Tauri-2+-24C8DB?logo=tauri)
![MCP](https://img.shields.io/badge/MCP-Protocol-purple)

Asetta is a platform where AI agents specialize and respond in various fields and each connected to different MCP servers. By compatible with MCP (Model Context Protocol), RWA creators can setup agents that leverage the extensive MCP server library, now have more 10,000+ MCPs in the market to perform tasks and acquire knowledge of any kind.

![asetta-2 drawio](https://github.com/user-attachments/assets/65bb4221-83b9-4b99-b422-8eaf65999c96)

By using Asetta for RWA tokenization, creators can share documents related to their properties, treasury bonds or other assets securely to the private AI models. AI agents will analyze the documents, generate legal and regulatory checklists and upload the necessary information to the Asetta platform. Creators can also chat with the AWS Expert Agent to help create a separate dApp or dashboard if needed. 

Once ready, the Tokenization Agent can onboard and issue RWA tokens on multiple blockchains simultaneously, setup Chainlink CCIP pools and making the RWA project ready for user onboarding and KYC across multiple blockchains in just minutes.

## Components

The platform comprises several components that enable multiple AI agents to work collaboratively toward RWA tokenization across multiple blockchains, as follows:

- **Asetta RWA Studio:** (https://github.com/tamago-labs/asetta) A desktop application built with Rust + JavaScript aim to provide AI agents natively work with multiple MCP servers from official AWS MCP servers to our custom servers. This allows AI agents to access folders containing RWA documents, create legal checklists, and vice versa.
- **Asetta Dashboard + Backend:** (https://github.com/tamago-labs/asetta-aws-amplify) Built with AWS Amplify, it provides authentication for generating access keys and setting up user and creator profiles. These profiles can be used on both the desktop app and client-side interface that displaying all RWA projects in the system.
- **Asetta Smart Contracts:** (https://github.com/tamago-labs/asetta-ccip) Forked from Chainlink CCIP Kit. A set of smart contracts for RWA tokenization and trading deployed on all supported chains and allows AI agents handle token issuance, primary distribution setup, and pricing. AI maps everything from your documents to reducing errors and improving control.
- **Asetta MCP:** (https://github.com/tamago-labs/asetta-mcp) An MCP server implementation that enables AI agents to perform tasks using 40+ MCP tools. It connects AI agents to Asetta APIs and smart contracts, facilitating wallet operations and Chainlink CCIP configuration and functionality.

## Getting Started

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- Rust and Cargo ([Install Guide](https://rustup.rs/))
- Asetta Access Key ([Get Here](https://www.asetta.xyz/))

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
 
## Chainlink Integration

We integrate with Chainlink CCIP and have our agent handles the complex process of cross-chain token creation as follows:

- Creates RWA tokens compatible with Chainlink CCIP standards
- Sets up a MintBurnPool for each deployed RWA token and grants roles
- Connect BurnMint pools across chains and validate the entire CCIP setup
- Cross-chain token transfers using Chainlink CCIP from chat

Links:
- https://github.com/tamago-labs/asetta-ccip/blob/main/src/RWAToken.sol
- https://github.com/tamago-labs/asetta-ccip/blob/main/test/RWAToken.t.sol
- https://github.com/tamago-labs/asetta-mcp/blob/main/src/mcp/wallet/configure_ccip_tool.ts

## AWS Integration

The main website and backend use the AWS Amplify serverless stack with Next.js
- Bedrock to provide AI-services to the agent with Claude Sonnet 3.5 (frontend) and Claude Sonnet 4.0 (desktop app)
- Bedrock Knowledge Base syncs with S3 to answer project-specific questions
- Cognito used for secure user authentication across all apps
- Amplify database stores RWA project data and user profiles

Links:
- https://github.com/tamago-labs/asetta-aws-amplify/blob/main/amplify/data/resource.ts

## Deployments

Ethereum Sepolia
================================================

MockUSDC: 0xf2260B00250c772CB64606dBb88d9544F709308C
TokenFactory: 0x6fdB032668F1F856fbC2e9F5Df348938aFBFBE17
TestToken: 0x70aB9E637130220DD7AB16E59b83d133b77f2001
PrimaryDistribution: 0xf309011fbf013C352849Cd4b5C85E71cC69a1EBF
RWAManager: 0x9682DaBf26831523B21759A50b0a45832f82DBa3
RFQ: 0x42209A0A2a3D80Ad48B7D25fC6a61ad355901484


Avalanche Fuji
================================================

MockUSDC: 0x5067e9a9154A2EA674DEf639de5e98F238824039
TokenFactory: 0xEc5003E8451EC488ea1e1a7142A38e77a5082fCf
TestToken: 0x3bde0F6703F62801Ae6eef7A597d4e88e508551D
PrimaryDistribution: 0x9304F30b1AEfeCB43F86fd5841C6ea75BD0F2529
RWAManager: 0x6ee904a0Ff97b5682E80660Bf2Aca280D18aB5F3
RFQ: 0x307992307C89216b1079C7c5Cbc4F51005b1472D

Arbitrum Sepolia
================================================

MockUSDC: 0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0
TokenFactory: 0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0
TestToken: 0x59Dc953ED6Ffe40d4ce31c97b0eA0ECdc3061862
PrimaryDistribution: 0xA657b300009802Be7c88617128545534aCA12dbe
RWAManager: 0x4fd5Ae48A869c5ec0214CB050D2D713433515D8d
RFQ: 0x61ad3Fe6B44Bfbbcec39c9FaD566538c894b6471

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
  
