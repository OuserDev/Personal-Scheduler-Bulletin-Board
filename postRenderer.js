/**
 * postRenderer.js - 게시글 렌더링 모듈
 * 일정, 커뮤니티 게시글, 공지사항 등 각종 게시글의 UI 렌더링을 담당
 */

import { mockData } from './mockData.js';
import { showPostModal } from './modalHandler.js';

/**
 * 서버에서 현재 인증 상태를 확인하는 함수
 * @returns {Promise<Object>} 사용자 정보를 포함한 인증 상태 객체
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('./auth/checkAuth.php');
        if (!response.ok) {
            throw new Error('인증 상태 확인 실패');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        return { isLoggedIn: false, user: null };
    }
}

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
 * PHP 세션 기반 인증을 사용하도록 수정
 * @param {string} date - YYYY-MM-DD 형식의 날짜 문자열
 */
export async function renderDayEvents(date) {
    try {
        const response = await fetch(`./api/events/list.php?date=${date}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '일정을 불러오는데 실패했습니다.');
        }

        const events = data.events
            .filter((event) => event.date === date)
            .sort((a, b) => {
                const timeA = parseInt(a.time.replace(':', ''));
                const timeB = parseInt(b.time.replace(':', ''));
                return timeA - timeB;
            });

        const listHtml = events
            .map(
                (event) => `
            <div class="list-group-item" data-event-id="${event.id}">
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <span class="event-time">${event.time}</span>
                        <h6 class="mb-0">${event.title}</h6>
                        ${event.important === '1' || event.important === true ? '<span class="badge bg-danger">중요</span>' : ''}
                    </div>
                </div>
            </div>
        `
            )
            .join('');

        const listGroup = document.querySelector('.posts-card .list-group');
        listGroup.innerHTML = listHtml;

        // ... 나머지 코드
    } catch (error) {
        console.error('일정 목록 렌더링 중 오류:', error);
    }
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
