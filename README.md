YourZ 🌟
Tokenize Your Words, Own Your Influence
YourZ is a next-generation blogging platform built on Zora Protocol, where every post becomes a collectible NFT. Writers monetize their content directly, and readers invest in ideas by owning tokenized posts—earning royalties when others discover and collect them.

✨ Key Features
1. Tokenized Blog Posts
Every article is minted as an ERC-721 NFT (Zora Protocol).

Set your own mint price & royalties (e.g., 10% on resales).

Posts are stored permanently on IPFS (decentralized storage).

2. Invest in Content You Love
Readers collect posts like digital assets.

Earn passive income from secondary sales (royalty shares).

Trade valuable posts like NFT trading cards.

3. Collaborative Writing
Co-author posts with revenue splits (Zora’s SplitMain).

Multi-signature publishing for teams.

4. Web3-Native Experience
No emails/passwords—sign in with your Ethereum wallet (MetaMask, Rainbow, etc.).

ENS integration (yourname.eth as your identity).

Token-gated discussions (only NFT holders can comment).

5. Creator & Supporter Dashboard
Track earnings from primary sales & royalties.

See which posts are trending.

Manage collaborations & splits.

🚀 How It Works
For Writers
Write – Compose in a clean, Medium-style editor.

Mint – Turn your post into an NFT (set price & royalties).

Earn – Get paid when readers collect or resell your work.

For Readers
Discover – Browse tokenized posts.

Collect – Buy posts you believe in.

Profit – Earn royalties if the post gains value.

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Zora Protocol
- RainbowKit + wagmi
- IPFS for content storage

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yourz.git
cd yourz
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── styles/          # Global styles and Tailwind config
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

"Don’t just read – own the posts you love and earn when others discover them. Be more than a fan: be a stakeholder."

1. Creators Monetize Directly
Problem: Platforms like Medium/Substack take cuts (10-50%) and lock creators into centralized systems.

YourZ Solution:

Every post is an ownable NFT (via Zora Protocol).

Creators set their own mint price (e.g., 0.01 ETH per copy) and royalties (e.g., 10% on resales).

No middlemen—earnings go straight to the creator’s wallet.

2. Supporters Become Investors
Problem: Readers’ attention fuels platforms but earns them nothing.

YourZ Solution:

Supporters buy tokenized posts (like early-stage investors).

Earn royalties when others collect the same post later.

Trade posts in a secondary market (e.g., rare viral articles gain value).

3. Explicit Value Exchange
Problem: Traditional platforms hide value flows behind ads/subscriptions.

YourZ Solution:

Transparent blockchain ledger shows exactly who earns what.

Smart contracts enforce automatic payouts (no manual invoicing).

4. Real Ownership
Problem: Platforms can delete content or ban creators.

YourZ Solution:

Posts live on IPFS (decentralized storage).

NFT ownership proves authenticity and provenance.

🎯 Key Innovations vs. Traditional Platforms
Feature	Traditional Platforms (Medium, Substack)	YourZ
Revenue Model	Ads/subscriptions (platform takes cut)	NFT sales + royalties (creator keeps 90%+)
Supporter Role	Passive consumer	Active investor/collector
Ownership	Platform owns distribution rights	Creators/supporters own NFTs
Censorship	Platform can remove content	Immutable (once minted)
💡 Example Scenario
Creator writes a post → Mints 100 copies at 0.01 ETH each.

Early Supporter buys 1 copy (cost: 0.01 ETH).

Post goes viral → Secondary market resells copies for 0.1 ETH each.

Creator earns: 10% royalty on every resale (0.01 ETH).

Supporter earns: If they resell, profit = sale price - mint price.

"YourZ flips the script—readers aren’t just consumers, they’re stakeholders. Every interaction creates measurable value, captured on-chain."