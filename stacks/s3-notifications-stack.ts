import { Stack, StackOptions } from "@pulumi/cdk";

import { EventType } from "aws-cdk-lib/aws-s3";
import { SnsDestination } from "aws-cdk-lib/aws-s3-notifications";

import { DefaultBucket } from "./constructs/s3";
import { DefaultTopic } from "./constructs/sns";

export class S3NotificationsStack extends Stack {
	constructor(id: string, options?: StackOptions) {
		super(id, options);

		const inputBucket = new DefaultBucket(this, `${id}-input-bucket`);
		const inputBucketTopic = new DefaultTopic(this, `${id}-input-bucket-notifications`);

		// This doesn't work - "Error: expected three parts in type Custom,S3BucketNotifications"
		// (Requires https://github.com/pulumi/pulumi-cdk/issues/109)
		// inputBucket.addEventNotification(EventType.OBJECT_CREATED, new SnsDestination(inputBucketTopic));

		// Finalize the stack and deploy its resources.
		this.synth();
	}
}
