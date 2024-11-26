/**
 * postRenderer.js - 게시글 렌더링 모듈
 * 일정, 커뮤니티 게시글, 공지사항 등 각종 게시글의 UI 렌더링을 담당
 */

import { mockData } from './mockData.js';
import { getCurrentUser } from './authState.js';

/**
 * 날짜 문자열을 Date 객체로 파싱하는 유틸리티 함수
 * "MM월 DD일" 형식의 문자열을 Date 객체로 변환
 *
 * @param {string} dateStr - 파싱할 날짜 문자열 (예: "11월 15일")
 * @returns {Date} 파싱된 Date 객체
 */
function parseDate(dateStr) {
    const [month, day] = dateStr.replace('월 ', '/').replace('일', '').split('/');
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, parseInt(month) - 1, parseInt(day));
}

/**
 * 선택된 날짜의 제목을 업데이트하는 함수
 * @param {string} date - YYYY-MM-DD 형식의 날짜 문자열
 */
export function updateSelectedDateTitle(date) {
    const formattedDate = new Date(date);
    const month = formattedDate.getMonth() + 1;
    const day = formattedDate.getDate();
    document.getElementById('selectedDate').textContent = `${month}월 ${day}일의 일정 게시글 목록`;
}

/**
 * 특정 날짜의 일정을 렌더링하는 함수
 * @param {string} date - YYYY-MM-DD 형식의 날짜 문자열
 */
export function renderDayEvents(date) {
    const currentUser = getCurrentUser();

    // 일정 필터링 및 정렬
    const events = mockData.events
        // 비공개 일정은 작성자만 볼 수 있도록 필터링
        .filter((event) => {
            if (event.isPrivate) {
                return event.author === currentUser?.username;
            }
            return true;
        })
        // 선택된 날짜의 일정만 필터링
        .filter((event) => event.date === date)
        // 시간순으로 정렬
        .sort((a, b) => {
            const timeA = parseInt(a.time.replace(':', ''));
            const timeB = parseInt(b.time.replace(':', ''));
            return timeA - timeB;
        });

    // 일정 목록 HTML 생성
    const listHtml = events
        .map(
            (event) => `
        <div class="list-group-item" data-event-id="${event.id}">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <span class="event-time">${event.time}</span>
                    <h6 class="mb-0">${event.title}</h6>
                    ${event.important ? '<span class="badge bg-danger">중요</span>' : ''}
                </div>
            </div>
        </div>
    `
        )
        .join('');

    // DOM 업데이트
    document.querySelector('.posts-card .list-group').innerHTML = listHtml;
}

/**
 * 커뮤니티 게시글 목록을 렌더링하는 함수
 * 최신 글이 상단에 오도록 날짜순으로 정렬하여 표시
 */
export function renderCommunityPosts() {
    // 날짜 기준 내림차순 정렬
    const sortedPosts = [...mockData.community].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });

    // 게시글 목록 HTML 생성
    const listHtml = sortedPosts
        .map(
            (post) => `
            <div class="list-group-item" data-post-id="${post.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${post.title}</h6>
                    <small>${post.author} · ${post.date}</small>
                </div>
            </div>
        `
        )
        .join('');

    // DOM 업데이트
    document.querySelector('.untagged-card .list-group').innerHTML = listHtml;
}

/**
 * 공지사항 목록을 렌더링하는 함수
 * 최신 공지가 상단에 오도록 날짜순으로 정렬하여 표시
 */
export function renderNotices() {
    // 날짜 기준 내림차순 정렬
    const sortedNotices = [...mockData.notices].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });

    // 공지사항 목록 HTML 생성
    const listHtml = sortedNotices
        .map(
            (notice) => `
            <div class="list-group-item" data-post-id="${notice.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${notice.title}</h6>
                    <small>${notice.author} · ${notice.date}</small>
                </div>
            </div>
        `
        )
        .join('');

    // DOM 업데이트
    document.querySelector('.notice-card .list-group').innerHTML = listHtml;
}
