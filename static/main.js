function empty() {
    $('.win-tit').empty();
    $('.win-num').empty();
    $('.match-num').empty();
    $('.win-result').empty();
    $('.table-result tbody').empty();
    $('.table-store tbody').empty();
}

function showNum() {
    $.ajax({
        type: 'GET',
        url: '/win-num',
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let win_num = response['win_num'][0];

                let tempHtml = `${win_num['drwNo']}회 <span>(${win_num['drwNoDate']})</span>`;
                $('.win-tit').append(tempHtml);

                let numHtml = `<span class="win-num-item">${win_num['drwtNo1']}</span>
                               <span class="win-num-item">${win_num['drwtNo2']}</span>
                               <span class="win-num-item">${win_num['drwtNo3']}</span>
                               <span class="win-num-item">${win_num['drwtNo4']}</span>
                               <span class="win-num-item">${win_num['drwtNo5']}</span>
                               <span class="win-num-item">${win_num['drwtNo6']}</span>
                               <span class="win-num-item plus">+</span>
                               <span class="win-num-item">${win_num['bnusNo']}</span>`

                $('.win-num').append(numHtml);
            }
        }
    });
}

function testForRequest() {
    $('.table-num').find('tr').each(function(idx) {
        let _this = $(this);
        let numbox = $(this).find('input[type="text"]');


        let firstRow01 = $("#myNo1-0").val();
        let firstRow02 = $("#myNo1-1").val();
        let firstRow03 = $("#myNo1-2").val();
        let firstRow04 = $("#myNo1-3").val();
        let firstRow05 = $("#myNo1-4").val();
        let firstRow06 = $("#myNo1-5").val();

        let url = '/my-num?firstRow01=' + firstRow01
            + '&firstRow02=' + firstRow02
            + '&firstRow03=' + firstRow03
            + '&firstRow04=' + firstRow04
            + '&firstRow05=' + firstRow05
            + '&firstRow06=' + firstRow06;
        $.ajax({
            type: 'GET',
            url: url,
            data: {},
            success: function (response) {
                let num = response['my_num'];
                console.log(num)

                let my_num = [
                    firstRow01,
                    firstRow02,
                    firstRow03,
                    firstRow04,
                    firstRow05,
                    firstRow06
                ];

                // 내 번호, 당첨번호 일치여부 결과
                let testHtml = ``;
                if (num[idx] == -1) {
                    testHtml += `<span>${my_num[idx]}</span>`
                } else {
                    testHtml += `<span class="equal">${my_num[idx]}</span>`
                }
                $('.match-num').append(testHtml);

                // 입력한 행 인풋 스타일 추가
                _this.each(function() {
                    let input = $(this).find('input[type="text"]');

                    if (input.val() != '') {
                        input.addClass('on');
                    }
                });

                // 내 번호, 당첨번호 대조한 결과
                if (num.indexOf(-1) > -1) { // num에 -1이 존재한다
                    _this.find('.win-result').text('낙첨');
                } else {
                    _this.find('.win-result').text('당첨');
                }
            }

        });
    });

}

function checkNumber() {
    $('.table-num').find('tr').each(function() {
        $(this).find('input[type="text"]').blur(function() { // blur는 버블링이 일어나지 않음
            let input = $(this);
            let chk = false;

            if(input.val() == '') {
                return;
            } else if(isNaN(input.val())) { // isNaN() -> Not a Number 타입이 숫자인지 아닌지 판별
                alert('숫자만 입력 가능합니다.');
                input.val('').focus();
                return;
            } else if(input.val() < 1 || input.val() > 45) {
                alert('1 ~ 45 사이의 숫자만 입력 가능합니다.');
                input.val('').focus();
                return;
            }
            // 입력한 숫자 중복체크 추가해야함
        });
    });
}

function showResult() {
    $.ajax({
        type: 'GET',
        url: '/win-result',
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let win_result = response['win_result'];

                for(let i = 0; i < win_result.length; i++) {
                    let win = win_result[i];

                    let winHtml = `<tr>
                                       <td>${win['rank']}</td>
                                       <td>${win['game']}</td>
                                       <td>${win['amount']}</td>
                                       <td>${win['amount_one']}</td>
                                   </tr>`

                    $('.table-result tbody').append(winHtml);
                }
            }
        }
    });
}

function showStore() {
    $.ajax({
        type: 'GET',
        url: '/store',
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let stores = response['store'];

                for(let i = 0; i < stores.length; i++) {
                    let store = stores[i];

                    let winHtml = `<tr>
                                       <td>${store['num']}</td>
                                       <td>${store['name']}</td>
                                       <td>${store['count']}</td>
                                   </tr>`

                    $('.table-store tbody').append(winHtml);
                }
            }
        }
    });
}

function storeMap() {
    let mapOptions = {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 10
    };

    let map = new naver.maps.Map('map', mapOptions);
}

$(document).ready(function() {
    empty();
    showNum();
    checkNumber()
    showResult();
    showStore();
    storeMap();
});