# GitHub Automation Guide

This document describes the GitHub Actions workflows and automation setup for the Wopee MCP package.

## 🚀 Overview

The repository includes comprehensive GitHub Actions workflows for:
- **CI/CD Pipeline** - Continuous integration and deployment
- **Automated Publishing** - npm package publishing
- **Release Management** - Automated versioning and releases
- **Security Scanning** - Vulnerability and security checks
- **Performance Testing** - Performance monitoring and regression detection
- **Dependency Updates** - Automated dependency management

## 📋 Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Lint & Type Check** - ESLint and TypeScript validation
- **Test Suite** - Jest tests with coverage (Node.js 18 & 20)
- **Security Audit** - npm audit and vulnerability scanning
- **Build Verification** - Package build and validation
- **Integration Tests** - End-to-end testing (PR only)
- **Performance Tests** - Performance regression testing (PR only)
- **Quality Gate** - Overall quality assessment

### 2. Publishing (`.github/workflows/publish.yml`)

**Triggers:**
- Version tags (e.g., `v1.0.0`)
- Manual dispatch with version bump options

**Features:**
- Automatic version validation
- Pre-publish testing
- npm package publishing
- GitHub release creation
- Changelog generation
- Dry-run support

**Usage:**
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# Or use manual dispatch in GitHub Actions
```

### 3. Release Management (`.github/workflows/release.yml`)

**Triggers:**
- Manual dispatch only

**Features:**
- Version bumping (patch/minor/major)
- Prerelease support
- Automatic changelog generation
- Git tag creation
- GitHub release creation

**Usage:**
1. Go to GitHub Actions → Release Management
2. Click "Run workflow"
3. Select version bump type
4. Choose prerelease option
5. Run workflow

### 4. Security Scanning (`.github/workflows/security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Daily schedule (2 AM UTC)
- Manual dispatch

**Scans:**
- **Dependency Vulnerabilities** - npm audit
- **Code Security** - CodeQL analysis
- **License Compliance** - License checking
- **Secret Scanning** - TruffleHog secret detection

### 5. Performance Testing (`.github/workflows/performance.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Weekly schedule (Sundays 3 AM UTC)
- Manual dispatch

**Tests:**
- **Performance Baseline** - Memory usage and startup time
- **Bundle Analysis** - Package size monitoring
- **Load Testing** - Concurrent request handling
- **Regression Detection** - Performance comparison

### 6. Dependency Updates (`.github/workflows/dependency-update.yml`)

**Triggers:**
- Weekly schedule (Mondays 9 AM UTC)
- Manual dispatch

**Features:**
- Outdated dependency detection
- Automated updates (patch/minor/major)
- Pull request creation
- Test validation

## 🔧 Configuration

### Required Secrets

Add these secrets to your GitHub repository:

1. **NPM_TOKEN** - npm publishing token
   ```bash
   # Generate at https://www.npmjs.com/settings/tokens
   # Required scopes: read, write
   ```

2. **GITHUB_TOKEN** - Automatically provided by GitHub
   - Used for creating releases and pull requests

3. **WOPEE_API_KEY_TEST** - Test API key for integration tests
   ```bash
   # Optional: for integration testing
   ```

4. **WOPEE_PROJECT_UUID_TEST** - Test project UUID
   ```bash
   # Optional: for integration testing
   ```

### Environment Variables

The workflows use these environment variables:

```yaml
env:
  NODE_VERSION: '18'
  NPM_VERSION: '8'
  REGISTRY_URL: 'https://registry.npmjs.org/'
```

## 📦 Publishing Workflow

### Automatic Publishing

1. **Create a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Workflow automatically:**
   - Validates the version
   - Runs full test suite
   - Builds the package
   - Publishes to npm
   - Creates GitHub release
   - Generates changelog

### Manual Publishing

1. Go to GitHub Actions → Publish to npm
2. Click "Run workflow"
3. Select version bump type:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)
4. Choose dry-run option if testing
5. Run workflow

### Release Management

1. Go to GitHub Actions → Release Management
2. Click "Run workflow"
3. Configure options:
   - **Release type**: patch/minor/major
   - **Prerelease**: Create as prerelease
   - **Skip tests**: Skip test suite (not recommended)
4. Run workflow

## 🔒 Security Features

### Automated Security Scanning

- **Daily vulnerability scans** - npm audit
- **Code security analysis** - CodeQL
- **License compliance** - License checking
- **Secret detection** - TruffleHog scanning

### Security Alerts

The workflows will:
- Create security alerts for vulnerabilities
- Block publishing if critical issues found
- Generate security reports
- Upload scan results as artifacts

## 📊 Performance Monitoring

### Performance Metrics

- **Memory usage** - Heap and RSS monitoring
- **Startup time** - Server initialization speed
- **Bundle size** - Package size tracking
- **Load testing** - Concurrent request handling

### Regression Detection

- Compares current performance with baseline
- Alerts on significant regressions
- Generates performance reports
- Tracks trends over time

## 🔄 Dependency Management

### Automated Updates

- **Weekly dependency checks** - Outdated package detection
- **Automated PR creation** - Update pull requests
- **Test validation** - Ensures updates don't break functionality
- **Configurable update types** - patch/minor/major

### Dependabot Integration

The repository includes `.github/dependabot.yml` for:
- Automated dependency PRs
- GitHub Actions updates
- Configurable update schedules
- Review assignment

## 🚨 Troubleshooting

### Common Issues

1. **Publishing fails:**
   - Check NPM_TOKEN secret
   - Verify package name availability
   - Ensure version doesn't already exist

2. **Tests fail:**
   - Check test environment setup
   - Verify API keys for integration tests
   - Review test configuration

3. **Security scans fail:**
   - Review vulnerability reports
   - Update dependencies if needed
   - Check license compliance

4. **Performance regressions:**
   - Review performance reports
   - Check for memory leaks
   - Optimize bundle size

### Debugging

1. **Check workflow logs:**
   - Go to GitHub Actions
   - Click on failed workflow
   - Review job logs

2. **Download artifacts:**
   - Workflows upload test results
   - Download and analyze artifacts
   - Use for debugging

3. **Manual testing:**
   - Run workflows manually
   - Use dry-run options
   - Test locally first

## 📈 Monitoring and Alerts

### Workflow Status

- **Green checkmark** - All checks passed
- **Red X** - One or more checks failed
- **Yellow circle** - Workflow in progress
- **Gray circle** - Workflow skipped

### Notifications

- **Email notifications** - For workflow failures
- **GitHub notifications** - For PR status changes
- **Slack integration** - Optional team notifications

## 🔧 Customization

### Workflow Modifications

1. **Add new jobs:**
   ```yaml
   new-job:
     name: New Job
     runs-on: ubuntu-latest
     steps:
       - name: New step
         run: echo "Hello World"
   ```

2. **Modify schedules:**
   ```yaml
   schedule:
     - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
   ```

3. **Add new triggers:**
   ```yaml
   on:
     push:
       branches: [ main, develop, feature/* ]
   ```

### Environment Customization

- Modify Node.js versions
- Add new test environments
- Configure different npm registries
- Add custom environment variables

## 📚 Best Practices

1. **Always test locally** before pushing
2. **Use semantic versioning** for releases
3. **Review security reports** regularly
4. **Monitor performance metrics** for regressions
5. **Keep dependencies updated** for security
6. **Use dry-run** for testing publishing
7. **Document breaking changes** in releases
8. **Review automated PRs** before merging

## 🆘 Support

For issues with the automation:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs for errors
3. Create an issue in the repository
4. Contact the maintainers

## 📝 Changelog

The automation automatically generates changelogs from:
- Git commit messages
- Pull request titles
- Issue references
- Conventional commit format

Example changelog format:
```markdown
## What's Changed

- feat: add new tool for analysis dispatch
- fix: resolve configuration loading issue
- docs: update installation instructions

**Full Changelog**: https://github.com/autonomous-testing/wopee-mcp/compare/v1.0.0...v1.1.0
```
