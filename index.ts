import { AwsServerlessUniqueEventAggregatorStack } from "./stacks/aws-serverless-unique-event-aggregator";

const PROJECT_NAMESPACE = "pcdk";

const aggregatorStack = new AwsServerlessUniqueEventAggregatorStack(`${PROJECT_NAMESPACE}-aggregator`);
