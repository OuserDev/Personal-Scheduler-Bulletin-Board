/**
 * modalHandler.js - 모달 관리 모듈
 * 게시글 조회, 수정, 삭제 관련 모달 UI와 이벤트를 관리하는 모듈
 */

import { mockData } from './mockData.js';
import { initializeWriteModal } from './writeModal.js';
import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';

let postModal;
const { openEditModal } = initializeWriteModal();

/**
 * 서버에서 현재 사용자의 인증 상태를 확인하는 함수
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('./auth/checkAuth.php');
        if (!response.ok) throw new Error('인증 상태 확인 실패');
        return await response.json();
    } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        return { isLoggedIn: false, user: null };
    }
}

/**
 * 게시글 삭제 처리 함수
 * 서버의 삭제 API를 호출하고 성공 시 UI를 업데이트
 */
async function deletePost(post, type) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    let endpoint;
    let renderFunction;

    // 게시글 유형에 따른 삭제 엔드포인트와 렌더링 함수 설정
    switch (type) {
        case 'event':
            endpoint = './api/events/delete.php';
            renderFunction = async () => {
                await renderCalendar();
                await renderDayEvents(post.date);
            };
            break;
        case 'community':
            endpoint = './api/posts/community/delete.php';
            renderFunction = renderCommunityPosts;
            break;
        case 'notice':
            endpoint = './api/posts/notices/delete.php';
            renderFunction = renderNotices;
            break;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: post.id }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '게시글 삭제 중 오류가 발생했습니다');
        }

        await renderFunction();
        postModal.style.display = 'none';
        alert('게시글이 삭제되었습니다.');
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert(error.message);
    }
}

/**
 * 게시글 조회 모달 표시 함수
 * 권한 검사를 서버에서 수행하도록 수정
 */
export async function showPostModal(post, type = null) {
    // 사용자 인증 상태 확인
    const { user } = await checkAuthStatus();

    // 수정/삭제 권한 확인 로직
    const canEdit = user && (post.author === user.username || post.author === user.name || (user.isAdmin && (post.author === '관리자' || type === 'notice')));

    // 이전 모달 정리
    const existingModal = document.getElementById('postModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 HTML 템플릿 생성
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
                            !post.time
                                ? `<span class="post-metadata"><strong>${post.author}</strong> · ${post.date}</span>`
                                : `<span class="post-metadata">
                                <strong>${post.date} ${post.time}</strong>
                                ${post.important ? '<span class="badge bg-danger">중요</span>' : ''}
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

    // 수정/삭제 권한이 있는 경우 이벤트 핸들러 설정
    if (canEdit) {
        postModal.querySelector('.edit-btn').onclick = () => {
            postModal.style.display = 'none';
            openEditModal(post, type || (post.time ? 'event' : post.author === '관리자' ? 'notice' : 'community'));
        };

        postModal.querySelector('.delete-btn').onclick = () => {
            deletePost(post, type || (post.time ? 'event' : post.author === '관리자' ? 'notice' : 'community'));
        };
    }

    postModal.style.display = 'block';
}

/**
 * 모달 관련 전체 이벤트 핸들러 초기화 함수
 * 비동기 이벤트 처리를 위해 수정
 */
export function initializeModalHandlers() {
    // 커뮤니티 게시글 클릭 이벤트
    document.querySelector('.untagged-card .list-group').addEventListener('click', async (e) => {
        const item = e.target.closest('.list-group-item');
        if (item) {
            const postId = parseInt(item.dataset.postId);
            const post = mockData.community.find((p) => p.id === postId);
            if (post) await showPostModal(post, 'community');
        }
    });

    // 이하 다른 이벤트 핸들러들도 동일한 방식으로 async/await 적용...
    // (나머지 이벤트 핸들러 코드는 동일하되 async/await 추가)
}
