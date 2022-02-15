#!/bin/bash

echo "VERCEL_GIT_COMMIT_AUTHOR_LOGIN: $VERCEL_GIT_COMMIT_AUTHOR_LOGIN"

if [[ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" == "renovate-bot"]] ; then
  # Proceed with the build
    echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Renovate Build cancelled"
  exit 0;
fi
