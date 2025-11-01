from datetime import datetime, timezone
from bson import ObjectId

class PersonnelModel:
    def __init__(self, db):
        self.collection = db.personnel

    def to_dict(self, doc):
        """Convert MongoDB document to JSON-safe dict"""
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return doc

    def list_all(self):
        """Return all personnel"""
        people = list(self.collection.find())
        return [self.to_dict(p) for p in people]

    def get_by_id(self, pid):
        """Find a single personnel by ObjectId"""
        try:
            oid = ObjectId(pid)
        except:
            return None
        doc = self.collection.find_one({"_id": oid})
        return self.to_dict(doc)

    def create(self, data):
        """Insert new personnel document"""
        now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        new_doc = {
            "Staff_ID": data.get("Staff_ID"),
            "Name": data.get("Name"),
            "Rank": data.get("Rank"),
            "Department": data.get("Department"),
            "Region": data.get("Region"),
            "Basic_Pay": float(data.get("Basic_Pay", 0)),
            "Allowance": float(data.get("Allowance", 0)),
            "Deductions": float(data.get("Deductions", 0)),
            "active": data.get("active", True),
            "created_at": now,
            "updated_at": now,
        }
        result = self.collection.insert_one(new_doc)
        new_doc["_id"] = str(result.inserted_id)
        return new_doc

    def update(self, pid, data):
        """Update existing personnel"""
        try:
            oid = ObjectId(pid)
        except:
            return None
        update_fields = {
            "Name": data.get("Name"),
            "Rank": data.get("Rank"),
            "Department": data.get("Department"),
            "Region": data.get("Region"),
            "Basic_Pay": float(data.get("Basic_Pay", 0)),
            "Allowance": float(data.get("Allowance", 0)),
            "Deductions": float(data.get("Deductions", 0)),
            "active": data.get("active", True),
            "updated_at": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        }
        self.collection.update_one({"_id": oid}, {"$set": update_fields})
        return self.get_by_id(pid)

    def delete(self, pid):
        """Delete personnel by ID"""
        try:
            oid = ObjectId(pid)
        except:
            return False
        result = self.collection.delete_one({"_id": oid})
        return result.deleted_count > 0
