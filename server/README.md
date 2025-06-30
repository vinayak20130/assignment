# Mini Social App Server - Modular Architecture

## Architecture Overview

This server implementation follows SOLID principles with a clean, modular architecture that separates concerns and makes the code maintainable and testable.

## Project Structure

```
server/
├── src/
│   ├── types/
│   │   └── index.ts              # Type definitions and interfaces
│   ├── repositories/
│   │   ├── WalletRepository.ts   # Wallet data access
│   │   ├── GameRepository.ts     # Game data access
│   │   └── CoinPackRepository.ts # Coin pack data access
│   ├── services/
│   │   ├── WalletService.ts      # Wallet business logic
│   │   ├── GameService.ts        # Game business logic
│   │   └── RechargeService.ts    # Recharge business logic
│   ├── controllers/
│   │   ├── WalletController.ts   # Wallet HTTP handlers
│   │   └── GameController.ts     # Game HTTP handlers
│   ├── middleware/
│   │   └── errorHandling.ts      # Error handling middleware
│   ├── routes/
│   │   ├── walletRoutes.ts       # Wallet route definitions
│   │   ├── gameRoutes.ts         # Game route definitions
│   │   └── index.ts              # Route setup
│   ├── container/
│   │   └── Container.ts          # Dependency injection
│   └── app.ts                    # Application bootstrap
├── index.ts                      # TypeScript entry point
└── package.json                  # Dependencies and scripts
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- Repositories handle only data access
- Services handle only business logic
- Controllers handle only HTTP request/response

### Open/Closed Principle (OCP)
- Services are open for extension but closed for modification
- New game types can be added without changing existing code
- New payment methods can be added to RechargeService

### Liskov Substitution Principle (LSP)
- All repositories follow consistent interfaces
- Services can be replaced with alternative implementations
- Controllers follow consistent request/response patterns

### Interface Segregation Principle (ISP)
- Small, focused interfaces rather than large ones
- Each service depends only on methods it actually uses
- No forced dependencies on unused functionality

### Dependency Inversion Principle (DIP)
- High-level modules don't depend on low-level modules
- Services depend on repository abstractions
- Controllers depend on service abstractions
- Container manages all dependencies

## Key Components

### Repositories (Data Layer)
Handle all data access operations. Currently use in-memory storage for demo purposes, but can easily be replaced with database implementations.

### Services (Business Logic Layer)
Contain all business rules and validation logic. They coordinate between repositories and enforce application constraints.

### Controllers (Presentation Layer)
Handle HTTP requests and responses. They validate input, call appropriate services, and format responses.

### Container (Dependency Injection)
Wires up all dependencies in a centralized location. Makes testing easier and reduces coupling.

## Development Benefits

### Testability
- Each layer can be tested independently
- Easy to mock dependencies for unit testing
- Clear separation makes integration testing straightforward

### Maintainability
- Changes in one layer don't affect others
- Easy to locate and fix bugs
- Clear code organization and naming conventions

### Scalability
- Easy to add new features without breaking existing code
- Can extract services into microservices if needed
- Database can be added without changing business logic

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Type Checking
```bash
npm run type-check
```

## Error Handling

The server implements comprehensive error handling:
- Custom AppError class for application-specific errors
- Global error handler middleware
- Consistent error response format
- Proper HTTP status codes

## API Endpoints

### Wallet Operations
- `GET /api/wallet` - Get wallet information
- `POST /api/wallet/recharge` - Recharge wallet

### Game Operations
- `GET /api/games` - Get available games
- `POST /api/games/join` - Join a game
- `GET /api/games/:id/availability` - Check game availability

### System
- `GET /api/health` - Health check
- `GET /api` - API information

## Future Enhancements

### Database Integration
Replace in-memory repositories with database implementations:
- Add database connection configuration
- Implement proper transaction handling
- Add data migrations

### Authentication
- Add JWT token validation middleware
- Implement user session management
- Add role-based access control

### Caching
- Add Redis for session storage
- Implement response caching
- Add database query caching

### Monitoring
- Add request/response logging
- Implement metrics collection
- Add health check endpoints

## Testing Strategy

### Unit Tests
- Test each service method independently
- Mock repository dependencies
- Test business logic validation

### Integration Tests
- Test complete request/response cycles
- Test database interactions
- Test error handling scenarios

### End-to-End Tests
- Test complete user workflows
- Test cross-service interactions
- Test system behavior under load
