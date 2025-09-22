#!/bin/bash

# Wopee MCP Package Validation Script
# This script runs comprehensive validation checks before publishing

set -e  # Exit on any error

echo "🔍 Running Wopee MCP package validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to run a check and report result
run_check() {
    local check_name="$1"
    local command="$2"
    
    print_status "Running $check_name..."
    
    if eval "$command" > /dev/null 2>&1; then
        print_success "$check_name passed"
        return 0
    else
        print_error "$check_name failed"
        return 1
    fi
}

# Track overall success
OVERALL_SUCCESS=true

# 1. Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    print_success "Node.js version $NODE_VERSION is compatible (>= $REQUIRED_VERSION)"
else
    print_error "Node.js version $NODE_VERSION is too old. Required: >= $REQUIRED_VERSION"
    OVERALL_SUCCESS=false
fi

# 2. Check npm version
print_status "Checking npm version..."
NPM_VERSION=$(npm --version)
REQUIRED_NPM_VERSION="8.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" = "$REQUIRED_NPM_VERSION" ]; then
    print_success "npm version $NPM_VERSION is compatible (>= $REQUIRED_NPM_VERSION)"
else
    print_error "npm version $NPM_VERSION is too old. Required: >= $REQUIRED_NPM_VERSION"
    OVERALL_SUCCESS=false
fi

# 3. Install dependencies
print_status "Installing dependencies..."
if npm ci --silent; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    OVERALL_SUCCESS=false
fi

# 4. Run linting
if ! run_check "ESLint" "npm run lint"; then
    OVERALL_SUCCESS=false
fi

# 5. Run tests
if ! run_check "Jest tests" "npm test"; then
    OVERALL_SUCCESS=false
fi

# 6. Build the project
if ! run_check "TypeScript build" "npm run build"; then
    OVERALL_SUCCESS=false
fi

# 7. Check if dist directory exists and has content
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    print_success "Build output directory exists and contains files"
else
    print_error "Build output directory is missing or empty"
    OVERALL_SUCCESS=false
fi

# 8. Check package.json validity
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" > /dev/null 2>&1; then
    print_success "package.json is valid JSON"
else
    print_error "package.json contains invalid JSON"
    OVERALL_SUCCESS=false
fi

# 9. Check required files exist
REQUIRED_FILES=("README.md" "LICENSE" "env.example")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Required file exists: $file"
    else
        print_error "Required file missing: $file"
        OVERALL_SUCCESS=false
    fi
done

# 10. Check package size (warn if too large)
PACKAGE_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
print_status "Package size: $PACKAGE_SIZE"

# 11. Run npm pack to test package creation
print_status "Testing package creation with 'npm pack'..."
if npm pack --dry-run > /dev/null 2>&1; then
    print_success "Package creation test passed"
else
    print_error "Package creation test failed"
    OVERALL_SUCCESS=false
fi

# 12. Check for security vulnerabilities
print_status "Checking for security vulnerabilities..."
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Run 'npm audit' for details."
fi

# Final result
echo ""
if [ "$OVERALL_SUCCESS" = true ]; then
    print_success "🎉 All validation checks passed! Package is ready for publishing."
    exit 0
else
    print_error "❌ Some validation checks failed. Please fix the issues before publishing."
    exit 1
fi
