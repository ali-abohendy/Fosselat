import os
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority')

client = MongoClient(MONGO_URI)
db = client.get_default_database()

admins = [
    {"email": "amrabohendy@fosselat.com",     "password": "amrabohendy123",     "full_name": "Amr Abo Hendy"},
    {"email": "eidbayoumy@fosselat.com",       "password": "eidbayoumy123",       "full_name": "Eid Bayoumy"},
    {"email": "abdullahshehab@fosselat.com",   "password": "abdullahshehab123",   "full_name": "Abdullah Shehab"},
    {"email": "ahmeddaif@fosselat.com",        "password": "ahmeddaif123",        "full_name": "Ahmed Daif"},
]

from werkzeug.security import generate_password_hash

for admin in admins:
    hashed = generate_password_hash(admin["password"])
    db.users.update_one(
        {"email": admin["email"]},
        {
            "$set": {
                "email": admin["email"],
                "password": hashed,
                "full_name": admin["full_name"],
                "role": "admin",
                "status": "active",
                "is_active": True,
            }
        },
        upsert=True
    )
    print(f"Updated/Created admin: {admin['email']}")

print("Done!")
client.close()
