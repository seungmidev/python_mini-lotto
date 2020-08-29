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

/*function storeMap() {
    let mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 13 // 지도의 확대 레벨
    };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    let map = new kakao.maps.Map(mapContainer, mapOption);
}*/

/*function storeMap() {
    $.ajax({
        type: 'GET',
        url: '/store',
        data: {},
        success: function (response) {
            let mapContainer = document.getElementById('map'), // 지도를 표시할 div
            mapOption = {
                center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                level: 13 // 지도의 확대 레벨
            };

            // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
            let map = new kakao.maps.Map(mapContainer, mapOption);

            let address = '';
            let stores = response['store'];
            for(let i = 0; i < stores.length; i++) {
                let addr = stores[i]['addr'];

                address += addr + ',';
            }
            address = address.substring(0, address.length - 1);
            let address_arr = address.split(',');
            console.log(address_arr)

            let geocoder = new kakao.maps.services.Geocoder();

            // 주소로 좌표를 검색합니다
            function marker(number, address) {
                geocoder.addressSearch(address , function(result, status) {

                    // 정상적으로 검색이 완료됐으면
                     if (status === kakao.maps.services.Status.OK) {

                        let coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                        let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
                        // 결과값으로 받은 위치를 마커로 표시합니다
                        for(let i = 0; i < address_arr.length; i++) {
                            let name = stores[i]['name'];
                            console.log(name)

                            // 마커 이미지의 이미지 크기 입니다
                            let imageSize = new kakao.maps.Size(24, 35);

                            // 마커 이미지를 생성합니다
                            let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                           let marker = new kakao.maps.Marker({
                               map: map,
                               position: coords,
                               image : markerImage,
                               clickable: true
                           });

                           // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
                            let iwContent = `<div style="padding:5px;">test</div>`

                           // 인포윈도우로 장소에 대한 설명을 표시합니다
                            let infowindow = new kakao.maps.InfoWindow({
                                content: iwContent
                            });
                            infowindow.open(map, marker);

                            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                            map.setCenter(coords);

                            kakao.maps.event.addListener(marker, 'click', function() {
                                  // 마커 위에 인포윈도우를 표시합니다
                                  infowindow.open(map, marker);
                            });
                        }
                    }
                });
            }
            for(let i = 0; i < address_arr.length; i++) {
                marker(i + 1, address_arr[i]);
            }
        }
    });
}*/

$(document).ready(function() {
    empty();
    showNum();
    checkNumber()
    showResult();
    showStore();
    storeMap();
});

