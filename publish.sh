#!/usr/bin/env bash

npm run build && (
  cd built && npm publish
) && npm run clean
