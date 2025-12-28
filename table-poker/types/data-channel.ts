import { Action, PlayerGameState } from './game-state';

// Heartbeat messages
export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

// Game messages (Host -> Player)
export interface GameStateMessage {
  type: 'game-state';
  state: PlayerGameState;
}

export interface GameEndMessage {
  type: 'game_end';
}

// Player messages (Player -> Host)
export interface PlayerActionMessage {
  type: 'player-action';
  action: Action;
  betSize?: number;
}

// Union types for all data channel messages
export type HostToPlayerMessage =
  | GameStateMessage
  | GameEndMessage
  | PingMessage
  | PongMessage;

export type PlayerToHostMessage = PlayerActionMessage | PingMessage | PongMessage;

export type DataChannelMessage = HostToPlayerMessage | PlayerToHostMessage;
