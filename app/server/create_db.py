from server import app
from models import db

with app.app_context():
    db.create_all()
    print(" Baza de date creata: forensic.db")