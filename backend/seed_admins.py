from pymongo import MongoClient
import bcrypt
from datetime import datetime

MONGO_URI = "mongodb+srv://aliabohendy_db_user:AdC0biDZRVjSMzca@cluster0.3glgo1u.mongodb.net/fosselat?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client['fosselat']

admins = [
    {"email": "amrabohendy@fosselat.com",     "password": "amrabohendy123",     "full_name": "Amr Abo Hendy"},
    {"email": "eidbayoumy@fosselat.com",       "password": "eidbayoumy123",       "full_name": "Eid Bayoumy"},
    {"email": "abdullahshehab@fosselat.com",   "password": "abdullahshehab123",   "full_name": "Abdullah Shehab"},
    {"email": "ahmeddaif@fosselat.com",        "password": "ahmeddaif123",        "full_name": "Ahmed Daif"},
]

for admin in admins:
    existing = db.users.find_one({"email": admin["email"]})
    if existing:
        print(f"Already exists: {admin['email']}")
        continue
    hashed = bcrypt.hashpw(admin["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_doc = {
        "email": admin["email"],
        "password": hashed,
        "full_name": admin["full_name"],
        "role": "admin",
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    result = db.users.insert_one(user_doc)
    print(f"Created: {admin['email']}")

print("Done!")
client.close()
