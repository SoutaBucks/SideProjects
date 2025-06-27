// 기상청 단기예보 API 설정
const WEATHER_CONFIG = {
    // 공공데이터포털에서 발급받은 API 키를 여기에 입력하세요
    API_KEY: '0O74eQhz1iGKvHKhEnlxnxk5DnRHZHsHczlp59vorjnrm9Ik1MCsB85jRGWmiYB7t7XCu%2FxTM%2FOZvW4ZcWa6wg%3D%3D',
    
    // API 기본 설정 - 단기예보로 변경
    BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst',
    
    // 구장별 지점번호 매핑 (기상청 단기예보 지점번호)
    STADIUM_NX_CODES: {
        '잠실': '62', // 서울
        '문학': '55', // 인천
        '고척': '58', // 서울
        '사직': '59', // 부산
        '대구': '91', // 대구
        '광주': '59', // 광주
        '대전': '68', // 대전
        '수원': '60', // 수원
        '창원': '89'  // 창원
    },

    STADIUM_NY_CODES: {
        '잠실': '125', // 서울
        '문학': '124', // 인천
        '고척': '125', // 서울
        '사직': '74', // 부산
        '대구': '90', // 대구
        '광주': '74', // 광주
        '대전': '100', // 대전
        '수원': '21',  // 수원
        '창원': '77' // 창원
    }
};

// 설정을 전역으로 사용할 수 있도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WEATHER_CONFIG;
} 