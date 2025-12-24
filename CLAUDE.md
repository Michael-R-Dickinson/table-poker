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