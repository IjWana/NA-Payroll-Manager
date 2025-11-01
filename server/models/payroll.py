from datetime import datetime, timezone

class PayrollModel:
    def __init__(self, db):
        self.collection = db.payroll_runs

    def build_entry(self, personnel_doc):
        """Convert a personnel document into a payroll entry"""
        basic = float(personnel_doc.get("Basic_Pay", 0))
        allowance = float(personnel_doc.get("Allowance", 0))
        deductions = float(personnel_doc.get("Deductions", 0))
        net = basic + allowance - deductions

        return {
            "armynumber": personnel_doc.get("Army_Number", ""),
            "name": personnel_doc.get("Name", ""),
            "rank": personnel_doc.get("Rank", ""),
            "corps": personnel_doc.get("Corps", ""),
            "fmnunit": personnel_doc.get("Fmn_Unit", ""),
            "region": personnel_doc.get("Region", ""),
            "basic": basic,
            "allowance": allowance,
            "deductions": deductions,
            "net": net,
            "status": "approved"
        }

    def compute_preview(self, personnel_list):
        """Compute payroll totals and entries"""
        entries = [self.build_entry(p) for p in personnel_list]
        totals = {
            "gross": sum(e["basic"] + e["allowance"] for e in entries),
            "allowances": sum(e["allowance"] for e in entries),
            "deductions": sum(e["deductions"] for e in entries)
        }
        return entries, totals

    def get_by_period(self, period):
        return self.collection.find_one({"period": period})

    def create_run(self, period, entries, totals, approved_by):
        doc = {
            "period": period,
            "entries": entries,
            "totals": totals,
            "approved_by": approved_by,
            "approved_at": datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        }
        self.collection.insert_one(doc)
        return doc

    def overwrite_run(self, existing_id, new_doc):
        self.collection.replace_one({"_id": existing_id}, new_doc)

    def list_history(self, limit=20):
        """Return latest payroll runs"""
        runs = list(self.collection.find({}, {"entries": 0}).sort("approved_at", -1).limit(limit))
        for r in runs:
            r["_id"] = str(r["_id"])
        return runs
