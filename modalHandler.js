/**
 * modalHandler.js - 모달 관리 모듈
 * 게시글 조회, 수정, 삭제 관련 모달 UI와 이벤트를 관리하는 모듈
 */

import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';
import { initializeWriteModal } from './writeModal.js';

let postModal;
const { openEditModal } = initializeWriteModal();

/**
 * 게시글 삭제 처리 함수
 * 서버의 삭제 API를 호출하고 성공 시 UI를 업데이트
 */
async function deletePost(post, type) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        // API 엔드포인트 설정
        const endpoint = './api/events/delete.php';

        // 삭제 요청
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

        // UI 업데이트
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

        // 모달 닫기
        if (postModal) {
            postModal.style.display = 'none';
        }

        alert('게시글이 삭제되었습니다.');
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert(error.message || '게시글 삭제에 실패했습니다.');
    }
}

/**
 * 게시글 조회 모달 표시 함수
 */
export async function showPostModal(post, type = 'event') {
    // 사용자 인증 상태 확인
    const authResponse = await fetch('./auth/checkAuth.php');
    const { isLoggedIn, user } = await authResponse.json();

    // 수정/삭제 권한 확인 로직
    const canEdit = isLoggedIn && (post.author === user.username || (user.isAdmin && type === 'notice'));

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
                                ${post.important === '1' || post.important === true ? '<span class="badge bg-danger">중요</span>' : ''}
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
        // 수정 버튼 클릭 이벤트
        postModal.querySelector('.edit-btn').onclick = () => {
            postModal.style.display = 'none';
            openEditModal(post, type);
        };

        // 삭제 버튼 클릭 이벤트
        postModal.querySelector('.delete-btn').onclick = () => {
            deletePost(post, type);
        };
    }

    // 닫기 버튼 이벤트
    postModal.querySelector('.close-btn').onclick = () => {
        postModal.style.display = 'none';
    };

    // 모달 표시
    postModal.style.display = 'block';
}

/**
 * 모달 관련 전체 이벤트 핸들러 초기화 함수
 */
export function initializeModalHandlers() {
    // 날짜별 일정 클릭 이벤트
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

    // 캘린더의 일정 클릭 이벤트
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
