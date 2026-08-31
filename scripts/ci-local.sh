#!/bin/bash

# Local CI validation script
# Run this before pushing to ensure CI will pass

set -e

echo "🔍 Running local CI checks..."
echo ""

# Lint
echo "📝 Running lint..."
npm run lint
echo "✅ Lint passed"
echo ""

# Build
echo "🔨 Running build..."
npm run build
echo "✅ Build passed"
echo ""

# Test
echo "🧪 Running tests..."
npm test
echo "✅ Tests passed"
echo ""

# CLI verification
echo "🖥️  Verifying CLI..."
node dist/cli/index.js --version
node dist/cli/index.js --help > /dev/null
echo "✅ CLI verification passed"
echo ""

echo "✨ All local CI checks passed!"
echo "You can safely push your changes."
