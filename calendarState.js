/**
 * calendarState.js - 캘린더 상태 관리 모듈
 * 캘린더의 현재 연도, 월, 선택된 날짜 등의 상태를 관리하는 모듈
 */

/**
 * 현재 표시중인 연도
 * @type {number}
 */
let currentYear;

/**
 * 현재 표시중인 월 (1-12)
 * @type {number}
 */
let currentMonth;

/**
 * 현재 선택된 날짜 (YYYY-MM-DD 형식)
 * @type {string|null}
 */
let selectedDate = null;

/**
 * 캘린더의 초기 날짜를 오늘 날짜로 설정하는 함수
 * 애플리케이션 시작 시 호출되어야 함
 *
 * @example
 * initializeDate();
 * // currentYear와 currentMonth가 현재 날짜 기준으로 설정됨
 */
export function initializeDate() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1; // JavaScript의 월은 0부터 시작하므로 1을 더함
}

/**
 * 현재 표시중인 연도를 반환하는 함수
 * @returns {number} 현재 연도
 *
 * @example
 * const year = getCurrentYear(); // 예: 2024
 */
export function getCurrentYear() {
    return currentYear;
}

/**
 * 현재 표시중인 월을 반환하는 함수
 * @returns {number} 현재 월 (1-12)
 *
 * @example
 * const month = getCurrentMonth(); // 예: 11
 */
export function getCurrentMonth() {
    return currentMonth;
}

/**
 * 현재 선택된 날짜를 반환하는 함수
 * @returns {string|null} 선택된 날짜 (YYYY-MM-DD 형식) 또는 null
 *
 * @example
 * const selected = getSelectedDate(); // 예: "2024-11-15" 또는 null
 */
export function getSelectedDate() {
    return selectedDate;
}

/**
 * 선택된 날짜를 설정하는 함수
 * @param {string} date - 설정할 날짜 (YYYY-MM-DD 형식)
 *
 * @example
 * setSelectedDate("2024-11-15");
 */
export function setSelectedDate(date) {
    selectedDate = date;
}

/**
 * 이전 월로 이동하는 함수
 * 필요한 경우 연도도 자동으로 감소
 * @returns {{currentYear: number, currentMonth: number}} 업데이트된 연도와 월
 *
 * @example
 * const { currentYear, currentMonth } = prevMonth();
 * // 12월에서 이전 월로 이동 시 연도가 감소하고 월이 12로 설정됨
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
 * @returns {{currentYear: number, currentMonth: number}} 업데이트된 연도와 월
 *
 * @example
 * const { currentYear, currentMonth } = nextMonth();
 * // 12월에서 다음 월로 이동 시 연도가 증가하고 월이 1로 설정됨
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
