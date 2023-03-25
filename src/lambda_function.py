import os
import logging
from aws_lambda_powertools.utilities.data_classes import (
    EventBridgeEvent,
    event_source,
)
from alpaca.trading.client import TradingClient
from alpaca_helpers import is_market_open, buy
import boto3

from utils.environment import EnvironmentVariables, assert_runtime_environment
from utils.logging import configure_logging


required_env_vars = [
    EnvironmentVariables.API_KEY_SECRET_NAME,
    EnvironmentVariables.SECRET_KEY_SECRET_NAME,
    EnvironmentVariables.BUY_AMOUNT_USD,
    EnvironmentVariables.BUY_SYMBOL
]

configure_logging(logging.INFO)

logger = logging.getLogger(__name__)

def get_secret(secret_name):
    client_secrets = boto3.client('secretsmanager')

    response = client_secrets.get_secret_value(
            SecretId=secret_name
    )
    
    return response['SecretString']


@event_source(data_class=EventBridgeEvent)
def lambda_handler(event: EventBridgeEvent, context):

    env = dict(os.environ)
    assert_runtime_environment(env, required_env_vars)

    api_key = get_secret(env[EnvironmentVariables.API_KEY_SECRET_NAME])
    secret_key = get_secret(env[EnvironmentVariables.SECRET_KEY_SECRET_NAME])
    client = TradingClient(
        api_key,
        secret_key,
        paper=False
    )
    buy_symbol = env[EnvironmentVariables.BUY_SYMBOL]
    qty_usd = env[EnvironmentVariables.BUY_AMOUNT_USD]
    run_buy_flow(client, buy_symbol, qty_usd)

    return {
        "status_code": 202
    }


def run_buy_flow(client, buy_symbol, qty_usd):
    if not is_market_open(client):
        logger.info("market is closed, exiting...")
        return

    logger.info(f"Submitting request to buy ${buy_symbol} of {qty_usd}")

    buy(
        client=client,
        symbol=buy_symbol,
        qty=qty_usd
    )


