#!/bin/bash

# Test script for unverified email cleanup endpoint
# Usage: ./test-cleanup.sh [your-cron-secret]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get CRON_SECRET from argument or .env file
if [ -n "$1" ]; then
    CRON_SECRET="$1"
else
    # Try to read from .env file
    if [ -f .env ]; then
        CRON_SECRET=$(grep CRON_SECRET .env | cut -d '=' -f2)
    fi
fi

if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}Error: CRON_SECRET not provided${NC}"
    echo "Usage: ./test-cleanup.sh [your-cron-secret]"
    echo "Or set CRON_SECRET in your .env file"
    exit 1
fi

# API endpoint
API_URL="http://localhost:3000/api/cron/cleanup-unverified-users"

echo -e "${YELLOW}Testing Unverified Email Cleanup Endpoint${NC}"
echo "=========================================="
echo ""
echo "Endpoint: $API_URL"
echo "Using CRON_SECRET: ${CRON_SECRET:0:10}..."
echo ""

# Make the request
echo -e "${YELLOW}Sending request...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "HTTP Status: $HTTP_CODE"
echo ""

# Check response
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Failed!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""
echo "=========================================="
