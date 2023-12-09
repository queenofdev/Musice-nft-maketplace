import random
import string

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def random_mail():
    letters = string.ascii_lowercase
    random_string = "".join(random.choice(letters) for i in range(5))
    email = f"{random_string}@gmail.com"
    return email


@pytest.fixture
def client():
    client = APIClient()
    return client
