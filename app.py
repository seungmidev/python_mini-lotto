from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BlockingScheduler
import schedule
import time
import json
import os
import sys
import urllib.request
import datetime
from config import *
import geocoder
import pprint
import googlemaps
from init_db import get_lotto, get_lotto_result, get_lotto_store

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.dblotto


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/win-num', methods=['GET'])
def get_num():
    result = list(db.win_num.find({}, {'_id': False}).sort('drwNo', -1).limit(1))
    return jsonify({'result': 'success', 'win_num': result})


@app.route('/win-result', methods=['GET'])
def get_result():
    result = list(db.win_result.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'win_result': result})


@app.route('/store', methods=['GET'])
def get_store():
    result = list(db.store.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'store': result})


@app.route('/my-num', methods=['GET'])
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


# def get_lat_lng(addr):
#     url = 'https://dapi.kakao.com/v2/local/search/address.json?query='+addr
#     headers = {"Authorization": "KakaoAK d50099b3f24ab32a65901411e7a93978"}
#     result = json.loads(str(request.get(url, headers=headers).text))
#     match_first = result['documents'][0]['address']
#
#     return float(match_first['y']), float(match_first['x'])
#
#
# get_lat_lng('서울 마포구 모래내로1길 20')


def get_request_url(url):
    req = urllib.request.Request(url)
    req.add_header("X-Naver-Client-Id", 'rzd6uykue3')
    req.add_header("X-Naver-Client-Secret", 'kVSK0zJKMzDmCyGIC1rvzYUgZleSqtsgj94hmWEl')
    try:
        response = urllib.request.urlopen(req)
        if response.getcode() == 200:
            print("[%s] Url Request Success" % datetime.datetime.now())
            return response.read().decode('utf-8')
    except Exception as e:
        print(e)
        print("[%s] Error for URL : %s" % (datetime.datetime.now(), url))
        return None


# [CODE 1]
def getGeoData(address):
    base = "https://openapi.naver.com/v1/map/geocode"
    node = ""
    parameters = "?query=%s" % urllib.parse.quote(address)
    url = base + node + parameters

    retData = get_request_url(url)

    if (retData == None):
        return None
    else:
        return json.loads(retData)


def main():
    jsonResult = getGeoData('서울특별시 은평구 신사동 18-41')

    if 'result' in jsonResult.keys():
        print('총 검색 결과: ', jsonResult['result']['total'])
        print('검색어: ', jsonResult['result']['userquery'])

        for item in jsonResult['result']['items']:
            print('=======================')
            print('주소: ', item['address'])
            print('위도: ', str(item['point']['y']))
            print('경도: ', str(item['point']['x']))


# main()


# location = "서울시 은평구 신사동 18-41"
# data = urllib.request.urlopen("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=ko&address=" + location + "&key=AIzaSyBHlzY-NotWWUgA8KJRoCV9JwlyPb5IgqE")
# json = json.loads(data.read())
#
# latitude = json["results"][0]["geometry"]["location"]["lat"]
# longitude = json["results"][0]["geometry"]["location"]["lng"]
#
# print(latitude)
# print(longitude)


def search_map(search_text):
    enc_text = urllib.parse.quote(search_text)
    url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + enc_text

    request = urllib.request.Request(url)
    request.add_header('X-Naver-Client-Id', 'rzd6uykue3')
    request.add_header('X-Naver-Client-Secret', 'kVSK0zJKMzDmCyGIC1rvzYUgZleSqtsgj94hmWEl')
    response = urllib.request.urlopen(request)
    rescode = response.getcode()
    if (rescode == 200):
        response_body = response.read()
        mystr = response_body.decode('utf-8')
        # false, true를 대문자로 replace를 해주고,
        mystr = mystr.replace('true', "True")
        mystr = mystr.replace('false', "False")

        # string -> json 타입으로 바꾸자
        mydic = eval(mystr)

        # 차례대로 끼워맞추다 보면 아래의 값으로 출력 할 수 있다.
        print(mydic['result']['items'][0]['point']['y'])
        print(mydic['result']['items'][0]['point']['x'])
    else:
        print("Error Code:" + rescode)


# search_map('서울시')


# google map
gmaps =googlemaps.Client(key='AIzaSyBHlzY-NotWWUgA8KJRoCV9JwlyPb5IgqE')
geo=gmaps.geocode('대한민국 서울특별시 강남구 대치2동 514')
print(geo)


# 매주 토요일 밤 9시 업데이트
schedule.every().saturday.at("22:00").do(get_lotto_result, get_lotto_store, get_lotto)


if __name__ == '__main__':
    app.run('0.0.0.0', port=8000, debug=True)