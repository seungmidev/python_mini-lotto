from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.dblotto

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
data = requests.get('https://dhlottery.co.kr/gameResult.do?method=byWin', headers=headers)
soup = BeautifulSoup(data.text, 'html.parser')

result_tag = soup.select_one('.win_result')

result_tit = result_tag.select_one('h4 strong').text
result_date = result_tag.select_one('.desc').text


result_list = {
    'title': result_tit,
    'date': result_date
}

# db.win_result.insert_one(result_list)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/result', methods=['GET'])
def get_result():
    result = list(db.win_result.find({}, {'_id': 0}))
    return jsonify({'result': 'success', 'win_result': result})


if __name__ == '__main__':
    app.run('0.0.0.0', port=8000, debug=True)