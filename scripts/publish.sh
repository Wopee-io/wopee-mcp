#!/bin/bash

# Wopee MCP Package Publishing Script
# This script handles the complete publishing workflow

set -e  # Exit on any error

echo "🚀 Starting Wopee MCP package publishing workflow..."

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

# Check if npm is logged in
if ! npm whoami > /dev/null 2>&1; then
    print_error "You must be logged in to npm. Run 'npm login' first."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for version bump type
echo ""
echo "Select version bump type:"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"
echo "3) major (1.0.0 -> 2.0.0)"
echo "4) custom"
echo "5) cancel"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version: " CUSTOM_VERSION
        VERSION_TYPE="$CUSTOM_VERSION"
        ;;
    5)
        print_warning "Publishing cancelled."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Run validation
print_status "Running validation checks..."
npm run validate

if [ $? -ne 0 ]; then
    print_error "Validation failed. Please fix the issues before publishing."
    exit 1
fi

print_success "Validation passed!"

# Run dry-run first
print_status "Running dry-run to check package contents..."
npm run publish:dry-run

echo ""
read -p "Does the dry-run look correct? (y/N): " confirm_dry_run

if [[ ! $confirm_dry_run =~ ^[Yy]$ ]]; then
    print_warning "Publishing cancelled after dry-run review."
    exit 0
fi

# Version and publish
if [ "$VERSION_TYPE" = "custom" ]; then
    print_status "Setting version to $CUSTOM_VERSION..."
    npm version "$CUSTOM_VERSION" --no-git-tag-version
else
    print_status "Bumping $VERSION_TYPE version..."
    npm version "$VERSION_TYPE" --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version updated to: $NEW_VERSION"

# Publish to npm
print_status "Publishing to npm..."
npm publish

if [ $? -eq 0 ]; then
    print_success "Package published successfully!"
    print_success "Version: $NEW_VERSION"
    print_success "Package: wopee-mcp@$NEW_VERSION"
    
    # Create git tag and push
    print_status "Creating git tag..."
    git add package.json package-lock.json
    git commit -m "chore: bump version to $NEW_VERSION"
    git tag "v$NEW_VERSION"
    git push origin main
    git push origin "v$NEW_VERSION"
    
    print_success "Git tag created and pushed: v$NEW_VERSION"
    
    echo ""
    print_success "🎉 Publishing workflow completed successfully!"
    print_status "Package is now available at: https://www.npmjs.com/package/wopee-mcp"
else
    print_error "Publishing failed!"
    exit 1
fi
