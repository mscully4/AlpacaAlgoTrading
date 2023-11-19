import logging

from alpaca.trading.client import TradingClient
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.trading.requests import MarketOrderRequest

logger = logging.getLogger(__name__)


class AlpacaClientWrapper:
    def __init__(self, client: TradingClient):
        self._client = client

    def is_market_open(self):
        """
        A method for checking whether markets are open
        """
        return self._client.get_clock().is_open

    def buy(
        self,
        symbol: str,
        dollar_amount: str,
        time_in_force: TimeInForce = TimeInForce.DAY,
    ):
        """
        A method for buying a certain dollar amount of a stock
        """
        logger.info(f"Submitting order to buy ${dollar_amount} of {symbol}")
        market_order_data = MarketOrderRequest(
            symbol=symbol,
            notional=dollar_amount,
            side=OrderSide.BUY,
            time_in_force=time_in_force,
        )

        market_order = self._client.submit_order(order_data=market_order_data)

        logger.info(f"Order response: {market_order}")
