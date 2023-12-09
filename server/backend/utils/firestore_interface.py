from firebase_admin import firestore


class FirestoreClient:
    def __init__(self, collection):        
        self._db = firestore.client()
        self._collection = self._db.collection(collection)

    def create(self, data):
        """Create item in firestore database"""
        try:
            self._collection.document().set(data)
            # self._collection.document().add(data)
            return "Document created successfully"
        except Exception as e:
            return e

    def update(self, id, data):
        """Update item on firestore database using document id"""
        try:
            doc_ref = self._collection.document(id)
            doc_ref.update(data)
            return "Document updated successfully"
        except Exception as e:
            return e

    def delete_by_id(self, id):
        """Delete item on firestore database using document id"""
        try:
            doc_ref = self._collection.document(id).get()
            if doc_ref.exists:
                self._collection.document(id).delete()
                return f"Document with following id {id} was deleted."
            return f"Document with following id {id} doesn't exist."
        except Exception as e:
            return e

    def get_by_id(self, id):
        """Get item on firestore database using document id"""
        try:
            doc_ref = self._collection.document(id).get()
            if doc_ref.exists:
                return doc_ref
            return f"Document with following id {id} doesn't exist."
        except Exception as e:
            return e

    def get_all(self, page):
        """Get all items from Firestore database"""
        try:
            page = int(page)
            if page != 1:
                page = (page - 1) * 5
            else:
                page -= 1
            doc_ref = self._collection.limit(5).offset(page).stream()
            return doc_ref
        except Exception as e:
            return e

    def filter(self, field, condition, value):
        """Filter items using conditions  on Firestore database returning docs"""
        try:
            docs = self._collection.where(field, condition, value).stream()
            return docs
        except Exception as e:
            return e

    def filter_with_pagination(self, field, condition, value, page):
        """Filter items using conditions with pagination on Firestore database returning docs"""
        try:
            page = int(page)
            if page != 1:
                page = (page - 1) * 5
            else:
                page -= 1
            docs = (
                self._collection.where(field, condition, value)
                .limit(5)
                .offset(page)
                .stream()
            )
            return docs
        except Exception as e:
            return e

