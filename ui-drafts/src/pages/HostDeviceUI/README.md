# Host Device UI

This is the UI for the host device in a multi-player poker app.

## Purpose

The host device serves as a shared display that shows:
- Community cards (5 cards that can be face-up or face-down)
- Pot size (visible from both sides of the table)
- Current player turn indicator

## Key Characteristics

- **Mobile/Tablet Only**: Designed exclusively for landscape mode on phones and tablets
- **Passive Display**: This UI does not handle player actions - those are managed on individual player devices
- **Dual-Sided**: Information is displayed in a way that's readable from both sides of the table (pot size is shown both right-side-up and upside-down)

## Components

- Uses the Card component from `src/pages/PlayingCards/Card.tsx` for displaying playing cards
- Displays face-down cards with a placeholder card back design
- Community cards are arranged in a horizontal row
