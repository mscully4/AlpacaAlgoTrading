import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Code, Function, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class AlpacaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const apiKeySecret = new Secret(this, "AlpacaApiKey");
    const secretKeySecret = new Secret(this, "AlpacaSecretKey");

    const apiLayer = new LayerVersion(this, "AlpacaLambdaLayer", {
      compatibleRuntimes: [Runtime.PYTHON_3_9, Runtime.PYTHON_3_8],
      code: Code.fromAsset("layers/alpaca/"),
    });

    const alpacaFunction = new Function(this, "Function", {
      runtime: Runtime.PYTHON_3_9,
      memorySize: 1024,
      timeout: Duration.minutes(2),
      code: Code.fromAsset("src/"),
      handler: "lambda_function.lambda_handler",
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        BUY_AMOUNT_USD: "10",
        BUY_SYMBOL: "VOO",
        API_KEY_SECRET_NAME: apiKeySecret.secretName,
        SECRET_KEY_SECRET_NAME: secretKeySecret.secretName,
      },
      layers: [apiLayer],
    });

    apiKeySecret.grantRead(alpacaFunction.role!);
    secretKeySecret.grantRead(alpacaFunction.role!);

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
