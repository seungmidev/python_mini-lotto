from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

app = Flask(__name__)

proxies = {
  "http": None,
  "https": None,
}

client = MongoClient('localhost', 27017)
db = client.dblotto


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/win-num', methods=['GET'])
def get_num():
    result = list(db.win_num.find({}, {'_id': False}).limit(1).sort('drwNo', -1))
    return jsonify({'result': 'success', 'win_num': result})


@app.route('/win-result', methods=['GET'])
def get_result():
    result = list(db.win_result.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'win_result': result})


@app.route('/store', methods=['GET'])
def get_store():
    result = list(db.store.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'store': result})


if __name__ == '__main__':
    app.run('0.0.0.0', port=8000, debug=True)