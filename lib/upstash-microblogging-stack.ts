import * as path from "path";
import { Stack, StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class UpstashMicrobloggingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new apigateway.LambdaRestApi(this, "MyApi", {
      handler: new lambda.Function(this, "MyFunction", {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "backend")),
        environment: {
          REDIS_ENDPOINT: "<DATABASE_ENDPOINT>",
          REDIS_PORT: "<DATABASE_PORT>",
          REDIS_PASSWORD: "<DATABASE_PASSWORD>",
        },
      }),
    });
  }
}
