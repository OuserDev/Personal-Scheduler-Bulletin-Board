/**
 * calendarRenderer.js - 캘린더 렌더링 모듈
 * 달력 UI를 생성하고 관리하는 핵심 렌더링 로직을 담당
 */

import { mockData } from './mockData.js';
import { getCurrentYear, getCurrentMonth, getSelectedDate } from './calendarState.js';
import { getCurrentUser } from './authState.js';

/**
 * 캘린더 헤더의 연월 표시를 업데이트하는 함수
 * @example
 * updateCalendarHeader(); // "2024년 11월" 형식으로 표시
 */
export function updateCalendarHeader() {
    document.getElementById('currentMonth').textContent = `${getCurrentYear()}년 ${getCurrentMonth()}월`;
}

/**
 * 달력 HTML을 생성하는 함수
 * @returns {string} 달력 테이블의 tbody 내용이 될 HTML 문자열
 */
export function generateCalendar() {
    // 달력 생성에 필요한 기본 정보 설정
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const lastDay = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날짜
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 1일의 요일 (0: 일요일)
    const selectedDate = getSelectedDate();
    const currentUser = getCurrentUser();

    let calendar = '';
    let dayCount = 1;

    // 6주 단위로 달력 생성 (최대 6주)
    for (let week = 0; week < 6; week++) {
        let row = '<tr>';

        // 각 주의 7일을 생성
        for (let day = 0; day < 7; day++) {
            // 첫 주의 시작 전이거나 마지막 날 이후인 경우 빈 셀
            if ((week === 0 && day < firstDayOfWeek) || dayCount > lastDay) {
                row += '<td class="empty-day"></td>';
            } else if (dayCount <= lastDay) {
                // 날짜 문자열 생성 (YYYY-MM-DD 형식)
                const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;

                // 해당 날짜의 이벤트 필터링 및 정렬
                const dayEvents = mockData.events
                    .filter((event) => {
                        // 비공개 일정은 작성자 본인만 볼 수 있음
                        if (event.isPrivate) {
                            return event.author === currentUser?.username;
                        }
                        return true;
                    })
                    // 해당 날짜의 이벤트만 선택
                    .filter((event) => event.date === dateString)
                    // 시간순으로 정렬
                    .sort((a, b) => {
                        const timeA = parseInt(a.time.replace(':', ''));
                        const timeB = parseInt(b.time.replace(':', ''));
                        return timeA - timeB;
                    });

                // 특별한 날짜 상태 체크
                const isWeekend = day === 0 || day === 6;
                const isToday = new Date().toDateString() === new Date(year, month - 1, dayCount).toDateString();
                const isSelected = dateString === selectedDate;

                // 이벤트 목록 HTML 생성
                let eventHtml = dayEvents
                    .map(
                        (event) => `
                        <div class="post-title ${event.important ? 'important' : ''}" data-event-id="${event.id}">
                            <span class="post-time">${event.time}</span>
                            ${event.title}
                        </div>
                    `
                    )
                    .join('');

                // 날짜 셀 HTML 생성
                row += `
                    <td class="${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected-date' : ''}"
                        data-date="${dateString}">
                        <div class="date-number">${dayCount}</div>
                        ${eventHtml}
                    </td>
                `;
                dayCount++;
            }
        }
        row += '</tr>';
        calendar += row;

        // 월의 마지막 날까지 처리했으면 종료
        if (dayCount > lastDay) {
            break;
        }
    }
    return calendar;
}

/**
 * 생성된 캘린더 HTML을 DOM에 렌더링하는 함수
 * @example
 * renderCalendar();
 */
export function renderCalendar() {
    document.querySelector('.calendar table tbody').innerHTML = generateCalendar();
}
