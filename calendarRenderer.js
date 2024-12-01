/**
 * calendarRenderer.js - 캘린더 렌더링 모듈
 * 달력 UI를 생성하고 관리하는 핵심 렌더링 로직을 담당
 */

import { getCurrentYear, getCurrentMonth, getSelectedDate } from './calendarState.js';

/**
 * 서버에서 현재 사용자의 인증 상태를 확인하는 함수입니다.
 * PHP 세션을 통해 로그인된 사용자 정보를 가져옵니다.
 */
async function getAuthStatus() {
    try {
        const response = await fetch('./auth/checkAuth.php');
        if (!response.ok) throw new Error('인증 확인 실패');
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        return null;
    }
}

/**
 * 특정 연월의 이벤트 데이터를 서버에서 조회하는 함수입니다.
 * 서버로부터 받은 데이터를 가공하여 캘린더에서 사용할 수 있는 형태로 변환합니다.
 */
async function getMonthEvents(year, month) {
    try {
        // month를 2자리 숫자로 변환
        const paddedMonth = month.toString().padStart(2, '0');
        console.log(`이벤트 조회 시도: ${year}년 ${paddedMonth}월`);

        const response = await fetch(`./api/events/list.php?year=${year}&month=${paddedMonth}`);
        const data = await response.json();
        console.log('서버 응답:', data);

        if (data.success && Array.isArray(data.events)) {
            return data.events;
        } else {
            console.error('잘못된 데이터 형식:', data);
            return [];
        }
    } catch (error) {
        console.error('이벤트 조회 중 오류:', error);
        return [];
    }
}

/**
 * 캘린더 헤더의 연월 표시를 업데이트하는 함수입니다.
 */
export function updateCalendarHeader() {
    document.getElementById('currentMonth').textContent = `${getCurrentYear()}년 ${getCurrentMonth()}월`;
}

function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
}

function generateEventHtml(events, currentUser) {
    return events
        .filter((event) => {
            // 비공개 일정은 작성자 본인만 볼 수 있음
            if (event.is_private) {
                return event.author === currentUser?.username;
            }
            return true;
        })
        .sort((a, b) => {
            // 시간순 정렬
            const timeA = parseInt(a.time.replace(':', ''));
            const timeB = parseInt(b.time.replace(':', ''));
            return timeA - timeB;
        })
        .map(
            (event) => `
        <div class="post-title ${event.important === '1' ? 'important' : ''}" data-event-id="${event.id}">
            <span class="post-time">${formatTime(event.time)}</span>
            ${event.title}
        </div>
    `
        )
        .join('');
}

/**
 * 달력 HTML을 생성하는 함수입니다.
 * 현재 연월의 모든 날짜와 각 날짜의 이벤트를 포함한 캘린더를 생성합니다.
 */
export async function generateCalendar() {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const lastDay = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const selectedDate = getSelectedDate();

    // 인증 상태와 이벤트 데이터를 병렬로 조회
    console.log('데이터 조회 시작...');
    const [currentUser, monthEvents] = await Promise.all([getAuthStatus(), getMonthEvents(year, month)]);
    console.log('조회된 이벤트:', monthEvents);

    let calendar = '';
    let dayCount = 1;

    // 6주 단위로 달력 생성
    for (let week = 0; week < 6; week++) {
        let row = '<tr>';

        // 각 주의 7일을 생성
        for (let day = 0; day < 7; day++) {
            if ((week === 0 && day < firstDayOfWeek) || dayCount > lastDay) {
                row += '<td class="empty-day"></td>';
            } else if (dayCount <= lastDay) {
                const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;

                // 해당 날짜의 이벤트 필터링
                // 해당 날짜의 이벤트 필터링 부분 수정
                const dayEvents = monthEvents.filter((event) => {
                    console.log(`이벤트 비교: ${event.date} vs ${dateString}`);
                    console.log('이벤트 객체:', event);
                    return event.date === dateString;
                });
                console.log(`${dateString} 날짜의 필터링된 이벤트:`, dayEvents);

                // 날짜 상태 확인
                const isWeekend = day === 0 || day === 6;
                const isToday = new Date().toDateString() === new Date(year, month - 1, dayCount).toDateString();
                const isSelected = dateString === selectedDate;

                // 날짜 셀 HTML 생성
                row += `
                    <td class="${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected-date' : ''}"
                        data-date="${dateString}">
                        <div class="date-number">${dayCount}</div>
                        ${generateEventHtml(dayEvents, currentUser)}
                    </td>
                `;
                dayCount++;
            }
        }
        row += '</tr>';
        calendar += row;

        if (dayCount > lastDay) break;
    }
    return calendar;
}

/**
 * 생성된 캘린더 HTML을 DOM에 렌더링하는 함수입니다.
 * 에러 발생 시 사용자에게 적절한 피드백을 제공합니다.
 */
export async function renderCalendar() {
    const calendarBody = document.querySelector('.calendar table tbody');
    try {
        calendarBody.innerHTML = '<tr><td colspan="7" class="text-center">캘린더를 불러오는 중...</td></tr>';
        const calendarHtml = await generateCalendar();
        calendarBody.innerHTML = calendarHtml;
    } catch (error) {
        console.error('캘린더 렌더링 중 오류:', error);
        calendarBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    캘린더를 불러오는 중 오류가 발생했습니다.<br>
                    <small>잠시 후 다시 시도해주세요.</small>
                </td>
            </tr>
        `;
    }
}
