# Contributing to SoroSim Backend

Thank you for your interest in contributing to SoroSim Backend! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SoroSim-backend.git
   cd SoroSim-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

Create a feature branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions or fixes
- `refactor/` - Code refactoring

### 2. Make Changes

- Write clear, concise commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

Before committing, ensure all checks pass:

```bash
# Run linting
npm run lint

# Run build
npm run build

# Run tests
npm test

# Run all checks together
npm run lint && npm run build && npm test
```

### 4. Commit Your Changes

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or tooling changes
- `ci`: CI/CD changes

Example:
```bash
git commit -m "feat(cli): add ledger seed command

- Add 'ledger seed <file>' command to import ledger state
- Support --clear flag to wipe existing entries
- Add comprehensive documentation

Closes #123"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub targeting the `develop` branch.

## Pull Request Guidelines

### PR Requirements

- ✅ All CI checks must pass (lint, build, test)
- ✅ Code must be properly formatted and linted
- ✅ New features must include tests
- ✅ Documentation must be updated
- ✅ Commit messages must follow conventional format

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Code Style Guidelines

### TypeScript

- Use explicit types, avoid `any` when possible
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Prefer `const` over `let`
- Use arrow functions for callbacks

### Naming Conventions

- **Files**: camelCase for files (e.g., `ledgerController.ts`)
- **Classes**: PascalCase (e.g., `MockLedgerStore`)
- **Functions**: camelCase (e.g., `getLedgerStats`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_NETWORK`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `LedgerEntry`)

### Error Handling

- Always handle errors gracefully
- Provide meaningful error messages
- Use try-catch blocks for async operations
- Return proper HTTP status codes

### Testing

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('Feature Name', () => {
  it('should do something specific when condition is met', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## CI/CD Pipeline

All pull requests trigger automated checks:

### 1. Lint Job
- Runs ESLint on all TypeScript files
- Checks code style and quality
- Must pass with 0 errors

### 2. Build Job
- Compiles TypeScript to JavaScript
- Verifies no compilation errors
- Uploads build artifacts

### 3. Test Job
- Runs on Node.js 18 and 20
- Executes all integration tests
- Generates coverage report
- Must pass on all Node versions

### 4. Integration Job
- Verifies CLI builds correctly
- Tests basic CLI functionality
- Ensures all components work together

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README.md and CLI.md for guidance

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Keep discussions focused and professional

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
