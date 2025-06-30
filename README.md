# Mini Social App - Game Lobby & Wallet Module

A feature-rich social application module combining game lobby functionality with a comprehensive wallet system. Built with React, TypeScript, and Node.js following SOLID design principles.

## Features

### Game Lobby System
- Display of two mock games: "Challenge & Connect" and "Snake & Ladder"
- Entry coin requirements displayed for each game
- Real-time player count tracking
- Join functionality with automatic coin deduction
- Immersive game screens with unique content for each game

### Wallet Management System
- Real-time coin balance display
- Comprehensive transaction history with timestamps
- Multiple recharge options with bonus coin packs
- Robust error handling for insufficient balance scenarios
- Instant balance updates across all components

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express framework
- **Architecture**: SOLID principles with Repository and Service patterns
- **Styling**: Custom CSS with mobile-first responsive design
- **State Management**: React Hooks with component composition
- **API Communication**: Custom HTTP client with error handling

## Modular Architecture

### Backend Structure (SOLID Principles)

The server is organized into distinct layers following dependency inversion:

```
server/src/
├── types/           # Domain models and interfaces
├── repositories/    # Data access layer (WalletRepository, GameRepository)
├── services/        # Business logic layer (WalletService, GameService)
├── controllers/     # HTTP handlers (WalletController, GameController)
├── middleware/      # Cross-cutting concerns (error handling, logging)
├── routes/          # API route definitions
├── container/       # Dependency injection container
└── app.ts          # Application bootstrap and configuration
```

**Key Benefits:**
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to extend without breaking existing code
- **Flexibility**: Can swap implementations without affecting other layers

### Frontend Architecture

React components follow container/presentation pattern for clean separation:

```
client/src/components/
├── Wallet.tsx      # Container + Pure Components (Balance, Packs, History)
├── GameLobby.tsx   # Container + Pure Components (GameList, GameCard, JoinButton)
└── GameScreen.tsx  # Container + Pure Components (GameContent, BackButton)
```

**Design Patterns:**
- Container components handle business logic and state
- Pure components focus solely on presentation
- Custom hooks encapsulate reusable logic
- Repository pattern abstracts API communication

## Installation and Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation Steps

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Run the application**
   ```bash
   # Run both backend and frontend concurrently
   npm run dev

   # Or run them separately:
   # Backend server (Terminal 1)
   npm run server:dev

   # Frontend application (Terminal 2)
   npm run client:dev
   ```

### Access Points
- **Backend API**: http://localhost:5000
- **Frontend Application**: http://localhost:3000

## Application Usage

### Wallet Operations
1. **View Balance**: Current coin balance is prominently displayed
2. **Recharge Wallet**: Select from four different coin packs with varying bonus amounts
3. **Transaction History**: Review recent transactions with detailed descriptions

### Game Operations
1. **Browse Games**: View available games with entry costs and current player counts
2. **Join Games**: Click "Join Game" to automatically deduct entry cost and enter game session
3. **Game Experience**: Interactive placeholder screens demonstrate game concepts
4. **Return to Lobby**: Navigate back to main lobby from any game session

## API Endpoints

### Wallet Endpoints
- `GET /api/wallet` - Retrieve wallet information and transaction history
- `POST /api/wallet/recharge` - Process coin recharge with specified pack

### Game Endpoints
- `GET /api/games` - Retrieve available games with current statistics
- `POST /api/games/join` - Join specified game and deduct entry cost

### System Endpoints
- `GET /api/coin-packs` - Retrieve available recharge options
- `GET /api/health` - System health check


### Component Architecture

**Container Components**: Handle business logic, state management, and API interactions
**Presentation Components**: Pure components focused on UI rendering
**Service Layer**: Encapsulates business logic and external API communication
**Repository Layer**: Abstracts data access patterns

## Development Features

### Error Handling
- Comprehensive error boundaries for graceful failure handling
- User-friendly error messages for common scenarios
- Network timeout handling and retry mechanisms

### Performance Optimizations
- Component composition to minimize re-renders
- Efficient state management with focused updates
- Responsive design optimized for mobile devices

### Code Quality
- TypeScript for type safety and developer experience
- Consistent coding patterns following SOLID principles
- Separation of concerns throughout the application

## Future Enhancement Opportunities

### Functional Improvements
- Real multiplayer game implementation with WebSocket communication
- User authentication and profile management systems
- Persistent data storage with database integration
- Real payment gateway integration for coin purchases

### Technical Improvements
- Comprehensive test suite with unit and integration tests
- Continuous integration and deployment pipeline
- Performance monitoring and analytics integration
- Progressive Web App (PWA) capabilities for offline functionality
