# Contributing to SBC Discord Bot

Thank you for your interest in contributing to the SBC Discord Bot! 🎉

## 🚀 How to Contribute

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/SBC-Tickets.git
cd SBC-Tickets
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your test bot credentials

# Run the bot
npm start
```

### 3. Make Your Changes
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make your changes with clear, descriptive commits
- Test thoroughly with your test bot
- Update documentation if needed

### 4. Submit Pull Request
- Push your branch: `git push origin feature/your-feature-name`
- Create a pull request with:
  - Clear title and description
  - Screenshots/examples if applicable
  - Testing notes

## 📋 Development Guidelines

### Code Style
- Use 2 spaces for indentation
- Add JSDoc comments for functions
- Follow existing naming conventions
- Use meaningful variable names

### Commit Messages
Use clear, descriptive commit messages:
```
✅ Good: "Add 2-hour cooldown to review system"
❌ Bad: "fix bug"
```

### Testing
- Test all commands thoroughly
- Test edge cases and error scenarios
- Ensure no existing functionality is broken
- Test with different permission levels

## 🛡️ Security Guidelines

- Never commit tokens, keys, or passwords
- Use environment variables for configuration
- Validate all user inputs
- Handle errors gracefully

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional service types for review system
- [ ] Enhanced statistics and analytics
- [ ] Performance optimizations
- [ ] Better error handling

### Medium Priority
- [ ] Additional ticket categories
- [ ] UI/UX improvements
- [ ] Documentation improvements
- [ ] Code refactoring

### Low Priority
- [ ] Additional admin commands
- [ ] Integration with external APIs
- [ ] Advanced permission systems

## 📝 Review Process

1. **Automated Checks**: GitHub Actions will run code quality checks
2. **Code Review**: Maintainers will review your code
3. **Testing**: Changes will be tested in a staging environment
4. **Merge**: Approved changes will be merged to main branch

## 🤝 Community

- Be respectful and inclusive
- Help other contributors
- Follow our Code of Conduct
- Ask questions if you're unsure

## 📞 Getting Help

- Open an issue for bugs or questions
- Join our Discord server (if available)
- Check existing issues and discussions

Thank you for contributing! 🚀
