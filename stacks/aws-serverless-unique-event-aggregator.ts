import path = require("path");
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Stack, StackOptions } from "@pulumi/cdk";

export class AwsServerlessUniqueEventAggregatorStack extends Stack {
	constructor(id: string, options?: StackOptions) {
		super(id, options);

		const inputQueue = new Queue(this, `${id}-input-queue`, {
			visibilityTimeout: Duration.minutes(10),
			retentionPeriod: Duration.days(14),
			queueName: `${id}-input-queue`,
		});

		const batchQueue = new Queue(this, `${id}-batch-queue`, {
			visibilityTimeout: Duration.minutes(6),
			retentionPeriod: Duration.days(14),
			queueName: `${id}-batch-queue`,
		});

		const lockTable = new Table(this, `${id}-lock-table`, {
			partitionKey: {
				name: "messageId",
				type: AttributeType.STRING,
			},
			tableName: `${id}-lock-table`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			removalPolicy: RemovalPolicy.DESTROY,
		});
		const batchGsiName = "batchId-index";
		// This doesn't work - "TypeError: Cannot read properties of undefined (reading 'nonKeyAttributes')"
		/*		lockTable.addGlobalSecondaryIndex({
			indexName: batchGsiName,
			partitionKey: { name: "batchId", type: AttributeType.STRING },
		}); */

		const aggregatorFunction = new Function(this, `${id}-aggregator-lambda`, {
			runtime: Runtime.NODEJS_18_X,
			handler: "src/index.handler",
			code: Code.fromAsset(path.join(__dirname, "../src/aggregator-lambda/")),
			functionName: `${id}-aggregator-lambda`,
			environment: {
				DDB_LOCK_TABLE: lockTable.tableName,
				OUTPUT_SQS_URL: batchQueue.queueUrl,
			},
			memorySize: 128,
			timeout: Duration.minutes(1),
		});
		aggregatorFunction.addEventSource(
			new SqsEventSource(inputQueue, {
				batchSize: 10000,
				maxBatchingWindow: Duration.minutes(5),
				maxConcurrency: 2,
				reportBatchItemFailures: true,
			})
		);
		batchQueue.grantSendMessages(aggregatorFunction);
		lockTable.grantReadWriteData(aggregatorFunction);

		const batchProcessorFunction = new Function(this, `${id}-batch-processor-lambda`, {
			runtime: Runtime.NODEJS_18_X,
			handler: "src/index.handler",
			code: Code.fromAsset(path.join(__dirname, "../src/batch-processor-lambda/")),
			functionName: `${id}-batch-processor-lambda`,
			environment: {
				DDB_LOCK_TABLE: lockTable.tableName,
				DDB_BATCH_INDEX: batchGsiName,
			},
			memorySize: 1769,
			timeout: Duration.minutes(5),
		});
		batchProcessorFunction.addEventSource(
			new SqsEventSource(batchQueue, {
				batchSize: 1,
			})
		);
		lockTable.grantReadWriteData(batchProcessorFunction);

		// Finalize the stack and deploy its resources.
		this.synth();
	}
}
