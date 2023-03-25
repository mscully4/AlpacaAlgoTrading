import { Stack, StackProps } from "aws-cdk-lib";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface TwilioSecrets {
  accountSidSecret: ISecret;
  authTokenSecret: ISecret;
  fromPhoneNumberSecret: ISecret;
  toPhoneNumberSecret: ISecret;
}

export class NotificationStack extends Stack {
  public twilioSecrets: TwilioSecrets;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.twilioSecrets = {
      accountSidSecret: new Secret(this, "TwilioAccountSID"),
      authTokenSecret: new Secret(this, "TwilioAuthToken"),
      fromPhoneNumberSecret: new Secret(this, "TwilioFromPhoneNumber"),
      toPhoneNumberSecret: new Secret(this, "TwilioToPhoneNumber"),
    };
  }
}
