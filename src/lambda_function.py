import logging
import boto3
from alpaca.trading.client import TradingClient
from aws_lambda_powertools.utilities.data_classes import EventBridgeEvent, event_source
from twilio.rest import Client as TwilioClient
from alpaca.trading.enums import TimeInForce
from utils.boto3.secrets import get_secret

from utils.alpaca_client_wrapper import AlpacaClientWrapper
from utils.environment import EnvironmentConfig
from utils.logging import configure_logging
from flows.buy_flow import run_buy_flow
from utils.twilio_wrapper import TwilioClientWrapper

configure_logging(logging.INFO)

logger = logging.getLogger(__name__)


@event_source(data_class=EventBridgeEvent)
def lambda_handler(event: EventBridgeEvent, context):

    env_config = EnvironmentConfig.from_environment()

    session = boto3.Session()

    # Retrieve credentials stored in SecretsManager
    api_key = get_secret(session, env_config.api_key_secret_name)
    secret_key = get_secret(session, env_config.secret_key_secret_name)

    # Generate the Alpaca Client Wrapper
    alpaca_client = TradingClient(api_key, secret_key, paper=False)
    alpaca_wrapper = AlpacaClientWrapper(client=alpaca_client)

    twilio_account_sid = get_secret(session, env_config.twilio_account_sid_secret_name)
    twilio_auth_token = get_secret(session, env_config.twilio_auth_token_secret_name)
    to_phone_number = get_secret(session, env_config.twilio_to_phone_number_secret_name)
    from_phone_number = get_secret(
        session, env_config.twilio_from_phone_number_secret_name
    )

    twilio_client = TwilioClient(twilio_account_sid, twilio_auth_token)
    twilio_wrapper = TwilioClientWrapper(
        twilio_client, from_phone_number, to_phone_number
    )

    # Buy some stonks
    if env_config.function_handler == "US_EQUITY":
        run_buy_flow(
            alpaca_wrapper,
            twilio_wrapper,
            env_config.buy_symbol,
            env_config.buy_amount_usd,
            TimeInForce.DAY,
            check_if_markets_are_open=True,
        )
        return

    if env_config.function_handler == "CRYPTO":
        run_buy_flow(
            alpaca_wrapper,
            twilio_wrapper,
            env_config.buy_symbol,
            env_config.buy_amount_usd,
            TimeInForce.GTC,
        )
        return
