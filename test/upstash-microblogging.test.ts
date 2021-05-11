import * as cdk from 'aws-cdk-lib';
import * as UpstashMicroblogging from '../lib/upstash-microblogging-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new UpstashMicroblogging.UpstashMicrobloggingStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
