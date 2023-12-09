class TestResetPassword:
    def test_reset_password_by_email(self, client):
        payload = {"email": "tavolo.trentino@gmail.com"}
        result = client.post("/reset_password/", payload)
        assert result.data["email"] == "tavolo.trentino@gmail.com"

    def test_reset_password_by_invalid_email(self, client, random_mail):
        payload = {"email": random_mail}
        result = client.post("/reset_password/", payload)
        assert result.data == "error: EMAIL_NOT_FOUND"
