#!/bin/bash

# Simple Stress Test Script for Patient Registration
# Requirements: Patient Service running on port 8081

URL="http://localhost:8081/api/v1/patients"
CONCURRENT_REQUESTS=10
TOTAL_REQUESTS=100

echo "Starting stress test on $URL with $TOTAL_REQUESTS total requests ($CONCURRENT_REQUESTS concurrent)..."

for i in $(seq 1 $TOTAL_REQUESTS); do
  curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"TestUser_$i\",
      \"lastName\": \"StressTest\",
      \"email\": \"test_$i@hospital.com\",
      \"dateOfBirth\": \"1990-01-01\"
    }" > /dev/null &

  if (( $i % $CONCURRENT_REQUESTS == 0 )); then
    wait
  fi
done

wait
echo "Stress test complete."
