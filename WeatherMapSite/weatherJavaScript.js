var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(35.1796, 129.0756), // 사직야구장을 기본 중심좌표로 설정
        level: 5 // 지도의 확대 레벨
    };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 구장 마커들을 저장할 배열
var stadiumMarkers = [];

// 날씨 데이터를 저장할 변수
var weatherData = {};

// 날씨 제목 업데이트 함수
function updateWeatherTitle(stadiumName) {
    const weatherTitle = document.querySelector('.weather-title');
    if (weatherTitle) {
        weatherTitle.textContent = `오늘부터 2일 동안의 ${stadiumName} 날씨`;
    }
}

// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}

// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 축소하는 함수입니다
function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

// 구장 버튼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    const stadiumButtons = document.querySelectorAll('.stadium-btn');
    
    // 기본값으로 사직야구장 선택
    const defaultStadium = document.querySelector('[data-name="사직"]');
    if (defaultStadium) {
        defaultStadium.classList.add('active');
        updateWeatherTitle('사직야구장');
        
        // 사직야구장 날씨 정보 가져오기
        fetchWeatherData('사직야구장');
        
        // 사직야구장 마커 표시
        const lat = parseFloat(defaultStadium.getAttribute('data-lat'));
        const lng = parseFloat(defaultStadium.getAttribute('data-lng'));
        const newCenter = new kakao.maps.LatLng(lat, lng);
        
        const stadiumMarker = new kakao.maps.Marker({
            position: newCenter,
            map: map
        });
        
        const stadiumInfo = new kakao.maps.InfoWindow({
            content: `<div style="padding:10px;text-align:center;min-width:200px;"><h4 style="margin:0 0 5px 0;font-size:14px;font-weight:bold;color:#333;">${defaultStadium.textContent}</h4><p style="margin:0;font-size:12px;color:#666;">KBO 1부 리그 구장</p></div>`,
            zindex: 1
        });
        
        stadiumInfo.open(map, stadiumMarker);
        stadiumMarkers.push(stadiumMarker);
    }
    
    stadiumButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const name = this.getAttribute('data-name');
            const stadiumName = name; // data-name 속성 사용
            
            // 이전 마커들 제거
            stadiumMarkers.forEach(marker => marker.setMap(null));
            stadiumMarkers = [];
            
            // 지도 중심 이동
            const newCenter = new kakao.maps.LatLng(lat, lng);
            map.setCenter(newCenter);
            map.setLevel(5); // 적절한 확대 레벨로 설정
            
            // 구장 마커 추가
            const stadiumMarker = new kakao.maps.Marker({
                position: newCenter,
                map: map
            });
            
            // 구장 정보 인포윈도우
            const stadiumInfo = new kakao.maps.InfoWindow({
                content: `<div style="padding:10px;text-align:center;min-width:200px;"><h4 style="margin:0 0 5px 0;font-size:14px;font-weight:bold;color:#333;">${this.textContent}</h4><p style="margin:0;font-size:12px;color:#666;">KBO 1부 리그 구장</p></div>`,
                zindex: 1
            });
            
            stadiumInfo.open(map, stadiumMarker);
            stadiumMarkers.push(stadiumMarker);
            
            // 버튼 활성화 상태 변경
            stadiumButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 날씨 제목 업데이트 (전체 구장명 사용)
            const fullStadiumName = this.textContent.split(' ')[0]; // "잠실야구장" 형태
            updateWeatherTitle(fullStadiumName);
            
            // 날씨 정보 가져오기 (data-name 속성 사용)
            fetchWeatherData(stadiumName);
        });
    });
});

// 날씨 정보를 가져오는 함수
async function fetchWeatherData(stadiumName) {
    try {
        // 기상청 단기예보 API 호출
        const weatherData = await getWeatherFromAPI(stadiumName);
        
        // 날씨 데이터가 null이면 오류 처리
        if (weatherData === null) {
            displayWeatherError();
            return;
        }
        
        // 날씨 컨테이너에 데이터 표시
        displayWeatherData(weatherData);
        
    } catch (error) {
        console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
        displayWeatherError();
    }
}

// 실제 기상청 API에서 날씨 데이터 가져오기
async function getWeatherFromAPI(stadiumName) {
    // 구장별 좌표 매핑 (기상청 단기예보 좌표)
    const stadiumNxCodes = WEATHER_CONFIG.STADIUM_NX_CODES;
    const stadiumNyCodes = WEATHER_CONFIG.STADIUM_NY_CODES;
    
    // API 키 (실제 발급받은 키로 교체 필요)
    const API_KEY = WEATHER_CONFIG.API_KEY;
    
    // 단기예보는 발표시각이 다름 (02:00, 05:00, 08:00, 11:00, 14:00, 17:00, 20:00, 23:00)
    const now = new Date();
    const currentHour = now.getHours();
    
    // 가장 가까운 발표시각 계산
    let baseTime;
    if (currentHour < 2) {
        // 전날 23시 발표분 사용
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        baseTime = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}2300`;
    } else if (currentHour < 5) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}0200`;
    } else if (currentHour < 8) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}0500`;
    } else if (currentHour < 11) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}0800`;
    } else if (currentHour < 14) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}1100`;
    } else if (currentHour < 17) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}1400`;
    } else if (currentHour < 20) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}1700`;
    } else if (currentHour < 23) {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}2000`;
    } else {
        baseTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}2300`;
    }
    
    // 구장에 해당하는 좌표 가져오기
    const nx = stadiumNxCodes[stadiumName] || '55'; // 기본값은 인천
    const ny = stadiumNyCodes[stadiumName] || '124'; // 기본값은 인천
    
    console.log('구장명:', stadiumName);
    console.log('사용 가능한 구장 키:', Object.keys(stadiumNxCodes));
    console.log('매핑된 좌표:', nx, ny);
    
    // API URL 구성 (단기예보 파라미터)
    const url = `${WEATHER_CONFIG.BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseTime.substring(0, 8)}&base_time=${baseTime.substring(8, 12)}&nx=${nx}&ny=${ny}`;
    
    console.log('단기예보 API 호출 URL:', url);
    console.log('구장:', stadiumName, '좌표:', nx, ny);
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.response.header.resultCode === '00') {
            return parseWeatherData(data.response.body.items.item);
        } else {
            throw new Error(`API 오류: ${data.response.header.resultMsg}`);
        }
    } catch (error) {
        console.error('API 호출 실패:', error);
        // API 호출 실패 시 null 반환하여 오류 처리
        return null;
    }
}

// API 응답 데이터를 파싱하는 함수
function parseWeatherData(apiData) {
    if (!apiData || !Array.isArray(apiData)) {
        console.log('API 데이터가 없거나 배열이 아닙니다:', apiData);
        return null;
    }
    
    console.log('단기예보 API 응답 데이터:', apiData);
    
    const weatherData = [];
    const today = new Date();
    
    // 단기예보 데이터 구조에 맞게 파싱
    // API 응답: fcstDate, fcstTime, category, fcstValue
    // category: TMP(기온), SKY(하늘상태), PTY(강수형태), REH(습도)
    
    // 날짜별로 데이터 그룹화
    const dailyData = {};
    
    apiData.forEach(item => {
        const fcstDate = item.fcstDate;
        const fcstTime = item.fcstTime;
        const category = item.category;
        const fcstValue = item.fcstValue;
        
        if (!dailyData[fcstDate]) {
            dailyData[fcstDate] = {};
        }
        if (!dailyData[fcstDate][fcstTime]) {
            dailyData[fcstDate][fcstTime] = {};
        }
        dailyData[fcstDate][fcstTime][category] = fcstValue;
    });
    
    // 3일간의 날씨 데이터 생성 (당일, 1일후, 2일후)
    for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        
        // 해당 날짜의 데이터가 있는지 확인
        if (dailyData[dateStr]) {
            // 해당 날짜의 모든 시간대 데이터에서 대표값 추출
            const timeSlots = Object.keys(dailyData[dateStr]);
            let tempMax = -50, tempMin = 50;
            let skyValues = [], ptyValues = [], rehValues = [];
            
            timeSlots.forEach(time => {
                const timeData = dailyData[dateStr][time];
                
                // 기온 데이터 수집
                if (timeData.TMP) {
                    const temp = parseInt(timeData.TMP);
                    tempMax = Math.max(tempMax, temp);
                    tempMin = Math.min(tempMin, temp);
                }
                
                // 하늘상태 데이터 수집
                if (timeData.SKY) {
                    skyValues.push(parseInt(timeData.SKY));
                }
                
                // 강수형태 데이터 수집
                if (timeData.PTY) {
                    ptyValues.push(parseInt(timeData.PTY));
                }
                
                // 습도 데이터 수집
                if (timeData.REH) {
                    rehValues.push(parseInt(timeData.REH));
                }
            });
            
            // 날씨 상태 결정
            let weather = '맑음';
            const avgSky = skyValues.length > 0 ? skyValues.reduce((a, b) => a + b) / skyValues.length : 1;
            const maxPty = ptyValues.length > 0 ? Math.max(...ptyValues) : 0;
            
            if (maxPty > 0) {
                if (maxPty === 1) weather = '비';
                else if (maxPty === 2) weather = '비/눈';
                else if (maxPty === 3) weather = '눈';
                else if (maxPty === 4) weather = '소나기';
            } else if (avgSky >= 4) {
                weather = '흐림';
            } else if (avgSky >= 3) {
                weather = '구름많음';
            }
            
            // 평균 습도 계산
            const avgHumidity = rehValues.length > 0 ? 
                Math.round(rehValues.reduce((a, b) => a + b) / rehValues.length) : 50;
            
            weatherData.push({
                date: date.toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                }),
                weather: weather,
                temp: {
                    min: tempMin === 50 ? 10 : tempMin, // 기본값 설정
                    max: tempMax === -50 ? 20 : tempMax  // 기본값 설정
                },
                humidity: avgHumidity
            });
        } else {
            // 해당 날짜의 데이터가 없는 경우 null 반환하여 오류 처리
            return null;
        }
    }
    
    return weatherData;
}



// 날씨 데이터를 화면에 표시하는 함수
function displayWeatherData(weatherData) {
    const weatherContainer = document.querySelector('.weather-container');
    
    if (!weatherContainer) return;
    
    const weatherHTML = weatherData.map(day => `
        <div class="weather-card">
            <div class="weather-date">${day.date}</div>
            <div class="weather-icon">${getWeatherIcon(day.weather)}</div>
            <div class="weather-type">${day.weather}</div>
            <div class="weather-temp">
                <span class="temp-max">${day.temp.max}°</span>
                <span class="temp-min">${day.temp.min}°</span>
            </div>
            <div class="weather-humidity">습도 ${day.humidity}%</div>
        </div>
    `).join('');
    
    weatherContainer.innerHTML = weatherHTML;
}

// 날씨 아이콘 반환 함수
function getWeatherIcon(weatherType) {
    const icons = {
        '맑음': '☀️',
        '구름많음': '⛅',
        '흐림': '☁️',
        '비': '🌧️',
        '눈': '❄️',
        '구름많고 비': '🌧️',
        '흐리고 비': '🌧️',
        '구름많고 눈': '❄️',
        '흐리고 눈': '❄️',
        '구름많고 비/눈': '🌨️',
        '흐리고 비/눈': '🌨️',
        '맑고 비': '🌦️',
        '맑고 눈': '🌨️'
    };
    
    // 날씨 타입에 따라 아이콘 선택
    if (weatherType.includes('눈') && weatherType.includes('비')) {
        return icons['구름많고 비/눈'];
    } else if (weatherType.includes('눈')) {
        return icons['눈'];
    } else if (weatherType.includes('비')) {
        return icons['비'];
    } else if (weatherType.includes('흐림')) {
        return icons['흐림'];
    } else if (weatherType.includes('구름')) {
        return icons['구름많음'];
    } else {
        return icons['맑음'];
    }
}

// 날씨 에러 표시 함수
function displayWeatherError() {
    const weatherContainer = document.querySelector('.weather-container');
    if (weatherContainer) {
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <p>날씨 정보를 불러올 수 없습니다.</p>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}



