# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Poker Home Game Software

## Overview

This project is online poker software designed specifically for local home games. It eliminates the need for physical chips by managing all poker mechanics digitally across multiple devices.

## Architecture

The application uses a multi-device setup:

- **Player phones** – Each player views their private hole cards and chip count on their own device
- **Central tablet** – Displays community cards, pot total, current bet, and game state for all to see
- **Host device** – One player hosts the game session; all others connect to join

## Core Functionality

The software handles complete Texas Hold'em game flow:

- Dealing hole cards privately to each player's device
- Managing betting rounds (pre-flop, flop, turn, river)
- Tracking chip counts and enforcing bet validation
- Calculating pots including side pots for all-in scenarios
- Determining winners at showdown
- Rotating dealer/blinds between hands

## Technical Direction

### Game State Management

Host device maintains authoritative game state using poker-ts library in React Native. All game logic and validation runs on the host device.

### Network Architecture

**Star topology** using WebRTC for peer-to-peer connections:

- Each player device connects directly to host only
- Players do NOT connect to each other
- Host maintains N separate peer connections (one per player)

**Communication pattern:**

- Players send actions/inputs to host via WebRTC data channels
- Host processes actions and updates game state
- Host broadcasts updated state to all connected players

**Signaling:** AWS API Gateway WebSocket API for initial connection setup (offer/answer/ICE candidate exchange)

**ICE servers:** STUN servers for NAT traversal (sufficient for home networks)

See [docs/webrtc-architecture.md](docs/webrtc-architecture.md) for complete architecture specification.

## Key Constraints

- Must handle side pots correctly – this is non-negotiable for real poker
- Real-time synchronization across all devices
- Private information (hole cards) must only go to the correct player
- Simple join flow for non-technical players at home games

## Technical Implementation Details

### Project Structure

```
/table-poker                    # React Native Expo app
├── app/                        # Expo Router file-based routing
│   ├── host.tsx               # Host lobby screen
│   ├── host-in-game.tsx       # Host gameplay screen
│   ├── join.tsx               # Player join screen
│   └── player-in-game.tsx     # Player gameplay screen
├── hooks/                      # Custom React hooks
│   ├── use-webrtc-host.ts     # WebRTC host connection management
│   ├── use-webrtc-player.ts   # WebRTC player connection management
│   ├── use-host-gameplay.ts   # Host game logic coordination
│   ├── use-player-gameplay.ts # Player game logic coordination
│   └── use-signaling-connection.ts # WebSocket signaling
├── store/                      # Jotai state management
│   └── poker-game.ts          # Single atom with Table instance
├── utils/                      # Utility functions
│   ├── game-state.ts          # extractPlayerGameState() for player-specific views
│   ├── game-control.ts        # createGameControl() factory for mutations
│   └── logger.ts              # Logging with react-native-logs
├── types/                      # TypeScript definitions
│   ├── game-state.ts          # Game state types
│   └── signaling.ts           # Signaling message types
└── constants/                  # App constants
    ├── signaling.ts           # WebSocket URLs
    ├── routes.ts              # Screen route constants
    └── theme.ts               # Theme configuration

/infrastructure/signaling-server # AWS infrastructure (OpenTofu)
/lambda                         # Python Lambda for signaling
/docs                           # Architecture documentation
```

### Essential Commands

**Development:**

```bash
npm start                    # Start Expo dev server
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS simulator/device
npm run lint                # Run ESLint
```

**Build & Deploy:**

```bash
npm run draft                    # Publish preview update (EAS workflow)
npm run development-builds       # Create development builds (EAS workflow)
npm run deploy                   # Deploy to production (EAS workflow)
```

**Infrastructure (in /infrastructure/signaling-server):**

```bash
tofu init                   # Initialize OpenTofu/Terraform
tofu plan                   # Plan infrastructure changes
tofu apply                  # Deploy AWS resources
```

### Key Libraries & Dependencies

**Core Stack:**

- `expo@~54.0.10` - Expo SDK framework
- `expo-router@~6.0.8` - File-based routing
- `react@19.1.0` - React 19 with compiler enabled
- `react-native@0.81.4` - React Native runtime
- `typescript@~5.9.2` - Strict TypeScript

**Game Logic:**

- `poker-ts@^1.5.0` - Texas Hold'em game engine
  - Handles all poker rules, betting, pot calculation
  - CRITICAL: `table.isBettingRoundInProgress()` throws if no hand in progress
  - Always check `table.isHandInProgress()` first

**Networking:**

- `react-native-webrtc@^124.0.7` - WebRTC implementation
- `@config-plugins/react-native-webrtc@^13.0.0` - Expo config plugin
- AWS WebSocket API for signaling (wss://6jxm902dzc.execute-api.us-west-2.amazonaws.com/prod)

**State Management:**

- `jotai@^2.16.1` - Atomic state management
- Single atom pattern in `/store/poker-game.ts`
- Version-based change tracking triggers re-renders

**Node.js Polyfills (required for poker-ts):**

- `react-native-quick-crypto@^1.0.6` - Crypto polyfill
- `@craftzdog/react-native-buffer@^6.1.1` - Buffer polyfill
- `process@^0.11.10` - Process polyfill
- `assert@^2.1.0` - Assert polyfill
- Custom Metro config redirects `crypto` → `react-native-quick-crypto`

### Architectural Patterns

**Custom Hook Pattern:**

- Separation of concerns: networking vs game logic vs UI
- `use-webrtc-host.ts` - Manages WebRTC peer connections, exposes `sendToPlayer()` and `broadcastToPlayers()`
- `use-host-gameplay.ts` - Coordinates game logic, processes player actions, broadcasts state
- `use-signaling-connection.ts` - WebSocket management for signaling only

**State Management Pattern:**

- Single Jotai atom holds poker-ts `Table` instance
- `version` field incremented on every mutation
- Version changes trigger React re-renders and state broadcasts
- Host is authoritative; players receive updates only

**Game Control Factory Pattern:**

- `createGameControl(pokerGame, setPokerGame)` returns action functions
- Each action mutates table and increments version
- Example: `gameControl.startHand()`, `gameControl.performAction(action, betSize)`

**State Extraction Pattern:**

- `extractPlayerGameState(table, seatIndex)` creates player-specific views
- Filters out other players' hole cards
- Host sends each player only their permitted data

### WebRTC Connection Flow

1. Host creates game → Connects to WebSocket (`playerId=HOST&gameId={code}`)
2. Player joins → Connects to WebSocket (`playerId={id}&gameId={code}`)
3. Signaling server routes join message → Host receives notification
4. Host creates RTCPeerConnection → Generates SDP offer via WebRTC
5. Player receives offer → Creates RTCPeerConnection, generates SDP answer
6. ICE candidates exchanged → NAT traversal via STUN
7. Data channel opens → Direct peer-to-peer connection established
8. WebSocket disconnects → All game data via WebRTC data channels

### Game State Synchronization

**Host Side (`use-host-gameplay.ts`):**

- Maintains poker-ts `Table` instance in Jotai atom
- Processes player actions from WebRTC data channel
- Auto-advances betting rounds when complete (checks `isBettingRoundInProgress()`)
- Extracts player-specific state for each player
- Broadcasts via `sendToPlayer()` with `{type: 'game-state', state: ...}`

**Player Side (`use-player-gameplay.ts`):**

- Receives game state updates from host
- Sends actions to host via `{type: 'player-action', action: ..., betSize?: ...}`
- No local game logic (thin client pattern)
- UI reflects received state only

### Critical Implementation Notes

**poker-ts API Gotcha:**

- `table.isBettingRoundInProgress()` throws error if no hand in progress
- ALWAYS check `table.isHandInProgress()` before calling `isBettingRoundInProgress()`
- Pattern used throughout codebase: `if (table.isHandInProgress() && table.isBettingRoundInProgress()) { ... }`

**Version-Based Updates:**

- `pokerGame.version` incremented on every state change
- Used to trigger React re-renders efficiently
- Prevents unnecessary network broadcasts (version comparison in `useEffect`)

**Metro Config Custom Resolver:**

- Redirects `crypto` imports → `react-native-quick-crypto`
- Required for poker-ts to work on React Native
- Also provides polyfills for `buffer`, `process`, `assert`

**Development Mode:**

- Game code currently hardcoded to 'AAAAAA' for easier testing
- See commit 6b66321 for debugging simplification
- Production should use random code generation

**AWS Infrastructure:**

- DynamoDB table: `poker-signaling-connections`
- Primary key: `connectionId`
- GSI: `gameId-index` for finding players in same game
- TTL enabled for automatic cleanup

### Navigation & Routing

**Expo Router (file-based):**

- Routes map to files in `/app`
- Route constants defined in `/constants/routes.ts`
- Type-safe navigation using `router.push()` from `expo-router`

### Testing

**Current Status:**

- No automated tests currently configured
- Manual testing via development builds
- Future: Consider adding Jest or Vitest

### Build Requirements

**Native Dependencies Require Development Builds:**

- WebRTC requires native modules (not available in Expo Go)
- Run `npm run development-builds` after adding native packages
- Use Expo Dev Client for testing during development

### AWS Signaling Server

**Stack:**

- API Gateway WebSocket API (wss://6jxm902dzc.execute-api.us-west-2.amazonaws.com/prod)
- Lambda function (Python) routes signaling messages
- DynamoDB stores active connections with TTL
- Region: us-west-2, Stage: prod

**Signaling Flow:**

- Used ONLY for initial WebRTC connection setup
- Routes SDP offers/answers and ICE candidates between peers
- Once WebRTC data channel opens, signaling is no longer needed

### Documentation Resources

**Project Docs:**

- `/docs/webrtc-architecture.md` - Complete WebRTC architecture specification
- `/docs/signaling-webrtc-integration.md` - Integration details
- `/table-poker/AGENTS.md` - Expo development guidelines and commands
- `/infrastructure/signaling-server/README.md` - AWS deployment guide

**External Resources:**

- Expo docs: https://docs.expo.dev/llms-full.txt
- EAS docs: https://docs.expo.dev/llms-eas.txt
- Expo SDK docs: https://docs.expo.dev/llms-sdk.txt
