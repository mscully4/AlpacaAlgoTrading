import boto3


def get_secret(session: boto3.Session, secret_name: str):
    client_secrets = session.client("secretsmanager")

    response = client_secrets.get_secret_value(SecretId=secret_name)

    return response["SecretString"]
