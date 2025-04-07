# Flappy Bird on Starknet (FOS)

A retro-style Flappy Bird game built on the Starknet blockchain, featuring on-chain leaderboards and score tracking.

## Features

- Classic Flappy Bird gameplay with retro aesthetics
- On-chain score tracking using Starknet
- Leaderboard system to track high scores

## Tech Stack

- React.js for the frontend
- Starknet for blockchain integration
- Cairo for smart contracts
- Retro-styled CSS with pixel-perfect design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Starknet wallet (e.g., Argent X)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fos.git
cd fos
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
MAINNET_RPC_URL=your_mainnet_rpc_url
NEXT_PUBLIC_CHAIN_ID=SN_SEPOLIA
```

4. Start the development server:
```bash
npm start
```

## Game Controls

- Click or press Space to make the bird jump
- Avoid the pipes
- Try to achieve the highest score possible

## Smart Contract

The game uses a Starknet smart contract for:
- Score tracking
- Leaderboard management
- Game state management

Contract address: `0x03730b941e8d3ece030a4a0d5f1008f34fbde0976e86577a78648c8b35079464`

## Attribution

This project is a clone of Floppy Bird on Starknet.
Code inspired from [https://github.com/nebez/floppybird/](https://github.com/nebez/floppybird/)

Original game/concept/art by Dong Nguyen

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
