import { Bucket, BucketProps, BlockPublicAccess, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class DefaultBucket extends Bucket {
	constructor(scope: Construct, id: string, props?: BucketProps) {
		super(scope, id, {
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			bucketName: id,
			encryption: BucketEncryption.S3_MANAGED,
			enforceSSL: true,
			versioned: true,
			...props,
		});
	}
}
