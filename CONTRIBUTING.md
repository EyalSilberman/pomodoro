# Contributing to Pomodoro Chrome Extension

Thank you for your interest in contributing to our Pomodoro Chrome Extension! This document provides guidelines and instructions for contributing to the project.

## How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title describing the problem
   - Detailed description of the bug
   - Steps to reproduce
   - Expected behavior
   - Your browser version and OS
   - Screenshots if applicable

### Suggesting Enhancements
1. Check if the enhancement has been suggested in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title describing the enhancement
   - Detailed description of the proposed feature
   - Examples of how it would be used
   - Any relevant mockups or sketches

### Code Contributions

#### Setting Up Development Environment
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/pomodoro-chrome-extension.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Making Changes
1. Write clear, commented code
2. Follow existing code style
3. Test your changes thoroughly
4. Update documentation if needed
5. Add needed tests

#### Submitting Changes (See commit types below)
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Create a Pull Request:
   - Clear title and description
   - Reference any related issues
   - List major changes made

## Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Write clear, descriptive variable and function names
- Add comments for complex logic
- Follow JavaScript best practices

### Testing
- Test all timer functionality
- Check break transitions
- Verify storage functionality
- Test on different Chrome versions

### Documentation
- Update README.md if adding features
- Document any new functions
- Include JSDoc comments for functions
- Update installation instructions if needed

## Pull Request Process

1. Update the README.md with details of major changes
2. Update the version number following [SemVer](http://semver.org/)
3. Your PR will be reviewed by maintainers
4. Once approved, your PR will be merged

## Community Guidelines

- Be respectful and inclusive
- Help others in the community
- Be constructive in feedback
- Follow the code of conduct

## Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Git Commit Message Guidelines](https://www.conventionalcommits.org/)

## Questions?

Feel free to create an issue for any questions about contributing.

Thank you for contributing to make this extension better!

## Commit types

| Commit Type | Title                    | Description                                                                                                 | Emoji  |
| ----------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |:------:|
| `feat`      | Features                 | A new feature                                                                                               | ✨     |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   | 🐛     |
| `docs`      | Documentation            | Documentation only changes                                                                                  | 📚     |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      | 💎     |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   | 📦     |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     | 🚀     |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           | 🚨     |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         | 🛠     |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) | ⚙️     |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           | ♻️     |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   | 🗑     |