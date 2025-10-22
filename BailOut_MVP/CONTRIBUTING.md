# Contributing to BailOut

Thank you for your interest in contributing to BailOut! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project and community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that could reasonably be considered inappropriate

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/bailout.git
   cd bailout
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-org/bailout.git
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Process

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

Examples:
- `feature/voice-synthesis-integration`
- `fix/login-validation-error`
- `docs/api-authentication-guide`

### Development Workflow

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes**:
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**:
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```

5. **Commit your changes** (see Commit Guidelines below)

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature
   ```

7. **Create a Pull Request**

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Test additions or corrections
- **build**: Build system changes
- **ci**: CI/CD configuration changes
- **chore**: Maintenance tasks

### Scopes

- **mobile**: React Native app changes
- **backend**: Express server changes
- **shared**: Shared package changes
- **deps**: Dependency updates
- **config**: Configuration changes

### Examples

```bash
# Feature
feat(mobile): add voice synthesis settings screen

# Bug fix
fix(backend): resolve JWT token expiration issue

# Documentation
docs(api): update authentication endpoint documentation

# With breaking change
feat(backend)!: change user authentication flow

BREAKING CHANGE: JWT tokens now expire after 24 hours instead of 7 days
```

### Commit Message Rules

1. Use present tense ("add feature" not "added feature")
2. Use imperative mood ("move cursor to..." not "moves cursor to...")
3. Limit the first line to 72 characters
4. Reference issues and pull requests when relevant
5. Include breaking changes in the footer when applicable

## 🔄 Pull Request Process

### Before Creating a PR

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new functionality
4. Rebase on the latest main branch
5. Squash minor commits if appropriate

### PR Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console.logs or debugging code

## Related Issues
Closes #123
```

### PR Review Process

1. At least one maintainer must review and approve
2. All CI checks must pass
3. No unresolved conversations
4. Up-to-date with main branch
5. Follows all coding standards

## 🎨 Code Style

### General Guidelines

- Use TypeScript for type safety
- Follow functional programming principles where appropriate
- Keep functions small and focused
- Use meaningful variable and function names
- Avoid deep nesting
- Handle errors appropriately
- Remove console.logs before committing

### TypeScript Guidelines

```typescript
// Use type imports
import type { User } from '@bailout/shared';

// Use interfaces for objects
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

// Use proper typing
const processUser = async (userId: string): Promise<User> => {
  // Implementation
};
```

### React Native Guidelines

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  // Component implementation
};

// Use hooks appropriately
const useUserData = (userId: string) => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch logic
  }, [userId]);

  return { data, loading };
};
```

### Express/Backend Guidelines

```typescript
// Use async/await for asynchronous operations
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserService.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Use proper error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err.stack);
  res.status(500).json({ error: err.message });
};
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Test implementation
    });

    it('should throw error with invalid email', async () => {
      // Test implementation
    });
  });
});
```

### Testing Best Practices

1. Write tests before or alongside code (TDD/BDD)
2. Test edge cases and error conditions
3. Use descriptive test names
4. Keep tests independent and isolated
5. Mock external dependencies
6. Aim for high code coverage (>80%)
7. Use factories for test data

### Example Test

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document API endpoints with request/response examples
- Include usage examples in utility functions
- Keep README files up-to-date

### JSDoc Example

```typescript
/**
 * Generates a bail-out call with the specified parameters
 * @param userId - The ID of the user requesting the call
 * @param scenario - The scenario template to use
 * @param delay - Delay in seconds before initiating the call
 * @returns Promise resolving to the call ID
 * @throws {ValidationError} If parameters are invalid
 * @example
 * const callId = await generateBailOutCall('user123', 'emergency', 30);
 */
export const generateBailOutCall = async (
  userId: string,
  scenario: ScenarioType,
  delay: number
): Promise<string> => {
  // Implementation
};
```

### API Documentation

Document all API endpoints in the following format:

```markdown
### POST /api/v1/calls/generate

Generate a bail-out call

**Request Body:**
```json
{
  "scenario": "emergency",
  "delay": 30,
  "voice": "sarah"
}
```

**Response:**
```json
{
  "callId": "call_123abc",
  "status": "scheduled",
  "scheduledFor": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error
```

## 🔧 Development Tools

### Recommended VSCode Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools
- GitLens
- Todo Tree

### Debugging

1. Use VSCode debugger for Node.js backend
2. Use React Native Debugger for mobile app
3. Use Redux DevTools for state debugging
4. Enable source maps for better stack traces

## 🚢 Release Process

1. Version updates follow Semantic Versioning
2. Releases are created from the main branch
3. Changelog is updated with all changes
4. Release notes include breaking changes
5. All tests must pass before release

## 🤝 Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Join our development Slack channel
- Email the maintainers for sensitive issues

## 🏆 Recognition

Contributors will be recognized in:
- The project's CONTRIBUTORS.md file
- Release notes for significant contributions
- Our website's contributors page

Thank you for contributing to BailOut! Your efforts help make the project better for everyone. 🎉