# YourZ 🌟

**Tokenize Your Words, Own Your Influence**

YourZ is a revolutionary Web3 blogging platform that transforms content creation and consumption through blockchain technology. Built on Zora Protocol, YourZ enables creators to tokenize individual blog posts as ERC-20 tokens (Zora Coins), creating a new paradigm where readers become investors and content becomes tradeable assets.

## 🎯 Vision

YourZ flips the traditional content economy on its head. Instead of platforms taking cuts from creators and readers being passive consumers, YourZ creates a community-driven ecosystem where:

- **Creators** monetize directly through token sales and royalties
- **Readers** become stakeholders by investing in content they believe in
- **Content** becomes a tradeable asset with real market value
- **Communities** form around shared interests and financial incentives

## ✨ Key Features

### 🪙 Post Coins (ERC-20 Tokens)
- **Individual Post Tokenization**: Every blog post can have its own ERC-20 token
- **Creator Control**: Set mint prices, total supply, and royalty percentages
- **Community Investment**: Readers buy tokens to support and profit from content
- **Trading Platform**: Built-in marketplace for buying/selling post tokens

### 📝 Web3-Native Blogging
- **Decentralized Storage**: Content stored on IPFS for permanence
- **Wallet Authentication**: No emails/passwords - sign in with your wallet
- **ENS Integration**: Use your ENS name as your identity
- **Token-Gated Features**: Exclusive content for token holders

### 💰 Monetization & Rewards
- **Direct Creator Earnings**: No platform fees, creators keep 90%+ of revenue
- **Royalty Sharing**: Automatic payouts on secondary sales
- **Investor Returns**: Early supporters earn when content gains value
- **Transparent Economics**: All transactions visible on blockchain

### 🤝 Community Features
- **Collaborative Writing**: Co-author posts with revenue splits
- **Curation Rewards**: Earn by discovering and promoting quality content
- **Social Trading**: Follow successful investors and creators
- **Governance**: Token holders can influence platform decisions

## 🚀 How It Works

### For Content Creators
1. **Write**: Compose in our clean, Medium-style editor
2. **Mint**: Create an ERC-20 token for your post with custom parameters
3. **Earn**: Receive payments directly to your wallet when readers buy tokens
4. **Grow**: Build a community of token holders who are invested in your success

### For Content Investors
1. **Discover**: Browse tokenized posts across various categories
2. **Research**: Analyze creator history, token metrics, and community sentiment
3. **Invest**: Buy tokens for posts you believe will gain value
4. **Profit**: Earn royalties when others discover and invest in the same content

### Example Scenario
```
Creator writes "The Future of Web3" → Mints 1000 tokens at 0.01 ETH each
Early Investor buys 10 tokens (cost: 0.1 ETH)
Post goes viral → Secondary market resells tokens for 0.05 ETH each
Creator earns: 10% royalty on every resale
Investor earns: 0.4 ETH profit (10 × 0.05 - 0.1)
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Web3 & Blockchain
- **Zora Protocol** - NFT and token infrastructure
- **Zora Coins SDK** - ERC-20 token creation and management
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - TypeScript interface for Ethereum

### Backend & Storage
- **Supabase** - Database and authentication
- **IPFS** - Decentralized content storage
- **NFT.Storage** - IPFS pinning service

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **React Query** - Server state management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Ethereum wallet (MetaMask, Rainbow, etc.)
- Supabase account
- IPFS/NFT.Storage account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yourz.git
   cd yourz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   # Wallet Connect
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   
   # Blockchain APIs
   NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   
   # Zora Protocol
   NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # IPFS
   NEXT_PUBLIC_NFT_STORAGE_API_KEY=your_nft_storage_api_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main application routes
│   ├── api/               # API routes
│   ├── coins/             # Post coins marketplace
│   ├── dashboard/         # User dashboard
│   ├── explore/           # Content discovery
│   ├── marketplace/       # NFT marketplace
│   ├── post/              # Individual post pages
│   ├── profile/           # User profiles
│   ├── trade/             # Trading interface
│   └── write/             # Content creation
├── components/            # React components
│   ├── marketplace/       # Marketplace-specific components
│   ├── post/              # Post-related components
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API and external services
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## 🔧 Configuration

### Supported Networks
- **Ethereum Mainnet** - Production environment
- **Polygon** - Lower gas fees for testing
- **Base** - Coinbase's L2 solution
- **Optimism** - High-speed L2

### Environment Variables
See the [Environment Setup](#environment-setup) section for required variables.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Areas
- **Frontend Components** - React components and UI improvements
- **Smart Contracts** - Zora Protocol integrations
- **Backend APIs** - Supabase functions and database optimizations
- **Documentation** - README, guides, and technical docs
- **Testing** - Unit tests, integration tests, and E2E tests

### Code Style
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

<!-- ### Documentation
- [Feature Documentation](./docs/features/)
- [API Reference](./docs/api/)
- [Deployment Guide](./docs/deployment/) -->

### Community
- [Discord]() - Join our community
- [X]() - Follow for updates
- [Blog](https://yourz.vercel.app) - Technical articles and tutorials

### Issues
- [GitHub Issues](https://github.com/successaje/yourz/issues) - Bug reports and feature requests
- [Discussions](https://github.com/successaje/yourz/discussions) - General questions and ideas

## 🎉 Acknowledgments

- **Zora Protocol** - For the amazing Coin and NFT infrastructure
- **Supabase** - For the powerful backend-as-a-service
- **RainbowKit** - For the beautiful wallet connection experience
- **IPFS** - For decentralized content storage
- **Our Community** - For feedback, testing, and contributions

---

**Ready to tokenize your words and own your influence?** [Start creating on YourZ](https://yourz.vercel.app) 🚀

*"Don't just read – own the posts you love and earn when others discover them. Be more than a fan: be a stakeholder."*