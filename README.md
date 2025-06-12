# YourZ - NFT Blogging Platform

A Medium-style blogging platform where every post is minted as an NFT, built on Zora Protocol.

## Features

- Write and publish blog posts as NFTs
- Collect posts and earn royalties
- Co-author posts with revenue splits
- Token-gated features for NFT holders
- Modern, responsive UI

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