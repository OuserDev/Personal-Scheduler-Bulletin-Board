/**
 * postRenderer.js
 *
 * 웹사이트의 모든 게시글 표시를 담당하는 파일
 * 일정, 커뮤니티 글, 공지사항 등 모든 글의 화면 출력 처리
 */

import { showPostModal } from './modalHandler.js';

/**
 * 날짜를 "MM월 DD일" 형식으로 변환
 * 2024-12-25 -> 12월 25일
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 자바스크립트는 월이 0부터 시작하므로 1을 더함
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

/**
 * 선택된 날짜로 화면 제목 변경
 * "MM월 DD일의 일정 게시글 목록" 형태로 표시
 */
export function updateSelectedDateTitle(date) {
    const formattedDate = new Date(date);
    const month = formattedDate.getMonth() + 1;
    const day = formattedDate.getDate();
    document.getElementById('selectedDate').textContent = `${month}월 ${day}일의 일정 게시글 목록`;
}

/**
 * 특정 날짜의 일정들을 화면에 표시
 * 1. 해당 날짜의 일정을 서버에서 조회
 * 2. 시간 순으로 정렬
 * 3. 각 일정의 제목, 시간, 중요 표시를 포함한 HTML 생성
 * 4. 일정이 없을 경우 "등록된 일정이 없습니다" 메시지 표시
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
                // 시간을 숫자로 변환해서 정렬 (예: "09:30" -> 930)
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
 * 커뮤니티 게시글 목록을 화면에 표시
 * 1. 서버에서 커뮤니티 게시글 목록 조회
 * 2. 각 게시글의 제목, 작성자, 작성일을 보여주는 HTML 생성
 * 3. 게시글 클릭 시 상세 내용을 모달로 표시
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

        // 각 게시글에 클릭 이벤트 추가 - 클릭하면 상세 내용 모달로 표시
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
 * 공지사항 목록을 화면에 표시
 * 1. 서버에서 공지사항 목록 조회
 * 2. 각 공지사항의 제목, 작성자, 작성일을 보여주는 HTML 생성
 * 3. 공지사항 클릭 시 상세 내용을 모달로 표시
 */
export async function renderNotices() {
    try {
        const response = await fetch('./api/posts/list.php?type=notice');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '공지사항을 불러오는데 실패했습니다.');
        }

        // 공지사항 목록을 HTML로 변환
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

        // 각 공지사항에 클릭 이벤트 추가 - 클릭하면 상세 내용 모달로 표시
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
