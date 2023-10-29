import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { CronOptions, Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import {
  DockerImageCode,
  DockerImageFunction,
  IFunction,
} from "aws-cdk-lib/aws-lambda";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { TwilioSecrets } from "./notification-stack";

interface AlpacaSecrets {
  apiKeySecret: ISecret;
  secretKeySecret: ISecret;
}

export interface AlpacaStackProps extends StackProps {
  twilioSecrets: TwilioSecrets;
}

export class AlpacaStack extends Stack {
  private code: DockerImageCode;
  constructor(scope: Construct, id: string, props: AlpacaStackProps) {
    super(scope, id, props);

    const alpacaSecrets: AlpacaSecrets = {
      apiKeySecret: new Secret(this, "AlpacaApiKey"),
      secretKeySecret: new Secret(this, "AlpacaSecretKey"),
    };

    this.code = DockerImageCode.fromImageAsset("./", {});

    const buyVOOFunction = this.createBuyFunction(
      "VOO",
      25,
      alpacaSecrets,
      props.twilioSecrets
    );

    this.createFunctionInvocationRule("Buy-VOO-Rule", buyVOOFunction, {
      minute: "0",
      hour: "17",
      weekDay: "2-6",
      month: "*",
      year: "*",
    });

    const buyBTCFunction = this.createBuyFunction(
      "BTC/USD",
      10,
      alpacaSecrets,
      props.twilioSecrets
    );

    this.createFunctionInvocationRule("Buy-BTC-Rule", buyBTCFunction, {
      minute: "0",
      hour: "17",
      weekDay: "*",
      month: "*",
      year: "*",
    });
  }

  private createBuyFunction(
    symbol: string,
    buyAmountUsd: number,
    alpacaSecrets: AlpacaSecrets,
    twilioSecrets: TwilioSecrets,
    checkIfMarketsAreOpen: boolean = false
  ) {
    const functionName = `Buy-${symbol.replace("/", "-")}-Function`;
    // new DockerImageFunction
    const func = new DockerImageFunction(this, functionName, {
      functionName: functionName,
      memorySize: 1024,
      timeout: Duration.minutes(2),
      code: this.code,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        BUY_AMOUNT_USD: buyAmountUsd.toString(),
        BUY_SYMBOL: symbol,
        API_KEY_SECRET_NAME: alpacaSecrets.apiKeySecret.secretName,
        SECRET_KEY_SECRET_NAME: alpacaSecrets.secretKeySecret.secretName,
        TWILIO_ACCOUNT_SID_SECRET_NAME:
          twilioSecrets.accountSidSecret.secretName,
        TWILIO_AUTH_TOKEN_SECRET_NAME: twilioSecrets.authTokenSecret.secretName,
        TWILIO_FROM_PHONE_NUMBER_SECRET_NAME:
          twilioSecrets.fromPhoneNumberSecret.secretName,
        TWILIO_TO_PHONE_NUMBER_SECRET_NAME:
          twilioSecrets.toPhoneNumberSecret.secretName,
        CHECK_IF_MARKETS_ARE_OPEN: `${checkIfMarketsAreOpen}`,
      },
    });

    // Allow the function to read the secrets
    Object.values(alpacaSecrets).forEach((secret: ISecret) => {
      secret.grantRead(func.role!);
    });

    Object.values(twilioSecrets).forEach((secret: ISecret) => {
      secret.grantRead(func.role!);
    });

    return func;
  }

  private createFunctionInvocationRule(
    ruleName: string,
    lambdaFunction: IFunction,
    cronExpression: CronOptions
  ) {
    const eventTarget = new LambdaFunction(lambdaFunction, {});

    new Rule(this, ruleName, {
      ruleName: ruleName,
      schedule: Schedule.cron(cronExpression),
      targets: [eventTarget],
    });
  }
}
