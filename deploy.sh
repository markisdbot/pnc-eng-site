#!/bin/bash
#
# Deploy script for P&C Engineering Knowledge Base & Tools Site
# Usage: ./deploy.sh
#

set -e  # Exit on any error

# Configuration
DEPLOY_PATH="/var/www/pnc-eng-site"
NGINX_SERVICE="nginx"
LOCAL_DIST="./dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Build the site
log_info "Building the site..."
npm run build

if [ ! -d "$LOCAL_DIST" ]; then
    log_error "Build failed: dist/ directory not found"
    exit 1
fi

log_info "Build successful!"

# Step 2: Ensure deploy directory exists
log_info "Ensuring deploy directory exists..."
mkdir -p "${DEPLOY_PATH}"

# Step 3: Deploy files using rsync locally
log_info "Deploying files to ${DEPLOY_PATH}..."
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    "${LOCAL_DIST}/" \
    "${DEPLOY_PATH}/"

if [ $? -ne 0 ]; then
    log_error "Deployment failed during rsync"
    exit 1
fi

log_info "Files deployed successfully!"

# Step 4: Set proper permissions
chmod -R 755 "${DEPLOY_PATH}"

log_info "Deployment complete!"
log_info "Site should be accessible at: http://192.168.0.110:8081"
