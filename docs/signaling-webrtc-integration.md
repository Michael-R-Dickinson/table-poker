# Signaling Server and WebRTC Integration

## Overview

The signaling server and WebRTC serve different purposes and work together during different phases of connection:

**Signaling Server (WebSocket)**

- Used ONLY for initial connection setup
- Routes messages between host and players to establish peer connections
- Becomes dormant once WebRTC connection is established
- NOT used for game communication

**WebRTC (Data Channels)**

- Used for actual game communication
- Direct peer-to-peer connection between host and players
- All game state updates and player actions flow through data channels
- Active throughout the entire game session

## Connection Lifecycle

### Phase 1: Initial Connection (Signaling Active)

Both host and players connect to the WebSocket signaling server:

```
┌─────────┐                  ┌──────────────┐                  ┌────────┐
│ Host    │◄────WebSocket────┤   Signaling  ├────WebSocket────►│ Player │
│ Device  │                  │   Server     │                  │ Device │
└─────────┘                  └──────────────┘                  └────────┘
```

**Code Reference:** `hooks/use-signaling-connection.ts:42-43`

```typescript
const url = `${SIGNALING_SERVER_URL}?playerId=${...}&gameId=${...}`;
const ws = new WebSocket(url);
```

### Phase 2: WebRTC Negotiation (Signaling Routes Messages)

The signaling server acts as a message router to exchange WebRTC connection details:

```
┌─────────┐                  ┌──────────────┐                  ┌────────┐
│ Host    │──1. OFFER───────►│   Signaling  │──1. OFFER───────►│ Player │
│         │                  │   Server     │                  │        │
│         │◄─2. ANSWER───────┤   (routes    │◄─2. ANSWER───────┤        │
│         │                  │   messages)  │                  │        │
│         │──3. ICE──────────►│              │──3. ICE─────────►│        │
│         │◄─3. ICE──────────┤              │◄─3. ICE─────────┤        │
└─────────┘                  └──────────────┘                  └────────┘
```

### Phase 3: Direct Communication (Signaling Idle)

Once WebRTC connection is established, the data channel opens and signaling is no longer used:

```
┌─────────┐                  ┌──────────────┐                  ┌────────┐
│ Host    │                  │   Signaling  │                  │ Player │
│ Device  ├─────────WebRTC Data Channel──────────────────────►│ Device │
└─────────┘                  │   (idle)     │                  └────────┘
                             └──────────────┘
```

All game communication now flows through WebRTC data channels.

## Code Integration

The application uses three main hooks that work together:

### 1. useSignalingConnection Hook

**Purpose:** Manages WebSocket connection to signaling server

**Location:** `hooks/use-signaling-connection.ts`

**Key Functions:**

- `connect()` - Opens WebSocket to signaling server
- `sendMessage()` - Sends signaling messages (offer/answer/ICE)
- `onMessage` callback - Receives signaling messages from other peers

**Usage Pattern:**

```typescript
const { connect, sendMessage } = useSignalingConnection({
  playerId: "player-123",
  gameId: "game-456",
  onMessage: (message) => {
    // Forward signaling messages to WebRTC hook
  },
});
```

### 2. useWebRTCHost Hook

**Purpose:** Manages WebRTC connections to all players (host side)

**Location:** `hooks/use-webrtc-host.ts`

**Key Functions:**

- `handleSignalingMessage()` - Processes signaling messages from players
- `broadcastToPlayers()` - Sends game state to all players via data channels
- `sendToPlayer()` - Sends data to specific player via data channel

**Integration Point:**

```typescript
const { handleSignalingMessage, broadcastToPlayers } = useWebRTCHost({
  sendSignalingMessage, // ← Connected to signaling hook
  onPlayerConnected: (playerId) => console.log("Connected!"),
  onDataChannelMessage: (playerId, data) => {
    /* game logic */
  },
});
```

### 3. useWebRTCPlayer Hook

**Purpose:** Manages WebRTC connection to host (player side)

**Location:** `hooks/use-webrtc-player.ts`

**Key Functions:**

- `handleSignalingMessage()` - Processes signaling messages from host
- `sendToHost()` - Sends player actions to host via data channel

**Integration Point:**

```typescript
const { handleSignalingMessage, sendToHost } = useWebRTCPlayer({
  sendSignalingMessage, // ← Connected to signaling hook
  onConnected: () => console.log("Connected!"),
  onDataChannelMessage: (data) => {
    /* receive game state */
  },
});
```

## Message Flow Examples

### Example 1: Player Joins Game

**Step 1:** Player sends join request via signaling

```typescript
// Player side - hooks/use-webrtc-player.ts
signalingConnection.sendMessage({
  type: "join",
  // senderId added by server based on WebSocket connection
});
```

**Step 2:** Host receives join request and creates offer

```typescript
// Host side - hooks/use-webrtc-host.ts:115-144
handleSignalingMessage(message) {
  if (message.type === 'join') {
    handlePlayerJoin(message.senderId);
    // Creates RTCPeerConnection
    // Creates offer
    // Sends offer via signaling
  }
}
```

**Step 3:** Player receives offer and sends answer

```typescript
// Player side - hooks/use-webrtc-player.ts:100-138
handleSignalingMessage(message) {
  if (message.type === 'offer') {
    handleOffer(message.payload);
    // Sets remote description
    // Creates answer
    // Sends answer via signaling
  }
}
```

**Step 4:** Data channel opens

```typescript
// Host side - hooks/use-webrtc-host.ts:56-61
dataChannel.addEventListener("open", () => {
  // Connection established
  // Signaling no longer needed for this player
  onPlayerConnected?.(playerId);
});
```

### Example 2: Player Takes Action (After Connection)

**WebRTC only, no signaling involved:**

```typescript
// Player side - sends action via data channel
sendToHost({
  action: "bet",
  amount: 100,
});

// Host side - receives via data channel
onDataChannelMessage: (playerId, data) => {
  // Process bet action
  // Update game state
  // Broadcast new state to all players
  broadcastToPlayers(newGameState);
};
```

## ICE Candidate Exchange

ICE candidates are discovered continuously during connection setup and must be exchanged via signaling:

**Host discovers ICE candidate:**

```typescript
// hooks/use-webrtc-host.ts:79-92
peerConnection.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    sendSignalingMessage({  // ← Uses signaling
      type: 'ice-candidate',
      targetId: playerId,
      payload: { candidate: event.candidate.candidate, ... }
    });
  }
});
```

**Player receives and adds ICE candidate:**

```typescript
// hooks/use-webrtc-player.ts:140-159
handleSignalingMessage(message) {
  if (message.type === 'ice-candidate') {
    peerConnection.addIceCandidate(new RTCIceCandidate(message.payload));
  }
}
```

## Common Confusion Points

### Why do we need both?

**WebRTC cannot establish connections without signaling**

- WebRTC needs to exchange connection details (SDP offers/answers)
- WebRTC needs to exchange network paths (ICE candidates)
- No built-in mechanism for this exchange
- Signaling server provides the exchange mechanism

### Why not just use WebSocket for everything?

**WebRTC provides better performance for game data**

- Direct peer-to-peer connection (lower latency)
- No server bandwidth costs after connection
- Encrypted by default
- Optimized for real-time data

### When is each protocol used?

**Signaling (WebSocket):**

- Connection setup phase only
- Exchanging offers, answers, ICE candidates
- Routing initial "join" messages

**WebRTC (Data Channels):**

- All game communication
- Player actions → Host
- Game state updates → Players
- Active for entire game session

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Host Device                           │
│                                                              │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │ useSignalingConn   │────────►│  useWebRTCHost      │    │
│  │ (WebSocket)        │         │  (Data Channels)    │    │
│  └────────┬───────────┘         └──────────┬──────────┘    │
│           │                                 │               │
│           │ send offer/answer/ICE           │ send game     │
│           │ (during setup)                  │ state updates │
│           │                                 │ (during game) │
└───────────┼─────────────────────────────────┼───────────────┘
            │                                 │
            ▼                                 ▼
   ┌────────────────┐                ┌────────────────┐
   │   Signaling    │                │   WebRTC P2P   │
   │   Server       │                │   Connection   │
   │   (AWS WS)     │                │   (Direct)     │
   └────────┬───────┘                └────────┬───────┘
            │                                 │
            │                                 │
            ▼                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                       Player Device                          │
│                                                              │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │ useSignalingConn   │────────►│  useWebRTCPlayer    │    │
│  │ (WebSocket)        │         │  (Data Channel)     │    │
│  └────────────────────┘         └─────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Checklist

When implementing a connection flow, you need:

1. **Both devices connect to signaling server**
   - Use `useSignalingConnection` hook
   - Provide playerId and gameId

2. **Wire signaling to WebRTC hooks**
   - Pass `sendMessage` from signaling to WebRTC hook
   - Pass `handleSignalingMessage` from WebRTC to signaling onMessage callback

3. **Initialize WebRTC connection**
   - Host: Create peer connection when player joins
   - Player: Create peer connection when offer received

4. **Wait for data channel to open**
   - Listen for `onPlayerConnected` (host) or `onConnected` (player)
   - Only send game data after data channel is open

5. **Use data channels for game communication**
   - Host: `broadcastToPlayers()` or `sendToPlayer()`
   - Player: `sendToHost()`
   - Never use signaling for game data

## Troubleshooting

### Connection never completes

- Check that both devices connected to signaling server
- Verify ICE candidates are being exchanged
- Check STUN server configuration in `use-webrtc-*.ts`
- Look for firewall blocking WebRTC traffic

### Data channel not opening

- Ensure host creates data channel (line 45 in use-webrtc-host.ts)
- Verify offer/answer exchange completed
- Check that remote description was set on both sides

### Messages not reaching peer

- Verify data channel state is 'open' before sending
- Check that you're using data channel, not signaling, for game data
- Ensure JSON serialization is working correctly

## Related Documentation

- [WebRTC Architecture](./webrtc-architecture.md) - High-level architecture overview
- [Signaling Message Types](../table-poker/types/signaling.ts) - Message type definitions
- [AWS WebSocket Configuration](../table-poker/constants/signaling.ts) - Server URL
