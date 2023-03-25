from typing import Dict, List

class EnvironmentVariables:
    API_KEY_SECRET_NAME = "API_KEY_SECRET_NAME"
    SECRET_KEY_SECRET_NAME = "SECRET_KEY_SECRET_NAME"
    BUY_AMOUNT_USD = "BUY_AMOUNT_USD"
    BUY_SYMBOL = "BUY_SYMBOL"


def assert_runtime_environment(env: Dict[str, str], required_env_vars: List[str]):
    for env_var in required_env_vars:
        if env_var not in env:
            raise KeyError(f"Environment variable {env_var} does not exist")