# 🔐 Cipher Bid Vault

**Fully Encrypted Auction System on FHEVM**

Cipher Bid Vault is a cutting-edge decentralized auction platform that leverages Fully Homomorphic Encryption (FHE) to ensure complete privacy and fairness in the bidding process. Built on FHEVM, this system allows users to place encrypted bids that remain completely private until the auction ends, ensuring no bid manipulation or front-running.

## 🎥 Demo

- **Online Demo**: https://cipher-bid-vault.vercel.app/
- **Video Walkthrough**: `demo.mp4` (located at the project root). Open it locally to see a full end‑to‑end flow of connecting a wallet, creating an auction, placing encrypted bids, and revealing the winner.

## ✨ Key Features

- **🔒 Fully Encrypted Bids**: All bids are encrypted using FHE and remain private until auction completion
- **⚡ Real-time Auction Management**: Create, manage, and participate in auctions with live updates
- **🎨 Modern UI/UX**: Beautiful dark-themed interface built with Next.js, Tailwind CSS, and DaisyUI
- **🔗 Multi-Wallet Support**: Integrated with RainbowKit and wagmi for seamless wallet connections
- **🌐 Network Flexibility**: Supports both local Hardhat development and Sepolia testnet
- **📱 Responsive Design**: Optimized for desktop and mobile experiences
- **🛡️ Transparent Results**: Verifiable on-chain auction outcomes with encrypted bid revelation

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **pnpm**: Recommended package manager
- **MetaMask**: Browser extension for wallet connectivity

### Installation & Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/Ford00520/cipher-bid-vault.git
   cd cipher-bid-vault
   pnpm install
   ```

2. **Set up environment variables**

   ```bash
   # Copy environment template
   cp ".env copy" .env
   
   # Configure Hardhat variables
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY  # Optional
   ```

3. **Start local development**

   ```bash
   # Terminal 1: Start Hardhat node
   pnpm run node
   
   # Terminal 2: Start frontend
   cd frontend
   pnpm install
   pnpm run dev
   ```

4. **Configure MetaMask**
   - Network Name: Hardhat
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

### Production Deployment

```bash
# Deploy to Sepolia testnet
pnpm run deploy:sepolia

# Build frontend for production
cd frontend
pnpm run build
```

## 📁 Project Structure

```
cipher-bid-vault/
├── contracts/                    # Smart contract source files
│   ├── CipherBidVault.sol       # Main encrypted auction contract
│   └── FHECounter.sol           # Example FHE counter contract
├── frontend/                    # Next.js React application
│   ├── app/                     # Next.js app router pages
│   ├── components/              # React UI components
│   │   ├── Hero.tsx            # Landing page hero section
│   │   ├── AuctionBoard.tsx    # Main auction dashboard
│   │   ├── AuctionCard.tsx     # Individual auction display
│   │   └── CreateAuctionDialog.tsx # Auction creation modal
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCipherBidVault.tsx # Main contract interaction hook
│   │   ├── useFHECounter.tsx    # FHE counter hook
│   │   └── metamask/            # MetaMask wallet integration
│   ├── fhevm/                   # FHEVM integration layer
│   ├── abi/                     # Contract ABIs and addresses
│   └── public/                  # Static assets and WASM files
├── deploy/                      # Hardhat deployment scripts
├── tasks/                       # Custom Hardhat tasks
├── test/                        # Contract test suites
├── hardhat.config.ts           # Hardhat configuration
└── package.json                # Root dependencies and scripts
```

## 🎯 Core Components

### Smart Contracts

- **CipherBidVault.sol**: Main auction contract with FHE-encrypted bidding
- **FHECounter.sol**: Example contract demonstrating FHE operations

### Frontend Components

- **Hero**: Landing page with project branding and wallet connection
- **AuctionBoard**: Main dashboard displaying all active auctions
- **AuctionCard**: Individual auction interface with bidding functionality
- **CreateAuctionDialog**: Modal for creating new auctions

### Key Hooks

- **useCipherBidVault**: Primary hook for auction contract interactions
- **useFhevm**: FHEVM instance management and encryption
- **useMetaMaskEthersSigner**: Wallet connection and transaction signing

## 📜 Available Scripts

### Root Project

| Script                | Description                    |
| --------------------- | ------------------------------ |
| `pnpm run compile`    | Compile all smart contracts    |
| `pnpm run test`       | Run contract test suites       |
| `pnpm run node`       | Start local Hardhat node      |
| `pnpm run deploy`     | Deploy to local network        |
| `pnpm run clean`      | Clean build artifacts          |

### Frontend

| Script                | Description                    |
| --------------------- | ------------------------------ |
| `pnpm run dev`        | Start development server       |
| `pnpm run build`      | Build for production           |
| `pnpm run lint`       | Run ESLint checks              |
| `pnpm run dev:mock`   | Start with mock FHEVM          |

## 🔧 Technical Stack

### Blockchain & Smart Contracts
- **FHEVM**: Fully Homomorphic Encryption for Ethereum
- **Solidity**: Smart contract development language
- **Hardhat**: Development environment and testing framework
- **ethers.js**: Ethereum library for blockchain interactions

### Frontend Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: Modern UI library with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind
- **RainbowKit**: Wallet connection interface
- **wagmi**: React hooks for Ethereum

### Development Tools
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting and formatting
- **Vitest**: Unit testing framework
- **Turbopack**: Fast bundler for development

## 🛠️ How It Works

1. **Auction Creation**: Users create auctions with title, description, starting bid, and duration
2. **Encrypted Bidding**: Participants submit bids that are encrypted using FHE before being stored on-chain
3. **Privacy Preservation**: All bids remain completely private and cannot be viewed by anyone during the auction
4. **Automatic Resolution**: When the auction ends, the highest bid is determined through FHE computation
5. **Transparent Results**: Winners are announced with verifiable on-chain proof while maintaining bid privacy

## 📚 Documentation & Resources

### FHEVM Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/)

### Frontend Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://rainbowkit.com/docs/introduction)
- [wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/Ford00520/cipher-bid-vault/issues)
- **FHEVM Documentation**: [Official Zama Docs](https://docs.zama.ai)
- **Community Discord**: [Join Zama Community](https://discord.gg/zama)
- **Twitter**: Follow [@zama_fhe](https://twitter.com/zama_fhe) for updates

---

**🔐 Built with privacy-first principles using Fully Homomorphic Encryption**

*Cipher Bid Vault - Where every bid counts, but privacy comes first.*
