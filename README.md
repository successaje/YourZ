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


Resources - 
Creating a contract - https://nft-docs.zora.co/contracts/Deploy1155Contract
More on creatng - https://nft-docs.zora.co/protocol-sdk/creator/onchain

 Suggestions 
1. Incentivized Curation / Discovery
Allow users to:

Upvote or “highlight” posts (like Mirror’s “collect to curate”).

Create curated feeds or reading lists, where curators earn a small % of downstream sales.

Implement a "Collector Leaderboard": Track early collectors of viral posts and reward them.

2. Post-Level Analytics
Offer:

Views (off-chain metric with fallback to client analytics)

Total mints + resales

Earnings breakdown (primary, secondary, royalties)

Collectors list (wallets + ENS names)

3. Search Engine + Trending Feed
Discoverability is key. Index via tags, ENS authors, categories.

Filter trending by timeframe: 24h / 7d / All time.

Use IPFS CID hashes or metadata tags for structured querying.

4. Support for Series / Chapters
Enable:

Multi-post series with a cover NFT.

Collect full series or individual chapters.

Revenue sharing across chapters.

5. Social Graph Integration
Leverage Lens Protocol, Farcaster Frames, or CyberConnect for social features.

Show “followers who also collected this”.


### Randoms - 
Explorer link here:  https://sepolia.basescan.org/tx/0xf207cadc41aa5f0f16d83e8b068f763da4f030d30e66b13e2afaaf61d497d872
TestNFTSuite.tsx:94 Contract deployed at: 0x1ec58892306C6C742703885feDe69B546302249b Param: {abi: Array(158), functionName: 'createContractDeterministic', account: '0x60eF148485C2a5119fa52CA13c52E9fd98F28e87', address: '0x777777C338d93e2C7adf08D102d45CA7CC4Ed021', args: Array(5)}abi: Array(158)[0 … 99]0: {type: 'constructor', inputs: Array(4), stateMutability: 'nonpayable'}1: {type: 'function', inputs: Array(0), name: 'acceptOwnership', outputs: Array(0), stateMutability: 'nonpayable'}2: {type: 'function', inputs: Array(0), name: 'cancelOwnershipTransfer', outputs: Array(0), stateMutability: 'nonpayable'}3: {type: 'function', inputs: Array(0), name: 'contractName', outputs: Array(1), stateMutability: 'pure'}4: {type: 'function', inputs: Array(0), name: 'contractURI', outputs: Array(1), stateMutability: 'pure'}5: {type: 'function', inputs: Array(0), name: 'contractVersion', outputs: Array(1), stateMutability: 'pure'}6: {type: 'function', inputs: Array(5), name: 'createContract', outputs: Array(1), stateMutability: 'nonpayable'}7: {type: 'function', inputs: Array(5), name: 'createContractDeterministic', outputs: Array(1), stateMutability: 'nonpayable'}8: {type: 'function', inputs: Array(0), name: 'defaultMinters', outputs: Array(1), stateMutability: 'view'}9: {type: 'function', inputs: Array(4), name: 'deterministicContractAddress', outputs: Array(1), stateMutability: 'view'}10: {type: 'function', inputs: Array(5), name: 'deterministicContractAddressWithSetupActions', outputs: Array(1), stateMutability: 'view'}11: {type: 'function', inputs: Array(0), name: 'fixedPriceMinter', outputs: Array(1), stateMutability: 'view'}12: {type: 'function', inputs: Array(6), name: 'getOrCreateContractDeterministic', outputs: Array(1), stateMutability: 'nonpayable'}13: {type: 'function', inputs: Array(0), name: 'implementation', outputs: Array(1), stateMutability: 'view'}14: {type: 'function', inputs: Array(1), name: 'initialize', outputs: Array(0), stateMutability: 'nonpayable'}15: {type: 'function', inputs: Array(0), name: 'merkleMinter', outputs: Array(1), stateMutability: 'view'}16: {type: 'function', inputs: Array(0), name: 'owner', outputs: Array(1), stateMutability: 'view'}17: {type: 'function', inputs: Array(0), name: 'pendingOwner', outputs: Array(1), stateMutability: 'view'}18: {type: 'function', inputs: Array(0), name: 'proxiableUUID', outputs: Array(1), stateMutability: 'view'}19: {type: 'function', inputs: Array(0), name: 'redeemMinterFactory', outputs: Array(1), stateMutability: 'view'}20: {type: 'function', inputs: Array(0), name: 'resignOwnership', outputs: Array(0), stateMutability: 'nonpayable'}21: {type: 'function', inputs: Array(1), name: 'safeTransferOwnership', outputs: Array(0), stateMutability: 'nonpayable'}22: {type: 'function', inputs: Array(1), name: 'transferOwnership', outputs: Array(0), stateMutability: 'nonpayable'}23: {type: 'function', inputs: Array(1), name: 'upgradeTo', outputs: Array(0), stateMutability: 'nonpayable'}24: {type: 'function', inputs: Array(2), name: 'upgradeToAndCall', outputs: Array(0), stateMutability: 'payable'}25: {type: 'function', inputs: Array(0), name: 'zora1155Impl', outputs: Array(1), stateMutability: 'view'}26: {type: 'event', anonymous: false, inputs: Array(2), name: 'AdminChanged'}27: {type: 'event', anonymous: false, inputs: Array(1), name: 'BeaconUpgraded'}28: {type: 'event', anonymous: false, inputs: Array(1), name: 'ContractAlreadyExistsSkippingDeploy'}29: {type: 'event', anonymous: false, inputs: Array(0), name: 'FactorySetup'}30: {type: 'event', anonymous: false, inputs: Array(1), name: 'Initialized'}31: {type: 'event', anonymous: false, inputs: Array(2), name: 'OwnerCanceled'}32: {type: 'event', anonymous: false, inputs: Array(2), name: 'OwnerPending'}33: {type: 'event', anonymous: false, inputs: Array(2), name: 'OwnerUpdated'}34: {type: 'event', anonymous: false, inputs: Array(6), name: 'SetupNewContract'}35: {type: 'event', anonymous: false, inputs: Array(1), name: 'Upgraded'}36: {type: 'error', inputs: Array(0), name: 'ADDRESS_DELEGATECALL_TO_NON_CONTRACT'}37: {type: 'error', inputs: Array(0), name: 'ADDRESS_LOW_LEVEL_CALL_FAILED'}38: {type: 'error', inputs: Array(0), name: 'Constructor_ImplCannotBeZero'}39: {type: 'error', inputs: Array(0), name: 'ERC1967_NEW_IMPL_NOT_CONTRACT'}40: {type: 'error', inputs: Array(0), name: 'ERC1967_NEW_IMPL_NOT_UUPS'}41: {type: 'error', inputs: Array(0), name: 'ERC1967_UNSUPPORTED_PROXIABLEUUID'}42: {type: 'error', inputs: Array(2), name: 'ExpectedContractAddressDoesNotMatchCalculatedContractAddress'}43: {type: 'error', inputs: Array(0), name: 'FUNCTION_MUST_BE_CALLED_THROUGH_ACTIVE_PROXY'}44: {type: 'error', inputs: Array(0), name: 'FUNCTION_MUST_BE_CALLED_THROUGH_DELEGATECALL'}45: {type: 'error', inputs: Array(0), name: 'INITIALIZABLE_CONTRACT_ALREADY_INITIALIZED'}46: {type: 'error', inputs: Array(0), name: 'INITIALIZABLE_CONTRACT_IS_NOT_INITIALIZING'}47: {type: 'error', inputs: Array(0), name: 'ONLY_OWNER'}48: {type: 'error', inputs: Array(0), name: 'ONLY_PENDING_OWNER'}49: {type: 'error', inputs: Array(0), name: 'OWNER_CANNOT_BE_ZERO_ADDRESS'}50: {type: 'error', inputs: Array(0), name: 'UUPS_UPGRADEABLE_MUST_NOT_BE_CALLED_THROUGH_DELEGATECALL'}51: {type: 'error', inputs: Array(2), name: 'UpgradeToMismatchedContractName'}52: {type: 'error', inputs: Array(0), name: 'ADDRESS_DELEGATECALL_TO_NON_CONTRACT'}53: {type: 'error', inputs: Array(0), name: 'ADDRESS_LOW_LEVEL_CALL_FAILED'}54: {type: 'error', inputs: Array(2), name: 'Burn_NotOwnerOrApproved'}55: {type: 'error', inputs: Array(0), name: 'CREATOR_FUNDS_RECIPIENT_NOT_SET'}56: {type: 'error', inputs: Array(1), name: 'CallFailed'}57: {type: 'error', inputs: Array(0), name: 'Call_TokenIdMismatch'}58: {type: 'error', inputs: Array(0), name: 'CallerNotZoraCreator1155'}59: {type: 'error', inputs: Array(0), name: 'CanOnlyReduceMaxSupply'}60: {type: 'error', inputs: Array(4), name: 'CannotMintMoreTokens'}61: {type: 'error', inputs: Array(0), name: 'CannotReduceMaxSupplyBelowMinted'}62: {type: 'error', inputs: Array(1), name: 'Config_TransferHookNotSupported'}63: {type: 'error', inputs: Array(0), name: 'ERC1155_ACCOUNTS_AND_IDS_LENGTH_MISMATCH'}64: {type: 'error', inputs: Array(0), name: 'ERC1155_ADDRESS_ZERO_IS_NOT_A_VALID_OWNER'}65: {type: 'error', inputs: Array(0), name: 'ERC1155_BURN_AMOUNT_EXCEEDS_BALANCE'}66: {type: 'error', inputs: Array(0), name: 'ERC1155_BURN_FROM_ZERO_ADDRESS'}67: {type: 'error', inputs: Array(0), name: 'ERC1155_CALLER_IS_NOT_TOKEN_OWNER_OR_APPROVED'}68: {type: 'error', inputs: Array(0), name: 'ERC1155_ERC1155RECEIVER_REJECTED_TOKENS'}69: {type: 'error', inputs: Array(0), name: 'ERC1155_IDS_AND_AMOUNTS_LENGTH_MISMATCH'}70: {type: 'error', inputs: Array(0), name: 'ERC1155_INSUFFICIENT_BALANCE_FOR_TRANSFER'}71: {type: 'error', inputs: Array(0), name: 'ERC1155_MINT_TO_ZERO_ADDRESS'}72: {type: 'error', inputs: Array(0), name: 'ERC1155_MINT_TO_ZERO_ADDRESS'}73: {type: 'error', inputs: Array(0), name: 'ERC1155_SETTING_APPROVAL_FOR_SELF'}74: {type: 'error', inputs: Array(0), name: 'ERC1155_TRANSFER_TO_NON_ERC1155RECEIVER_IMPLEMENTER'}75: {type: 'error', inputs: Array(0), name: 'ERC1155_TRANSFER_TO_ZERO_ADDRESS'}76: {type: 'error', inputs: Array(0), name: 'ERC1967_NEW_IMPL_NOT_CONTRACT'}77: {type: 'error', inputs: Array(0), name: 'ERC1967_NEW_IMPL_NOT_UUPS'}78: {type: 'error', inputs: Array(0), name: 'ERC1967_UNSUPPORTED_PROXIABLEUUID'}79: {type: 'error', inputs: Array(2), name: 'ETHWithdrawFailed'}80: {type: 'error', inputs: Array(0), name: 'FUNCTION_MUST_BE_CALLED_THROUGH_ACTIVE_PROXY'}81: {type: 'error', inputs: Array(0), name: 'FUNCTION_MUST_BE_CALLED_THROUGH_DELEGATECALL'}82: {type: 'error', inputs: Array(0), name: 'FirstMinterAddressZero'}83: {type: 'error', inputs: Array(2), name: 'FundsWithdrawInsolvent'}84: {type: 'error', inputs: Array(0), name: 'INITIALIZABLE_CONTRACT_ALREADY_INITIALIZED'}85: {type: 'error', inputs: Array(0), name: 'INITIALIZABLE_CONTRACT_IS_NOT_INITIALIZING'}86: {type: 'error', inputs: Array(0), name: 'INVALID_ADDRESS_ZERO'}87: {type: 'error', inputs: Array(0), name: 'INVALID_ETH_AMOUNT'}88: {type: 'error', inputs: Array(3), name: 'InvalidMerkleProof'}89: {type: 'error', inputs: Array(0), name: 'InvalidMintSchedule'}90: {type: 'error', inputs: Array(0), name: 'InvalidMintSchedule'}91: {type: 'error', inputs: Array(0), name: 'InvalidPremintVersion'}92: {type: 'error', inputs: Array(0), name: 'InvalidSignature'}93: {type: 'error', inputs: Array(0), name: 'InvalidSignatureVersion'}94: {type: 'error', inputs: Array(1), name: 'InvalidSigner'}95: {type: 'error', inputs: Array(0), name: 'MintNotYetStarted'}96: {type: 'error', inputs: Array(0), name: 'Mint_InsolventSaleTransfer'}97: {type: 'error', inputs: Array(0), name: 'Mint_InvalidMintArrayLength'}98: {type: 'error', inputs: Array(0), name: 'Mint_TokenIDMintNotAllowed'}99: {type: 'error', inputs: Array(0), name: 'Mint_UnknownCommand'}[100 … 157]length: 158[[Prototype]]: Array(0)account: "0x60eF148485C2a5119fa52CA13c52E9fd98F28e87"address: "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021"args: (5) ['QmTHPJsycYKM3vfge42cxaQDbffFUfbQGyzapfJyaEnpk2', 'YourZ Test Collection 266', {…}, '0x60eF148485C2a5119fa52CA13c52E9fd98F28e87', Array(5)]functionName: "createContractDeterministic"[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()