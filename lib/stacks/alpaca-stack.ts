import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { TwilioSecrets } from "./notification-stack";

export interface AlpacaStackProps extends StackProps {
  twilioSecrets: TwilioSecrets;
}

export class AlpacaStack extends Stack {
  constructor(scope: Construct, id: string, props: AlpacaStackProps) {
    super(scope, id, props);

    const apiKeySecret = new Secret(this, "AlpacaApiKey");
    const secretKeySecret = new Secret(this, "AlpacaSecretKey");

    const dockerImage = DockerImageCode.fromImageAsset("./", {});

    // new DockerImageFunction
    const alpacaFunction = new DockerImageFunction(this, "Function", {
      memorySize: 1024,
      timeout: Duration.minutes(2),
      code: dockerImage,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        BUY_AMOUNT_USD: "20",
        BUY_SYMBOL: "VOO",
        API_KEY_SECRET_NAME: apiKeySecret.secretName,
        SECRET_KEY_SECRET_NAME: secretKeySecret.secretName,
        TWILIO_ACCOUNT_SID_SECRET_NAME:
          props.twilioSecrets.accountSidSecret.secretName,
        TWILIO_AUTH_TOKEN_SECRET_NAME:
          props.twilioSecrets.authTokenSecret.secretName,
        TWILIO_FROM_PHONE_NUMBER_SECRET_NAME:
          props.twilioSecrets.fromPhoneNumberSecret.secretName,
        TWILIO_TO_PHONE_NUMBER_SECRET_NAME:
          props.twilioSecrets.toPhoneNumberSecret.secretName,
      },
    });

    const secrets: Secret[] = [apiKeySecret, secretKeySecret].concat(
      Object.values(props.twilioSecrets)
    );

    secrets.forEach((secret) => secret.grantRead(alpacaFunction.role!));

    const eventTarget = new LambdaFunction(alpacaFunction, {});

    new Rule(this, "dca-rule", {
      schedule: Schedule.cron({
        minute: "0",
        hour: "17",
        weekDay: "2-6",
        month: "*",
        year: "*",
      }),
      targets: [eventTarget],
    });
  }
}
