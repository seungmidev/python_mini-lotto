from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import schedule
import copy
import googlemaps
from init_db import get_lotto, get_lotto_result, get_lotto_store

app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client.dblotto


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/win-num', methods=['GET'])
# 최신회차 정보 가져오기
def get_num():
    result = list(db.win_num.find({}, {'_id': False}).sort('drwNo', -1).limit(1))
    return jsonify({'result': 'success', 'win_num': result})


@app.route('/win-result', methods=['GET'])
# 최신회차 당첨정보 가져오기
def get_result():
    result = list(db.win_result.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'win_result': result})


@app.route('/store', methods=['GET'])
# 최다 당첨판매점 정보 및 지도연동
def get_store():
    result = list(db.store.find({}, {'_id': False}))

    temp_result = []
    # 구글맵 주소 사용하여 위도, 경도 값 구하기
    gmaps = googlemaps.Client(key='AIzaSyBHlzY-NotWWUgA8KJRoCV9JwlyPb5IgqE')
    for i, store in enumerate(result):
        temp_store = copy.deepcopy(store)
        try:
            geo = gmaps.geocode(store['addr'])
            lat = geo[0]['geometry']['location']['lat']
            lng = geo[0]['geometry']['location']['lng']
            temp_store['lat'] = lat
            temp_store['lng'] = lng
        except:
            temp_store['lat'] = 0
            temp_store['lng'] = 0
        temp_result.append(temp_store)

    return jsonify({'result': 'success', 'store': temp_result})


@app.route('/my-num', methods=['GET'])
# 입력한 번호와 최신회차 당첨번호 대조
def get_my_num():
    test = request.args.get('requestParam')
    number_list = list(map(int, test.split(',')))
    print(number_list)

    result = list(db.win_num.find({}, {'_id': False}).sort('drwNo', -1).limit(1))

    result_list = [
        result[0]['drwtNo1'],
        result[0]['drwtNo2'],
        result[0]['drwtNo3'],
        result[0]['drwtNo4'],
        result[0]['drwtNo5'],
        result[0]['drwtNo6']
    ]

    print('db result : ', result_list)

    correct_list = []
    for number in number_list:
        if int(number) in result_list:
            correct_list.append(number)
        else:
            correct_list.append(-1)

    print(correct_list)
    return jsonify({'result': 'success', 'my_num': correct_list})


# 매주 토요일 밤 10시 업데이트
schedule.every().saturday.at("22:00").do(get_lotto_result, get_lotto_store, get_lotto)


if __name__ == '__main__':
    app.run('0.0.0.0', port=8000, debug=True)