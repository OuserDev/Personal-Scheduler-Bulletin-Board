/**
 * modalHandler.js
 *
 * 모달창 관리 파일
 * 게시글 보기/수정/삭제를 위한 팝업창(모달) 처리
 */

import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';
import { initializeWriteModal } from './writeModal.js';

let postModal;
const { openEditModal } = initializeWriteModal();

/**
 * 게시글 삭제 기능
 * 1. 삭제 확인 창 표시
 * 2. API로 삭제 요청
 * 3. 삭제 후 화면 갱신
 */
async function deletePost(post, type) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        // 일정과 게시글의 삭제 주소가 다름
        const endpoint = type === 'event' ? './api/events/delete.php' : './api/posts/delete.php';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: post.id,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '게시글 삭제 중 오류가 발생했습니다');
        }

        // 게시글 종류에 따라 다른 화면 갱신
        switch (type) {
            case 'event':
                await renderCalendar();
                await renderDayEvents(post.date);
                break;
            case 'community':
                await renderCommunityPosts();
                break;
            case 'notice':
                await renderNotices();
                break;
        }

        postModal.style.display = 'none';
        alert('게시글이 삭제되었습니다.');
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert(error.message || '게시글 삭제에 실패했습니다.');
    }
}

/**
 * 게시글 상세 보기 모달창 표시
 * 1. 로그인 상태 확인
 * 2. 수정/삭제 권한 확인
 * 3. 모달창 HTML 생성
 * 4. 권한이 있는 경우 수정/삭제 버튼 추가
 */
export async function showPostModal(post, type = 'event') {
    try {
        // 로그인 확인
        const authResponse = await fetch('./auth/checkAuth.php');
        const { isLoggedIn, user } = await authResponse.json();

        // 본인 글이거나 관리자면 수정/삭제 가능
        const canEdit = isLoggedIn && (post.author === user.username || (user.isAdmin && (type === 'notice' || type === 'community')));

        // 이전 모달창 제거
        const existingModal = document.getElementById('postModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 날짜 형식 맞추기
        const formattedDate =
            type === 'event'
                ? `${post.date} ${post.time}`
                : new Date(post.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  });

        // 모달창 HTML 만들기
        document.body.insertAdjacentHTML(
            'beforeend',
            `
           <div id="postModal" class="modal">
               <div class="modal-content">
                   <div class="modal-header">
                       <h5 class="modal-title">${post.title}</h5>
                       <div class="d-flex gap-2 align-items-center">
                           ${
                               canEdit
                                   ? `
                               <button class="btn btn-outline-danger btn-sm delete-btn">삭제</button>
                               <button class="btn btn-outline-primary btn-sm edit-btn">수정</button>
                           `
                                   : ''
                           }
                           <button class="close-btn">&times;</button>
                       </div>
                   </div>
                   <div class="modal-body">
                       <div class="post-info">
                           ${
                               type === 'event'
                                   ? `<span class="post-metadata">
                                   <strong>${formattedDate}</strong>
                                   ${post.important === '1' || post.important === true ? '<span class="badge bg-danger">중요</span>' : ''}
                                  </span>`
                                   : `<span class="post-metadata">
                                   <strong>${post.author_name}</strong> · ${formattedDate}
                                  </span>`
                           }
                       </div>
                       <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
                   </div>
               </div>
           </div>
       `
        );

        postModal = document.getElementById('postModal');

        // 수정/삭제 권한 있으면 버튼 기능 추가
        if (canEdit) {
            postModal.querySelector('.edit-btn').onclick = () => {
                postModal.style.display = 'none';
                openEditModal(post, type);
            };

            postModal.querySelector('.delete-btn').onclick = () => {
                deletePost(post, type);
            };
        }

        // 닫기 버튼
        postModal.querySelector('.close-btn').onclick = () => {
            postModal.style.display = 'none';
        };

        // 모달창 표시
        postModal.style.display = 'block';
    } catch (error) {
        console.error('모달 표시 중 오류:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 모든 모달 관련 클릭 이벤트 설정
 * 1. 일정표에서 일정 클릭
 * 2. 캘린더에서 일정 클릭
 */
export function initializeModalHandlers() {
    // 일정표의 일정 클릭
    document.querySelector('.posts-card .list-group').addEventListener('click', async (e) => {
        const item = e.target.closest('.list-group-item');
        if (item) {
            try {
                const eventId = item.dataset.eventId;
                const response = await fetch(`./api/events/view.php?id=${eventId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '게시글을 불러올 수 없습니다.');
                }

                await showPostModal(data.event, 'event');
            } catch (error) {
                console.error('게시글 조회 실패:', error);
                alert(error.message);
            }
        }
    });

    // 캘린더의 일정 클릭
    document.querySelector('.calendar').addEventListener('click', async (e) => {
        const eventTitle = e.target.closest('.post-title');
        if (eventTitle) {
            try {
                const eventId = eventTitle.dataset.eventId;
                const response = await fetch(`./api/events/view.php?id=${eventId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '게시글을 불러올 수 없습니다.');
                }

                await showPostModal(data.event, 'event');
            } catch (error) {
                console.error('게시글 조회 실패:', error);
                alert(error.message);
            }
        }
    });
}
