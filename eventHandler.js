/**
 * eventHandler.js - 이벤트 핸들러 관리 모듈
 * 애플리케이션의 전역 이벤트 핸들러를 초기화하고 관리하는 모듈
 */

import { initializeDate, prevMonth, nextMonth, setSelectedDate } from './calendarState.js';
import { updateCalendarHeader, renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices, updateSelectedDateTitle } from './postRenderer.js';
import { initializeModalHandlers } from './modalHandler.js';
import { initializeWriteModal } from './writeModal.js';

/**
 * 애플리케이션의 모든 이벤트 핸들러를 초기화하는 함수
 * DOM이 로드된 후 캘린더, 게시판, 모달 등의 모든 UI 요소를 초기화하고
 * 필요한 이벤트 리스너를 등록
 *
 * @example
 * initializeEventHandlers();
 */
export function initializeEventHandlers() {
    document.addEventListener('DOMContentLoaded', () => {
        // 캘린더 초기 상태 설정
        initializeDate();
        updateCalendarHeader();

        /**
         * 오늘 날짜를 YYYY-MM-DD 형식으로 변환하여 기본 선택으로 설정
         * padStart를 사용하여 월과 일이 항상 2자리로 표시되도록 함
         */
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 오늘 날짜를 선택된 날짜로 설정
        setSelectedDate(todayString);

        // 초기 UI 렌더링
        renderCalendar(); // 캘린더 렌더링
        renderCommunityPosts(); // 커뮤니티 게시글 렌더링
        renderNotices(); // 공지사항 렌더링
        renderDayEvents(todayString); // 오늘의 일정 렌더링
        updateSelectedDateTitle(todayString); // 선택된 날짜 제목 업데이트

        // 모달 초기화
        initializeWriteModal(); // 글쓰기 모달 초기화
        initializeModalHandlers(); // 기타 모달 핸들러 초기화

        /**
         * 이전 월 버튼 클릭 이벤트 핸들러
         * 캘린더를 이전 월로 이동하고 UI를 업데이트
         */
        document.getElementById('prevMonth').addEventListener('click', () => {
            prevMonth();
            updateCalendarHeader();
            renderCalendar();
        });

        /**
         * 다음 월 버튼 클릭 이벤트 핸들러
         * 캘린더를 다음 월로 이동하고 UI를 업데이트
         */
        document.getElementById('nextMonth').addEventListener('click', () => {
            nextMonth();
            updateCalendarHeader();
            renderCalendar();
        });

        /**
         * 캘린더 날짜 셀 클릭 이벤트 핸들러
         * 선택된 날짜의 일정을 표시하고 UI를 업데이트
         */
        document.querySelector('.calendar').addEventListener('click', (e) => {
            const cell = e.target.closest('td');
            // 빈 날짜 셀이 아닌 경우에만 처리
            if (cell && !cell.classList.contains('empty-day')) {
                const date = cell.dataset.date;
                setSelectedDate(date); // 선택된 날짜 업데이트
                renderCalendar(); // 캘린더 UI 업데이트
                renderDayEvents(date); // 해당 날짜의 일정 표시
                updateSelectedDateTitle(date); // 날짜 제목 업데이트
            }
        });
    });
}

// TODO:
// - 이벤트 리스너 cleanup 로직 추가
// - 이벤트 위임(delegation) 패턴 적용 확대
// - 이벤트 핸들러 디바운싱/쓰로틀링 적용
// - 에러 핸들링 강화
// - 이벤트 핸들러 성능 최적화
