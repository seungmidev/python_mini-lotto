import requests
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.dblotto
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}


def get_lotto_api():
    # 로또 API 1회부터 마지막 회차까지 당첨정보 가져오기 - DB 저장용
    base_url = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo='
    count = 1

    while True:
        data = requests.get(base_url + str(count), headers=headers)
        result = data.json()

        if result['returnValue'] == 'fail':
            break
        else:
            lotto_list = {
                'drwNo': result['drwNo'],
                'drwNoDate': result['drwNoDate'],
                'drwtNo1': result['drwtNo1'],
                'drwtNo2': result['drwtNo2'],
                'drwtNo3': result['drwtNo3'],
                'drwtNo4': result['drwtNo4'],
                'drwtNo5': result['drwtNo5'],
                'drwtNo6': result['drwtNo6'],
                'bnusNo': result['bnusNo']
            }

            db.win_num.insert_one(lotto_list)
            count = count + 1


get_lotto_api()