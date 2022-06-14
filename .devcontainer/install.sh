#!/usr/bin/env bash

curl -fsSL https://get.pulumi.com | bash

source $NVM_DIR/nvm.sh
nvm install
nvm use

yarn
