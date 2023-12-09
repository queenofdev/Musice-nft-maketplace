import logging
from datetime import date

# Smart contract interface logger config
logger = logging.getLogger("smart_contract_interface")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(levelname)s - %(name)s - %(asctime)s - %(message)s")
file_handler = logging.FileHandler(
    f"./logging/smart_contract_interface{date.today()}.log"
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

