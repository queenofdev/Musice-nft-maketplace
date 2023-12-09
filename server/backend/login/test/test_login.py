class TestLogin:
    def test_login(self, client, random_mail):
        email = random_mail
        payload = {"email": email, "password": "111111111"}
        result = client.post("/signUp/", payload)
        result = client.post("/login/", payload)
        assert result.data["email"] == email

    def test_wrong_mail(self, client):
        payload = {"email": "probarandom@gmal.com", "password": "111111111"}
        result = client.post("/login/", payload)
        assert result.data == "error: EMAIL_NOT_FOUND"

    def test_wrong_password(self, client, random_mail):
        email = random_mail
        payload = {"email": email, "password": "111111111"}
        result = client.post("/signUp/", payload)
        payload = {"email": email, "password": "umpahpah"}
        result = client.post("/login/", payload)
        assert result.data == "error: INVALID_PASSWORD"
