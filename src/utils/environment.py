from typing import Dict, List


class EnvironmentVariables:
    API_KEY_SECRET_NAME = "API_KEY_SECRET_NAME"
    SECRET_KEY_SECRET_NAME = "SECRET_KEY_SECRET_NAME"
    BUY_AMOUNT_USD = "BUY_AMOUNT_USD"
    BUY_SYMBOL = "BUY_SYMBOL"
    TWILIO_ACCOUNT_SID_SECRET_NAME = "TWILIO_ACCOUNT_SID_SECRET_NAME"
    TWILIO_AUTH_TOKEN_SECRET_NAME = "TWILIO_AUTH_TOKEN_SECRET_NAME"
    TWILIO_FROM_PHONE_NUMBER_SECRET_NAME = "TWILIO_FROM_PHONE_NUMBER_SECRET_NAME"
    TWILIO_TO_PHONE_NUMBER_SECRET_NAME = "TWILIO_TO_PHONE_NUMBER_SECRET_NAME"


def assert_runtime_environment(env: Dict[str, str], required_env_vars: List[str]):
    for env_var in required_env_vars:
        if env_var not in env:
            raise KeyError(f"Environment variable {env_var} does not exist")
