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
        let objId = $(this)
        objId.find('input[type="text"]').blur(function() { // blur는 버블링이 일어나지 않음
            let input = $(this);
            let id = eval($(objId).find(this).attr('id').slice(-1));
            let check = false;

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
                objId.find('input[type="text"]').each(function(idx) {
                    if(id != idx && input.val() == $(objId).find(this).val()) {
                        check = true;
                        return false;
                    }
                });
                if(check) {
                    alert('중복된 값은 입력할 수 없습니다.');
                    input.val('').focus();
                    return;
                }
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
                console.log(stores)

                for(let i = 0; i < stores.length; i++) {
                    // 판매점 리스트 노출
                    let store = stores[i];

                    let winHtml = `<tr>
                                       <td>${store['num']}</td>
                                       <td>${store['name']}</td>
                                       <td>${store['count']}</td>
                                   </tr>`

                    $('.table-store tbody').append(winHtml);

                    // 판매점 주소랑 지도 연동
                    let addr = store['addr'];
                    let lat = store['lat'];
                    let lng = store['lng'];

                    let map = new google.maps.Map(document.getElementById('map'), {
                        // 처음 중심 좌표
                        center: {
                            lat: 37.587624,
                            lng: 126.976020
                        },
                        zoom: 7
                    });

                    //마커 정보

                    let locations = [];
                    locations.push([`<div class="wrap"><div class="text-box"><h4>${store['name']}</h4><div class="img-box"><img src="https://image.shutterstock.com/image-vector/palace-icon-outline-vector-web-260nw-1046855677.jpg"></div><p>${addr}</p></div>`, lat, lng])
                    console.log(locations)


                    //마커 이미지
                    let customicon = 'http://drive.google.com/uc?export=view&id=1tZgPtboj4mwBYT6cZlcY36kYaQDR2bRM'

                    //인포윈도우
                    let infowindow = new google.maps.InfoWindow();

                    //마커 생성
                    let marker, j;
                    for (j = 0; j < locations.length; j++) {
                        marker = new google.maps.Marker({

                            //마커의 위치
                            position: new google.maps.LatLng(locations[j][1], locations[j][2]),

                            //마커 아이콘
                            icon: customicon,

                            //마커를 표시할 지도
                            map: map
                        });

                        google.maps.event.addListener(marker, 'click', (function (marker, i) {
                            return function () {

                                //html로 표시될 인포 윈도우의 내용
                                infowindow.setContent(locations[j][0]);

                                //인포윈도우가 표시될 위치
                                infowindow.open(map, marker);
                            }
                        })(marker, j));

                        if (marker) {
                            marker.addListener('click', function () {

                                //중심 위치를 클릭된 마커의 위치로 변경
                                map.setCenter(this.getPosition());

                                //마커 클릭 시의 줌 변화
                                map.setZoom(14);
                            });
                        }
                    }
                }
            }
        }
    });
}

function initMap(listener) {
    //지도 스타일

}


$(document).ready(function() {
    empty();
    showNum();
    checkNumber()
    showResult();
    showStore();
});

