import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.dblotto
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}


def get_lotto():
    last_data = db.win_num.find({}, {'_id': False}).sort('drwNo', -1).limit(1)
    last_drwno = last_data[0]['drwNo'] + 1

    base_url = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=' + str(last_drwno)

    data = requests.get(base_url, headers=headers)
    result = data.json()

    lotto_list = {
        'drwNo': result['drwNo'],
        'drwNoDate': result['drwNoDate'],
        'drwtNo1': result['drwtNo1'],
        'drwtNo2': result['drwtNo2'],
        'drwtNo3': result['drwtNo3'],
        'drwtNo4': result['drwtNo4'],
        'drwtNo5': result['drwtNo5'],
        'drwtNo6': result['drwtNo6']
    }

    db.win_num.insert_one(lotto_list)


def get_lotto_result():
    data = requests.get('https://dhlottery.co.kr/gameResult.do?method=byWin', headers=headers)

    soup = BeautifulSoup(data.text, 'html.parser')
    wins = soup.select('.tbl_data tbody tr')

    db.win_result.delete_many({})

    for win in wins:
        rank = win.select_one('td:nth-child(1)').text
        amount = win.select_one('td:nth-child(2) strong').text
        game = win.select_one('td:nth-child(3)').text
        amount_one = win.select_one('td:nth-child(4)').text

        win_list = {
            'rank': rank,
            'amount': amount,
            'game': game,
            'amount_one': amount_one
        }

        db.win_result.insert_one(win_list)


def get_lotto_store():
    data = requests.get('https://dhlottery.co.kr/store.do?method=topStoreRank&rank=2&pageGubun=L645', headers=headers)

    soup = BeautifulSoup(data.text, 'html.parser')
    stores = soup.select('.tbl_data tbody tr')

    db.store.delete_many({})

    for store in stores:
        num = store.select_one('td:nth-child(1)').text
        name = store.select_one('td:nth-child(2)').text
        count = store.select_one('td:nth-child(3)').text

        store_list = {
            'num': num,
            'name': name,
            'count': count
        }

        db.store.insert_one(store_list)


get_lotto()
get_lotto_result()
get_lotto_store()