from typing import Mapping
import dataclasses
import os


def _get_default_or_mapping_item(
    field: dataclasses.Field, mapping: Mapping[str, str]
) -> str:
    if field.default is not dataclasses.MISSING and field.name.upper() not in mapping:
        return field.default

    return field.type(mapping[field.name.upper()])


@dataclasses.dataclass
class EnvironmentConfig:
    api_key_secret_name: str
    secret_key_secret_name: str
    buy_amount_usd: str
    buy_symbol: str
    twilio_account_sid_secret_name: str
    twilio_auth_token_secret_name: str
    twilio_from_phone_number_secret_name: str
    twilio_to_phone_number_secret_name: str
    function_handler: str

    @classmethod
    def from_environment(cls, env: Mapping[str, str] = os.environ):
        kwargs = {
            field.name: _get_default_or_mapping_item(field, env)
            for field in dataclasses.fields(cls)
        }
        return cls(**kwargs)


if __name__ == "__main__":
    config = EnvironmentConfig.from_environment()
    print(config)
