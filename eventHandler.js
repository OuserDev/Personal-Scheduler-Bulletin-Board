/**
 * eventHandler.js
 *
 * 웹사이트의 모든 이벤트(클릭, 날짜 선택 등) 관리
 * 캘린더, 게시판, 팝업창 등의 동작 처리
 */

import { initializeDate, prevMonth, nextMonth, setSelectedDate } from './calendarState.js';
import { updateCalendarHeader, renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices, updateSelectedDateTitle } from './postRenderer.js';
import { initializeModalHandlers } from './modalHandler.js';
import { initializeWriteModal } from './writeModal.js';

/**
 * 웹사이트 실행 시 필요한 모든 기능 초기화
 * 1. 캘린더 초기 설정
 * 2. 오늘 날짜 처리
 * 3. 화면 표시
 * 4. 각종 버튼 연결
 */
export function initializeEventHandlers() {
    document.addEventListener('DOMContentLoaded', () => {
        // 캘린더 기본 설정
        initializeDate();
        updateCalendarHeader();

        // 오늘 날짜 YYYY-MM-DD 형식으로 변환
        // 예: 2024-12-25
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 오늘 날짜 선택하고 화면에 표시
        setSelectedDate(todayString);
        renderCalendar(); // 캘린더
        renderCommunityPosts(); // 커뮤니티 글 목록
        renderNotices(); // 공지사항 목록
        renderDayEvents(todayString); // 오늘 일정
        updateSelectedDateTitle(todayString); // 날짜 제목

        // 팝업창 설정
        initializeWriteModal(); // 글쓰기 창
        initializeModalHandlers(); // 기타 팝업창

        // 이전/다음 달 버튼
        document.getElementById('prevMonth').addEventListener('click', () => {
            prevMonth();
            updateCalendarHeader();
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            nextMonth();
            updateCalendarHeader();
            renderCalendar();
        });

        // 날짜 선택시
        document.querySelector('.calendar').addEventListener('click', (e) => {
            const cell = e.target.closest('td');
            // 빈 칸이 아닌 날짜만 처리
            if (cell && !cell.classList.contains('empty-day')) {
                const date = cell.dataset.date;
                setSelectedDate(date); // 선택한 날짜 저장
                renderCalendar(); // 캘린더 다시 그리기
                renderDayEvents(date); // 해당 날짜 일정 표시
                updateSelectedDateTitle(date); // 날짜 제목 변경
            }
        });
    });
}
