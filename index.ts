import { AwsServerlessUniqueEventAggregatorStack } from "./stacks/aws-serverless-unique-event-aggregator";
import { S3NotificationsStack } from "./stacks/s3-notifications-stack";

const PROJECT_NAMESPACE = "pcdk";

const aggregatorStack = new AwsServerlessUniqueEventAggregatorStack(`${PROJECT_NAMESPACE}-aggregator`);
const s3NotificationsStack = new S3NotificationsStack(`${PROJECT_NAMESPACE}-s3-notifications`);
