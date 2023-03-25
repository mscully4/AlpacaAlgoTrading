from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

import logging

logger = logging.getLogger(__name__)

def is_market_open(client: TradingClient):
    '''
    A function for checking whether markets are open
    '''
    return client.get_clock().is_open

def buy(client: TradingClient, symbol: str, qty_usd: float, time_in_force: TimeInForce = TimeInForce.DAY, **kwargs):
    '''
    A function for buying a certain dollar amount of a stock
    '''
    market_order_data = MarketOrderRequest(
        symbol=symbol,
        qty=qty_usd,
        side=OrderSide.BUY,
        time_in_force=time_in_force,
        **kwargs)

    market_order = client.submit_order(
        order_data=market_order_data)

    logger.info(f"Order response: {market_order}")

