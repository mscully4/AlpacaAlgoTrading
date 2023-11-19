#! /bin/bash

set e

echo "Running Black"
black ./src --check
printf "\n"

echo "Running Flake8"
flake8 ./src
printf "\n"

echo "Running Mypy"
mypy ./src