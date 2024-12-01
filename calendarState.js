/**
 * calendarState.js - 캘린더 상태 관리 모듈
 * 캘린더의 현재 연도, 월, 선택된 날짜 등의 상태를 관리하는 모듈
 */

let currentYear;
let currentMonth;
let selectedDate = null;

/**
 * 캘린더의 초기 날짜를 오늘 날짜로 설정하는 함수
 * 애플리케이션 시작 시 호출되어야 함
 */
export function initializeDate() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1; // JavaScript의 월은 0부터 시작하므로 1을 더함
}

/**
 * 현재 표시중인 연도를 반환하는 함수
 */
export function getCurrentYear() {
    return currentYear;
}

/**
 * 현재 표시중인 월을 반환하는 함수
 */
export function getCurrentMonth() {
    return currentMonth;
}

/**
 * 현재 선택된 날짜를 반환하는 함수
 */
export function getSelectedDate() {
    return selectedDate;
}

/**
 * 선택된 날짜를 설정하는 함수
 */
export function setSelectedDate(date) {
    selectedDate = date;
}

/**
 * 이전 월로 이동하는 함수
 * 필요한 경우 연도도 자동으로 감소
 */
export function prevMonth() {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    selectedDate = null; // 월이 변경되면 선택된 날짜 초기화
    return { currentYear, currentMonth };
}

/**
 * 다음 월로 이동하는 함수
 * 필요한 경우 연도도 자동으로 증가
 */
export function nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    selectedDate = null; // 월이 변경되면 선택된 날짜 초기화
    return { currentYear, currentMonth };
}
