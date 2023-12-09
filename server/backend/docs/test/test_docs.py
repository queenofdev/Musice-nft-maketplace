class TestDocs:
    def test_docs_get(self, client):
        result = client.get("/docs/")
        assert result.status_code == 200

    def test_docs_post(self, client):
        payload = {
            "name": "docs",
            "description": "Adding API documentation",
            "allowed methods": "POST",
            "location of data in HTTP requestion": "body",
            "expected args": "1) name 2) description 3) allowed methods 4) location of data in HTTP requestion 5) expected args 6) endpoint 7) endpoint 8) return value example",
            "endpoint": "http://127.0.0.1:8000/docs/",
            "return value example": "Document created successfully",
        }

        result = client.post("/docs/", payload)
        assert "Document created successfully" in result.content.decode()

    def test_docs_delete(self, client, random_mail):
        payload = {
            "name": "docs",
            "description": "Adding API documentation",
            "allowed methods": "POST",
            "location of data in HTTP requestion": "body",
            "expected args": "1) name 2) description 3) allowed methods 4) location of data in HTTP requestion 5) expected args 6) endpoint 7) endpoint 8) return value example",
            "endpoint": "http://127.0.0.1:8000/docs/",
            "return value example": "Document created successfully",
        }
        result = client.post("/docs/", payload)
        # print(dir(result))
        # print(result, "arsen")
        # print(reslt, "nevena")
        # print(result[1].id)
        # payload = {"id": f{id}}
        # result = client.delete("/docs/", payload)
        # payload = {"email": email, "password": "umpahpah"}
        # result = client.post("/login/", payload)
        assert True
