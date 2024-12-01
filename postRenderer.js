/**
 * postRenderer.js - 게시글 렌더링 모듈
 * 일정, 커뮤니티 게시글, 공지사항 등 각종 게시글의 UI 렌더링을 담당
 */

import { showPostModal } from './modalHandler.js';

/**
 * 서버에서 현재 인증 상태를 확인하는 함수
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
 * 날짜를 "MM월 DD일" 형식으로 포맷하는 함수
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

/**
 * 선택된 날짜의 제목을 업데이트하는 함수
 */
export function updateSelectedDateTitle(date) {
    const formattedDate = new Date(date);
    const month = formattedDate.getMonth() + 1;
    const day = formattedDate.getDate();
    document.getElementById('selectedDate').textContent = `${month}월 ${day}일의 일정 게시글 목록`;
}

/**
 * 특정 날짜의 일정을 렌더링하는 함수
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
        listGroup.innerHTML = listHtml || '<div class="text-center p-3">등록된 일정이 없습니다.</div>';
    } catch (error) {
        console.error('일정 목록 렌더링 중 오류:', error);
        document.querySelector('.posts-card .list-group').innerHTML = '<div class="text-center p-3 text-danger">일정을 불러오는데 실패했습니다.</div>';
    }
}

/**
 * 커뮤니티 게시글 목록을 렌더링하는 함수
 */
export async function renderCommunityPosts() {
    try {
        const response = await fetch('./api/posts/list.php?type=community');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '게시글을 불러오는데 실패했습니다.');
        }

        const listHtml = data.posts
            .map(
                (post) => `
                <div class="list-group-item" data-post-id="${post.id}" data-type="community">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${post.title}</h6>
                        <small>${post.author_name} · ${formatDate(post.created_at)}</small>
                    </div>
                </div>
            `
            )
            .join('');

        const listGroup = document.querySelector('.untagged-card .list-group');
        listGroup.innerHTML = listHtml || '<div class="text-center p-3">등록된 게시글이 없습니다.</div>';

        // 게시글 클릭 이벤트 핸들러 등록
        listGroup.querySelectorAll('.list-group-item').forEach((item) => {
            item.addEventListener('click', async () => {
                try {
                    const postId = item.dataset.postId;
                    const response = await fetch(`./api/posts/view.php?id=${postId}&type=community`);
                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.error || '게시글을 불러올 수 없습니다.');
                    }

                    await showPostModal(data.post, 'community');
                } catch (error) {
                    console.error('게시글 조회 실패:', error);
                    alert(error.message);
                }
            });
        });
    } catch (error) {
        console.error('커뮤니티 게시글 목록 렌더링 중 오류:', error);
        document.querySelector('.untagged-card .list-group').innerHTML = '<div class="text-center p-3 text-danger">게시글을 불러오는데 실패했습니다.</div>';
    }
}

/**
 * 공지사항 목록을 렌더링하는 함수
 */
export async function renderNotices() {
    try {
        const response = await fetch('./api/posts/list.php?type=notice');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '공지사항을 불러오는데 실패했습니다.');
        }

        const listHtml = data.posts
            .map(
                (notice) => `
                <div class="list-group-item" data-post-id="${notice.id}" data-type="notice">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${notice.title}</h6>
                        <small>${notice.author_name} · ${formatDate(notice.created_at)}</small>
                    </div>
                </div>
            `
            )
            .join('');

        const listGroup = document.querySelector('.notice-card .list-group');
        listGroup.innerHTML = listHtml || '<div class="text-center p-3">등록된 공지사항이 없습니다.</div>';

        // 공지사항 클릭 이벤트 핸들러 등록
        listGroup.querySelectorAll('.list-group-item').forEach((item) => {
            item.addEventListener('click', async () => {
                try {
                    const postId = item.dataset.postId;
                    const response = await fetch(`./api/posts/view.php?id=${postId}&type=notice`);
                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.error || '공지사항을 불러올 수 없습니다.');
                    }

                    await showPostModal(data.post, 'notice');
                } catch (error) {
                    console.error('공지사항 조회 실패:', error);
                    alert(error.message);
                }
            });
        });
    } catch (error) {
        console.error('공지사항 목록 렌더링 중 오류:', error);
        document.querySelector('.notice-card .list-group').innerHTML = '<div class="text-center p-3 text-danger">공지사항을 불러오는데 실패했습니다.</div>';
    }
}
