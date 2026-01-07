# Contributing to PixelBridge

Thank you for your interest in contributing to PixelBridge! 🎮✨

## 📢 Project Status

**This project is primarily for personal use and is not actively maintained by the original author.**

However, community contributions are **welcome and encouraged**! Feel free to:
- 🐛 Fix bugs
- ✨ Add new features
- 📚 Improve documentation
- 🔧 Refactor code
- 🧪 Add tests

**Note**: Pull requests may not be reviewed immediately, as this is a side project. The community is encouraged to fork and maintain their own versions if needed.

---

## 🤝 How to Contribute

### 1. Fork the Repository

Click the "Fork" button at the top right of this repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/PixelBridge.git
cd PixelBridge
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/metadata-editing` - New features
- `fix/upload-timeout` - Bug fixes
- `docs/api-documentation` - Documentation
- `refactor/rom-service` - Code refactoring

### 4. Make Your Changes

Follow the existing code style and patterns:
- Use ES6+ JavaScript
- Follow existing file structure
- Add comments for complex logic
- Keep functions small and focused

### 5. Test Your Changes

```bash
# Backend tests (if you add them)
cd backend
npm test

# Frontend tests (if you add them)
cd frontend
npm test

# Manual testing with Docker
docker-compose up --build
```

### 6. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "Add: Manual metadata editing feature

- Add edit button to ROM details modal
- Create metadata edit form component
- Implement PUT /api/roms/:id/metadata endpoint
- Update ROM model with validation"
```

**Commit Message Format:**
- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Improvements to existing code
- `Refactor:` - Code restructuring
- `Docs:` - Documentation changes
- `Style:` - Formatting, CSS changes
- `Test:` - Adding tests
- `Chore:` - Maintenance (dependencies, build)

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Open a Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your feature branch
4. Write a clear description of your changes:
   - What problem does it solve?
   - How does it work?
   - Screenshots (if UI changes)
   - Testing steps

---

## 📋 Pull Request Guidelines

### Before Submitting

- ✅ Code works locally with Docker
- ✅ No console errors
- ✅ Existing features still work
- ✅ Updated documentation if needed
- ✅ Followed existing code style

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes:
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Tested locally with Docker
```

---

## 🐛 Reporting Bugs

**Found a bug?** Please open an [issue](https://github.com/Virus250188/PixelBridge/issues) with:

1. **Clear title** - "Upload fails for files > 2GB"
2. **Description** - What happened vs. what should happen
3. **Steps to reproduce**:
   ```
   1. Go to Upload page
   2. Select ROM file > 2GB
   3. Click upload
   4. See error
   ```
4. **Environment**:
   - OS: macOS 14.2
   - Docker version: 24.0.6
   - Browser: Chrome 120
5. **Logs** (if applicable):
   ```
   docker-compose logs backend
   ```
6. **Screenshots** (if helpful)

---

## 💡 Feature Requests

Want a new feature? Open an [issue](https://github.com/Virus250188/PixelBridge/issues) with:

1. **Feature title** - "Add batch ROM upload"
2. **Problem it solves** - "Currently uploading 100 ROMs takes too long"
3. **Proposed solution** - "Allow drag & drop of multiple folders"
4. **Alternatives considered** - "Bulk import from .csv file"
5. **Additional context** - Screenshots, examples from other apps

---

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
npm install

# Copy environment
cp ../.env.example .env
# Edit .env with your IGDB credentials

# Initialize database
node src/database/migrations/001_initial.sql

# Start dev server
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker Development

```bash
# Copy environment
cp .env.example .env
# Edit .env with your IGDB credentials

# Build and start
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📂 Project Structure

```
PixelBridge/
├── backend/              # Node.js API Server
│   ├── src/
│   │   ├── config/       # Configuration & constants
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Helper functions
│   └── storage/          # File storage (Docker volume)
├── frontend/             # React App
│   ├── src/
│   │   ├── api/          # API clients
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state
│   │   └── styles/       # CSS
│   └── public/           # Static assets
└── docs/                 # Documentation
```

---

## 🎨 Code Style

### JavaScript/JSX

- Use ES6+ features (arrow functions, destructuring, async/await)
- 2 spaces indentation
- Semicolons required
- Single quotes for strings
- Descriptive variable names

**Good:**
```javascript
const fetchRomMetadata = async (romId) => {
  try {
    const response = await apiClient.get(`/roms/${romId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch ROM metadata:', error);
    throw error;
  }
};
```

**Bad:**
```javascript
function f(id) {
  return apiClient.get("/roms/"+id).then(r=>r.data).catch(e=>{console.log(e)})
}
```

### CSS

- Use existing CSS variables from `:root`
- Follow pixel-art/retro theme
- Mobile-first responsive design
- BEM naming convention where applicable

---

## 🧪 Testing

Currently, the project has **no automated tests**. Contributions to add tests are highly welcome!

**Testing areas that need coverage:**
- Backend API endpoints
- ROM file upload & processing
- Metadata fetching from IGDB
- RetroArch sync workflow
- Frontend components
- Database operations

**Suggested frameworks:**
- Backend: Jest, Supertest
- Frontend: Vitest, React Testing Library

---

## 📖 Documentation

When adding features, please update:

- `README.md` - If it affects installation or main features
- `USER_GUIDE.md` - If it's a user-facing feature
- Code comments - For complex logic
- JSDoc comments - For public API functions

**Example:**
```javascript
/**
 * Uploads a ROM file and fetches metadata from IGDB
 * @param {File} file - ROM file to upload
 * @param {string} platformId - Platform ID (1=NES, 2=SNES, etc.)
 * @returns {Promise<Object>} Uploaded ROM with metadata
 * @throws {Error} If file is invalid or upload fails
 */
async function uploadRom(file, platformId) {
  // Implementation
}
```

---

## 🔒 Security

**Found a security vulnerability?**

Please **DO NOT** open a public issue. Instead:
1. Email: *[your-email-here]* (or use GitHub Security Advisories)
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

We'll respond as soon as possible.

---

## 🌟 Areas Looking for Contributions

Here are some features that would be great additions:

### High Priority
- [ ] **Automated tests** - Jest/Vitest setup
- [ ] **Manual metadata editing** - Edit game info manually
- [ ] **Search functionality** - Search ROMs by title
- [ ] **Batch operations** - Delete/push multiple ROMs
- [ ] **Authentication** - User login for production use

### Medium Priority
- [ ] **Cover art upload** - Custom cover images
- [ ] **Platform statistics** - ROMs per platform chart
- [ ] **RetroArch core selection** - Choose emulator core
- [ ] **Save state management** - Backup/restore save states
- [ ] **Themes** - Dark mode, other color schemes

### Nice to Have
- [ ] **Mobile app** - React Native companion
- [ ] **Advanced search** - Filter by genre, year, rating
- [ ] **ROM scraping** - Auto-detect ROMs from folder
- [ ] **Multi-user support** - Multiple libraries
- [ ] **Achievements integration** - RetroAchievements API

---

## 🤝 Community

- **Issues**: [GitHub Issues](https://github.com/Virus250188/PixelBridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Virus250188/PixelBridge/discussions)
- **Pull Requests**: [GitHub PRs](https://github.com/Virus250188/PixelBridge/pulls)

---

## 📝 License

By contributing to PixelBridge, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## 🙏 Thank You!

Every contribution, no matter how small, is appreciated! Whether it's:
- Fixing a typo in documentation
- Reporting a bug
- Suggesting a feature
- Writing code
- Helping other users

**You're making PixelBridge better for everyone!** 🎮✨

---

**Happy coding, and enjoy your retro gaming! 🕹️**
