import logging

from utils.alpaca_client_wrapper import AlpacaClientWrapper
from alpaca.trading.enums import TimeInForce

from utils.twilio_wrapper import TwilioClientWrapper

logger = logging.getLogger(__name__)


def run_buy_flow(
    wrapper: AlpacaClientWrapper,
    twilio_wrapper: TwilioClientWrapper,
    buy_symbol: str,
    buy_amount_usd: str,
    time_in_force: TimeInForce,
    check_if_markets_are_open: bool = False,
):
    if check_if_markets_are_open and not wrapper.is_market_open():
        twilio_wrapper.send_sms_message(
            msg="Market is closed, didn't buy anything",
        )
        logger.info("market is closed, exiting...")
        return

    # Crypto orders need a TIF of GTC, while stocks need DAY. Crypto symbols will have a '/'
    # in them so use that to differentiate
    # time_in_force = TimeInForce.GTC if "/" in buy_symbol else TimeInForce.DAY

    logger.info(f"Submitting request to buy ${buy_amount_usd} of {buy_symbol}")
    try:
        wrapper.buy(
            symbol=buy_symbol, dollar_amount=buy_amount_usd, time_in_force=time_in_force
        )

        twilio_wrapper.send_sms_message(
            msg=f"Bought ${buy_amount_usd} of {buy_symbol}",
        )
    except Exception:
        logger.exception("Encountered exception when buying: ")
        twilio_wrapper.send_sms_message(
            msg=f"Failed to buy ${buy_amount_usd} of {buy_symbol}",
        )
