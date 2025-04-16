#!/bin/bash

# API Base URL
API_URL="http://localhost:3000/api"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Task Management API${NC}"
echo "=============================="

# Test server health
echo -e "\n${YELLOW}Testing server health${NC}"
curl -s http://localhost:3000/ | jq

# Test user registration
echo -e "\n${YELLOW}Testing user registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"testuser", "password":"password123"}' $API_URL/auth/register)
echo $REGISTER_RESPONSE | jq

# Extract token from registration response
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token from registration${NC}"
  
  # Try login instead
  echo -e "\n${YELLOW}Testing user login${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"testuser", "password":"password123"}' $API_URL/auth/login)
  echo $LOGIN_RESPONSE | jq
  
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
  
  if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get token from login${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Got auth token: $TOKEN${NC}"

# Test creating a task
echo -e "\n${YELLOW}Testing task creation${NC}"
CREATE_TASK_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Test Task", "description":"This is a test task"}' $API_URL/tasks)
echo $CREATE_TASK_RESPONSE | jq

# Extract task ID
TASK_ID=$(echo $CREATE_TASK_RESPONSE | jq -r '.task.id')

if [ "$TASK_ID" == "null" ] || [ -z "$TASK_ID" ]; then
  echo -e "${RED}Failed to get task ID${NC}"
  exit 1
fi

echo -e "${GREEN}Created task with ID: $TASK_ID${NC}"

# Test fetching all tasks
echo -e "\n${YELLOW}Testing fetch all tasks${NC}"
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/tasks | jq

# Test updating a task
echo -e "\n${YELLOW}Testing task update${NC}"
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Updated Task", "status":"completed"}' $API_URL/tasks/$TASK_ID | jq

# Test fetching the updated task
echo -e "\n${YELLOW}Testing fetch updated task${NC}"
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/tasks/$TASK_ID | jq

# Test deleting a task
echo -e "\n${YELLOW}Testing task deletion${NC}"
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" $API_URL/tasks/$TASK_ID | jq

# Test that the task is deleted
echo -e "\n${YELLOW}Verifying task is deleted${NC}"
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/tasks/$TASK_ID | jq

echo -e "\n${GREEN}API Test completed${NC}" 