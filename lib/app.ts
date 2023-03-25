#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { AlpacaStack } from "./stacks/alpaca-stack";
import { NotificationStack } from "./stacks/notification-stack";

const ACCOUNT_NO = "735029168602";
const REGION = "us-east-2";

const app = new App();

const notificationStack = new NotificationStack(
  app,
  `NotificationStack-${ACCOUNT_NO}-${REGION}`,
  {
    env: {
      account: ACCOUNT_NO,
      region: REGION,
    },
  }
);

new AlpacaStack(app, `AlpacaStack-${ACCOUNT_NO}-${REGION}`, {
  env: {
    account: ACCOUNT_NO,
    region: REGION,
  },
  twilioSecrets: notificationStack.twilioSecrets,
});

app.synth();
