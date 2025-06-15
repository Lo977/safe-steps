#!/usr/bin/env python3

from faker import Faker
import random
from datetime import date
from config import app, db
from models import User, SupportLog, Resource, UrgencyLevel

fake = Faker()

def seed():
    with app.app_context():
        print("🚀 Seeding started...")
        db.drop_all()
        db.create_all()

        # Seed Resources
        resource_types = ["Hotline", "Shelter", "Legal Aid", "Health Clinic", "Crisis Center"]
        resources = []
        for _ in range(5):
            r = Resource(
                name=fake.company(),
                type=random.choice(resource_types),
                location=fake.address(),
                phone_number=fake.phone_number()
            )
            resources.append(r)
            db.session.add(r)

        # Seed Urgency Levels
        levels = [
            {"level": "Low", "description": "Stable but needs support"},
            {"level": "Moderate", "description": "Needs attention soon"},
            {"level": "High", "description": "Needs urgent attention"},
            {"level": "Crisis", "description": "Immediate danger or need"}
        ]
        urgency_levels = []
        for l in levels:
            u = UrgencyLevel(level=l["level"], description=l["description"])
            urgency_levels.append(u)
            db.session.add(u)

        # Seed Users and Logs
        for _ in range(3):
            user = User(name=fake.user_name())
            user.password = "password123"  # hashed automatically
            db.session.add(user)
            db.session.flush()

            for _ in range(random.randint(2, 5)):
                log = SupportLog(
                    notes=fake.paragraph(nb_sentences=3),
                    date=date.today(),
                    user_id=user.id,
                    resource_id=random.choice(resources).id,
                    urgency_level_id=random.choice(urgency_levels).id
                )
                db.session.add(log)

        db.session.commit()
        print("✅ Seed complete!")

if __name__ == "__main__":
    seed()
