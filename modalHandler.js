/**
 * modalHandler.js - 모달 관리 모듈
 * 게시글 조회, 수정, 삭제 관련 모달 UI와 이벤트를 관리하는 모듈
 */

import { mockData } from './mockData.js';
import { getCurrentUser } from './authState.js';
import { initializeWriteModal } from './writeModal.js';
import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';

// 현재 표시중인 게시글 모달 참조
let postModal;
const { openEditModal } = initializeWriteModal();

/**
 * 게시글 삭제 처리 함수
 * @param {Object} post - 삭제할 게시글 객체
 * @param {string} type - 게시글 유형 ('event'|'community'|'notice')
 */
function deletePost(post, type) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    let targetArray;
    let renderFunction;

    // 게시글 유형에 따른 데이터 배열과 렌더링 함수 설정
    switch (type) {
        case 'event':
            targetArray = mockData.events;
            renderFunction = () => {
                renderCalendar();
                renderDayEvents(post.date);
            };
            break;
        case 'community':
            targetArray = mockData.community;
            renderFunction = renderCommunityPosts;
            break;
        case 'notice':
            targetArray = mockData.notices;
            renderFunction = renderNotices;
            break;
    }

    // 게시글 삭제 및 UI 업데이트
    const index = targetArray.findIndex((p) => p.id === post.id);
    if (index !== -1) {
        targetArray.splice(index, 1);
        renderFunction();
        postModal.style.display = 'none';
        alert('게시글이 삭제되었습니다.');
    }
}

/**
 * 게시글 조회 모달 표시 함수
 * @param {Object} post - 표시할 게시글 객체
 * @param {string|null} type - 게시글 유형 ('event'|'community'|'notice')
 */
export function showPostModal(post, type = null) {
    const currentUser = getCurrentUser();
    // 수정/삭제 권한 확인
    const canEdit = currentUser && (post.author === currentUser.username || post.author === currentUser.name || (currentUser.isAdmin && (post.author === '관리자' || type === 'notice')));

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
        // 수정 버튼 클릭 핸들러
        postModal.querySelector('.edit-btn').onclick = () => {
            postModal.style.display = 'none';
            // 게시글 유형 자동 감지
            openEditModal(post, type || (post.time ? 'event' : post.author === '관리자' ? 'notice' : 'community'));
        };

        // 삭제 버튼 클릭 핸들러
        postModal.querySelector('.delete-btn').onclick = () => {
            deletePost(post, type || (post.time ? 'event' : post.author === '관리자' ? 'notice' : 'community'));
        };
    }

    // 모달 표시
    postModal.style.display = 'block';
}

/**
 * 모달 관련 전체 이벤트 핸들러 초기화 함수
 * 게시글 클릭, ESC 키 등의 이벤트를 처리
 */
export function initializeModalHandlers() {
    // 커뮤니티 게시글 클릭 이벤트
    document.querySelector('.untagged-card .list-group').addEventListener('click', (e) => {
        const item = e.target.closest('.list-group-item');
        if (item) {
            const postId = parseInt(item.dataset.postId);
            const post = mockData.community.find((p) => p.id === postId);
            if (post) showPostModal(post, 'community');
        }
    });

    // 공지사항 클릭 이벤트
    document.querySelector('.notice-card .list-group').addEventListener('click', (e) => {
        const item = e.target.closest('.list-group-item');
        if (item) {
            const postId = parseInt(item.dataset.postId);
            const post = mockData.notices.find((p) => p.id === postId);
            if (post) showPostModal(post, 'notice');
        }
    });

    // 캘린더 일정 클릭 이벤트
    document.querySelector('.calendar').addEventListener('click', (e) => {
        const eventElement = e.target.closest('.post-title');
        if (eventElement) {
            const eventId = parseInt(eventElement.dataset.eventId);
            const event = mockData.events.find((ev) => ev.id === eventId);
            if (event) showPostModal(event, 'event');
        }
    });

    // 선택된 날짜의 일정 클릭 이벤트
    document.querySelector('.posts-card .list-group').addEventListener('click', (e) => {
        const item = e.target.closest('.list-group-item');
        if (item) {
            const eventId = parseInt(item.dataset.eventId);
            const event = mockData.events.find((ev) => ev.id === eventId);
            if (event) showPostModal(event, 'event');
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && postModal?.style.display === 'block') {
            postModal.style.display = 'none';
        }
    });
}
