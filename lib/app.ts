#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { AlpacaStack } from "./stacks/alpaca-stack";

const ACCOUNT_NO = "735029168602";
const REGION = "us-east-2";

const app = new App();

new AlpacaStack(app, `AlpacaStack-${ACCOUNT_NO}-${REGION}`, {
  env: {
    account: ACCOUNT_NO,
    region: REGION,
  },
});

app.synth();
