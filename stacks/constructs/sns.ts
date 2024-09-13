import { Topic, TopicProps } from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";

export class DefaultTopic extends Topic {
	constructor(scope: Construct, id: string, props?: TopicProps) {
		super(scope, id, {
			topicName: id,
			enforceSSL: true,
			...props,
		});
	}
}
