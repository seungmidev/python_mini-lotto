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

function testForRequest(obj, myNo) {
    let lottoNo = myNo.join(',')
    console.log(myNo.join(','))

    $.ajax({
        type: 'GET',
        url: '/my-num',
        data: {requestParam: lottoNo},
        success: function (response) {
            let winNo = response['my_num'];
            console.log(winNo)

            // 내 번호, 당첨번호 일치여부
            let testHtml = ``;
            for(let i = 0; i < winNo.length; i++) {
                if(winNo[i] == -1) {
                    testHtml += `<span>${myNo[i]}</span>`
                } else {
                    testHtml += `<span class="equal">${myNo[i]}</span>`
                }
            }

            $('.table-num').find('tr').each(function(idx) {
                let objIdx = $(obj).eq(idx)
                let input = objIdx.find('input[type="text"]');

                // 입력한 행 인풋 스타일 추가
                if(input.val() != '') {
                   input.addClass('on');
                }

                // 내 번호, 당첨번호 일치여부 추가
                objIdx.find('.match-num').html(testHtml);
            });

            // 당첨결과
            if (winNo.indexOf(-1) > -1) { // winNo에 -1이 존재한다면
                $(obj).find('.win-result').text('낙첨');
            } else {
                $(obj).find('.win-result').text('당첨');
            }
        }
    });
}

function test() {
    $('.table-num').find('tr').each(function () {
        let nums = '';

        $(this).find('.input-form input').each(function () {
            if ($(this).val() == '') {
                return false;
            } else {
                nums += $(this).val() + ',';
            }
        });

        nums = nums.substring(0, nums.length - 1); // 시작 인덱스부터 종료 인덱스 전까지 문자열의 부분 문자열을 반환
        let numArr = nums.split(',');
        let count = 0;

        for(let i = 0; i < numArr.length; i++) {
            if (numArr[i] !== '') {
                count = count + 1;
            }
        }

        // 6개의 번호를 모두 입력해야만 조회 요청
        if (count !== 6 && count !== 0) {
            alert('빈칸을 입력해주세요.');
            return false;
        }else if (count === 6) {
            testForRequest($(this), numArr);
        }
    });
}

function checkNumber() {
    $('.table-num').find('tr').each(function() {
        $(this).find('input[type="text"]').blur(function() { // blur는 버블링이 일어나지 않음
            let input = $(this);

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
            } else {
                // 각 행 중복체크

            }
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

