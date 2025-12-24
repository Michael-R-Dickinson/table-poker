# WebRTC Connection Architecture

## Overview

The poker home game uses WebRTC for real-time, peer-to-peer communication between the host device and player devices. The host maintains authoritative game state and broadcasts updates to all connected players.

## Network Topology

**Star topology** where each player connects directly to the host:

```
        Player 1
           |
           |
Player 2---HOST---Player 3
           |
           |
        Player 4
```

- **Total connections:** N (where N = number of players)
- **Per player:** 1 connection (to host only)
- **Host:** N connections (one per player)
- **Players do NOT connect to each other**

## Communication Pattern

### Centralized Game State

- **Host device** maintains the single source of truth for game state
- **Player devices** send actions/inputs to host
- **Host** processes actions, updates state, and broadcasts to all players

### Message Flow

```
Player Action:
  Player → Host: { action: "bet", amount: 100 }
  Host: Process action, update game state
  Host → All Players: { type: "state_update", gameState: {...} }

State Broadcast:
  Host maintains separate data channel to each player
  Sends identical state update on each channel
  All players render based on received state
```

## WebRTC Connection Setup

### Initial Setup Phase

#### Host Device
1. Connect to AWS WebSocket API (signaling server)
2. Create game session (generate unique game code)
3. Wait for player join requests

#### Player Device
1. Connect to AWS WebSocket API (signaling server)
2. Send join request with game code
3. Signaling server routes to correct host

### Peer Connection Establishment

For each player that joins, the following flow occurs:

#### Host Side
1. Create `RTCPeerConnection` instance for this player
2. Set up ICE candidate listener
3. Create data channel for game communication
4. Generate SDP offer via `createOffer()`
5. Set as local description via `setLocalDescription()`
6. Send offer to player via WebSocket signaling server

#### Player Side
1. Receive offer from signaling server
2. Create `RTCPeerConnection` instance
3. Set up ICE candidate listener
4. Set received offer as remote description via `setRemoteDescription()`
5. Generate SDP answer via `createAnswer()`
6. Set as local description via `setLocalDescription()`
7. Send answer to host via signaling server

#### ICE Candidate Exchange (Both Sides)
1. Listen for `onicecandidate` events
2. Send discovered candidates to peer via signaling server
3. Receive candidates from peer
4. Add via `addIceCandidate()`

#### Connection Complete
- Data channel opens (`ondatachannel` / `onopen` events)
- Signaling server no longer needed
- Direct peer-to-peer communication established

## Signaling Server Messages

The AWS WebSocket API routes these message types:

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `JOIN` | Player → Server → Host | Player requests to join game |
| `OFFER` | Host → Server → Player | WebRTC SDP offer |
| `ANSWER` | Player → Server → Host | WebRTC SDP answer |
| `ICE_CANDIDATE` | Bidirectional | ICE candidates for NAT traversal |
| `PLAYER_CONNECTED` | Host → Server → Player | Connection confirmation |

## react-native-webrtc Components

### RTCPeerConnection
- Main class for peer-to-peer connection
- Manages connection state, ICE candidates, data channels
- Configuration includes ICE servers (STUN/TURN)

### RTCSessionDescription
- Represents SDP offer/answer
- Contains media/data channel configuration
- Used in `setLocalDescription()` and `setRemoteDescription()`

### RTCIceCandidate
- Network path options for connection
- Discovered during connection setup
- Enables NAT traversal

### RTCDataChannel
- Primary communication channel for game state
- Supports reliable, ordered delivery
- Transports JSON-serialized game actions and state

## ICE Servers (STUN/TURN)

### STUN Servers
- Help discover public IP address
- Enable NAT traversal
- Free options available (Google public STUN)
- **Sufficient for ~90-95% of home network scenarios**

### TURN Servers
- Relay traffic when direct connection fails
- Required for ~5-10% of cases:
  - Corporate/university firewalls
  - Symmetric NAT scenarios
  - Restrictive mobile carriers
- **Implementation:** Start with STUN only, add TURN as fallback if needed

### Configuration
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
    // Add TURN server here if needed
  ]
};
```

## Connection State Management

### Per-Player Connection States
- `connecting` - Establishing peer connection
- `connected` - Data channel open and ready
- `disconnected` - Temporary connection loss
- `failed` - Connection permanently failed

### Host Responsibilities
- Track connection state for each player
- Handle reconnection attempts
- Remove peer connections when player leaves
- Manage player timeouts

### Error Scenarios
- Player disconnects during setup
- ICE connection fails
- Signaling server connection drops
- Player app backgrounds/closes
- Network quality degradation

## Data Channel Configuration

### Reliability
- **Ordered:** `true` - Messages arrive in sent order
- **Reliable:** `true` - Guaranteed delivery with retransmission
- **Critical for game state consistency**

### Message Format
All messages sent as JSON strings via data channel

```javascript
// Player to Host
{
  action: "bet" | "fold" | "call" | "raise" | "check",
  amount?: number,
  timestamp: number
}

// Host to Player
{
  type: "state_update",
  gameState: {
    // Full game state object
  },
  timestamp: number
}
```

## Implementation Phases

### Phase 1: Signaling Layer
- WebSocket client wrapper
- Message routing and parsing
- Connection to AWS API Gateway
- Handle connection lifecycle

### Phase 2: Single Peer Connection
- Host ↔ single player connection
- Test data channel communication
- Verify ICE/STUN configuration
- Debug connection issues

### Phase 3: Multiple Peers
- Scale to multiple simultaneous connections
- Track connections in state map (playerId → RTCPeerConnection)
- Handle concurrent connection setup
- Test with multiple devices

### Phase 4: Game Integration
- Send game state updates via data channels
- Handle player join/leave during active game
- Synchronize new players joining mid-game
- Process player actions through WebRTC

### Phase 5: Robustness
- Connection quality monitoring
- Reconnection handling
- Error recovery mechanisms
- Timeout and retry logic

## Bandwidth Considerations

### Host Bandwidth
With N players, host sends each state update N times (once per connection)

**Example:** 8 players, 10KB state update
- Bandwidth per update: 80KB
- Updates occur only on player actions
- Negligible impact even on cellular

**Conclusion:** Not a bottleneck for typical home game scenarios (≤10 players)

### Player Bandwidth
- Sends only own actions (minimal data)
- Receives state updates from host
- Low bandwidth requirements

## Security Considerations

### Data Encryption
- WebRTC uses DTLS/SRTP by default
- All data channel communication is encrypted
- No additional encryption needed

### Game Integrity
- Host is authoritative - validates all actions
- Players cannot manipulate game state directly
- Private cards only sent to owning player

## Open Questions

1. **Player authentication:** How to identify players uniquely across reconnections?
2. **State synchronization:** Full state on connect, or incremental updates?
3. **Spectator mode:** Support for tablet/observer connections?
4. **Reconnection policy:** How long to wait before removing disconnected player?

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Star topology vs mesh | Players only need host connection; simpler, fewer connections |
| Host-authoritative state | Single source of truth; no consensus algorithms needed |
| STUN only (initially) | Sufficient for home networks; add TURN later if needed |
| Reliable data channels | Game state must be consistent; can't tolerate message loss |
| JSON message format | Human-readable, easy to debug, sufficient performance |

## Success Criteria

- ✅ Host can maintain connections to 8+ players simultaneously
- ✅ State updates propagate to all players in <100ms
- ✅ Connection success rate >90% on home WiFi
- ✅ Graceful handling of player disconnects
- ✅ Automatic reconnection when possible
