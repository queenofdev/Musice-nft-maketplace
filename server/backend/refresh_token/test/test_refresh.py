class TestSignUp:
    def test_sign_up(self, client, random_mail):
        payload = {"email": random_mail, "password": "111111111"}
        result = client.post("/signUp/", payload)
        assert len(result.data["idToken"]) == 905

    def test_failed_sign_up_same_mail(self, client, random_mail):
        payload = {"email": random_mail, "password": "111111111"}
        result = client.post("/signUp/", payload)
        result = client.post("/signUp/", payload)
        assert result.data == "error: EMAIL_EXISTS"

    def test_failed_sign_up_with_no_mail(self, client):
        payload = {"email": "", "password": "111111111"}
        result = client.post("/signUp/", payload)
        assert result.data == "error: MISSING_EMAIL"

    def test_failed_sign_up_short_pasword(self, client, random_mail):
        payload = {"email": random_mail, "password": "11"}
        result = client.post("/signUp/", payload)
        assert (
            result.data
            == "error: WEAK_PASSWORD : Password should be at least 6 characters"
        )

