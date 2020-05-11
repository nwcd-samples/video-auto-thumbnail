import json
import boto3
import os

role_to_assume_arn = os.environ['role_to_assume_arn']

def handler(event, context):
    sts = boto3.client('sts')
    response = sts.assume_role(
        RoleArn=role_to_assume_arn,
        RoleSessionName='test_session'
    )

    credentials = response['Credentials']
    credentials["Expiration"] = ""

    # print('request: {}'.format(json.dumps(event)))
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': credentials
    }
