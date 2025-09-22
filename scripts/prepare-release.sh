#!/bin/bash

# Wopee MCP Release Preparation Script
# This script prepares the package for release by running all necessary checks

set -e  # Exit on any error

echo "📦 Preparing Wopee MCP package for release..."

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

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Run validation script
print_status "Running validation checks..."
if ./scripts/validate.sh; then
    print_success "Validation completed successfully"
else
    print_error "Validation failed. Please fix the issues before proceeding."
    exit 1
fi

# Clean and build
print_status "Cleaning and building package..."
npm run build:clean

# Run tests with coverage
print_status "Running tests with coverage..."
npm run test:coverage

# Check if we're in a git repository
if [ -d ".git" ]; then
    print_status "Checking git status..."
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "There are uncommitted changes in the repository."
        echo "Uncommitted files:"
        git status --porcelain
        echo ""
        read -p "Do you want to commit these changes? (y/N): " commit_changes
        
        if [[ $commit_changes =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_message
            git add .
            git commit -m "$commit_message"
            print_success "Changes committed"
        else
            print_warning "Skipping commit. Make sure to commit changes before publishing."
        fi
    else
        print_success "No uncommitted changes found"
    fi
    
    # Check if we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        print_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
        read -p "Do you want to switch to main branch? (y/N): " switch_branch
        
        if [[ $switch_branch =~ ^[Yy]$ ]]; then
            git checkout main
            print_success "Switched to main branch"
        fi
    else
        print_success "On main branch"
    fi
else
    print_warning "Not in a git repository. Skipping git checks."
fi

# Create a summary of what will be published
print_status "Package contents summary:"
echo "Files to be published:"
npm pack --dry-run 2>/dev/null | grep -E "^\s*[0-9]" | head -20

echo ""
print_success "🎉 Release preparation completed!"
print_status "Next steps:"
echo "1. Review the package contents above"
echo "2. Run './scripts/publish.sh' to publish the package"
echo "3. Or run 'npm run publish:dry-run' to test the publishing process"

# Ask if user wants to run dry-run
echo ""
read -p "Do you want to run a dry-run now? (y/N): " run_dry_run

if [[ $run_dry_run =~ ^[Yy]$ ]]; then
    print_status "Running dry-run..."
    npm run publish:dry-run
    print_success "Dry-run completed!"
fi
