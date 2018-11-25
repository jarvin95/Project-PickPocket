from flask import Flask, request
from flask_cors import CORS
from face_recog import detect_face
import os
import pandas as pd
import sqlalchemy

app = Flask(__name__)
CORS(app)

jarvin_laptop = "18:5E:0F:1F:EA:B9"
jarvin_phone = "C0:EE:FB:D2:93:C4"
yus_phone = "24:18:1D:3E:8B:43"

cans_taken = 0

filename = [file for file in os.listdir('.') if 'kismet' in file and 'journal' not in file][0]


def get_latest_data():
    query = "SELECT ts_sec, sourcemac, signal FROM packets ORDER BY ts_sec DESC"
    engine = sqlalchemy.create_engine(f'sqlite:///{filename}')

    raw = pd.read_sql(query, engine)
    data = raw[
        ((raw.signal < 0) | (raw.sourcemac == yus_phone) | (raw.sourcemac == jarvin_phone))
        & (raw.signal > -100)]
    unique = data.drop_duplicates(subset=['sourcemac'])
    unique.sourcemac = unique.sourcemac \
        .str.replace(yus_phone, 'Yustynn Panicker') \
        .str.replace(jarvin_phone, 'Jarvin Ong')

    return unique

@app.route("/macs")
def get_macs():
    return get_latest_data().to_json()

@app.route("/person")
def person():
    return detect_face()

@app.route("/cans", methods=['GET', 'POST'])
def update_cans():
    global cans_taken

    if request.method == 'POST':
        cans_taken = request.data.decode("utf-8")
        return str(cans_taken)

    if request.method == 'GET':
        return str(cans_taken)
