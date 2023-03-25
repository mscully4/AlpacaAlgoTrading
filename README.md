# What is this project?

This project contains the code and infrastructure for performing automated trading using the Alpaca API.

A lambda function is triggered every day via a CloudEvent rule, and it checks via the Alpaca API whether trading is active for the day and if so performs a trade.

## Where is the code located?

Python: /src

CDK: /lib

Docker: ./Dockerfile

## Build commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
