/**
 * writeModal.js
 *
 * 글쓰기/수정 모달창 관리
 * 일정, 커뮤니티 글, 공지사항 작성과 수정용 팝업창 관리
 */

import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';

/**
 * 모달창과 관련된 전역 변수들
 */
let modal = null; // 현재 모달창 객체
let currentEditingPost = null; // 수정 중인 글 정보
let currentPostType = null; // 현재 글의 타입

/**
 * 로그인 상태 체크
 * 서버에 요청해서 현재 로그인 상태와 사용자 정보를 가져옴
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('./auth/checkAuth.php');
        if (!response.ok) throw new Error('인증 확인 실패');
        return await response.json();
    } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        return { isLoggedIn: false, user: null };
    }
}

/**
 * 모달창 HTML 구조
 * 1. 글 종류 선택 (일정/커뮤니티/공지사항)
 * 2. 제목 입력
 * 3. 일정 전용 필드 (날짜/시간/중요 표시)
 * 4. 내용 입력
 * 5. 하단 버튼 (취소/등록)
 */
function getModalTemplate() {
    return `
   <div id="writeModal" class="modal">
       <div class="modal-content">
           <div class="modal-header">
               <h5 class="modal-title">새 글쓰기</h5>
               <button class="close-btn" type="button">&times;</button>
           </div>
           <div class="modal-body">
               <div class="mb-3">
                   <select class="form-select" id="postType">
                       <option value="schedule">일정</option>
                       <option value="community">커뮤니티</option>
                       <option value="notice">공지사항</option>
                   </select>
               </div>
               <div class="mb-3">
                   <input type="text" class="form-control" id="postTitle" 
                           placeholder="제목을 입력하세요">
               </div>
               <div id="scheduleFields">
                   <div class="mb-3">
                       <input type="date" class="form-control" id="eventDate">
                   </div>
                   <div class="mb-3">
                       <input type="time" class="form-control" id="eventTime">
                   </div>
                   <div class="mb-3 form-check">
                       <input type="checkbox" class="form-check-input" id="important">
                       <label class="form-check-label" for="important">중요 일정</label>
                   </div>
               </div>
               <div class="mb-3">
                   <textarea class="form-control" id="postContent" rows="5" 
                             placeholder="내용을 입력하세요"></textarea>
               </div>
               <div class="d-flex gap-2 justify-content-end">
                   <button class="btn btn-secondary" id="cancelBtn">취소</button>
                   <button class="btn btn-primary" id="submitPost">등록하기</button>
               </div>
           </div>
       </div>
   </div>`;
}

/**
 * 모달창 초기화
 * 1. 기존 모달창 제거
 * 2. 새 모달창 생성
 * 3. 이벤트 핸들러 설정
 * 4. 새글쓰기 버튼 이벤트 연결
 */
function initialize() {
    const existingModal = document.getElementById('writeModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', getModalTemplate());
    modal = document.getElementById('writeModal');

    initializeEventHandlers();
    initializeNewPostButton();
}

/**
 * 모달창 내부 이벤트 설정
 * 1. 취소 버튼 - 모달창 닫기
 * 2. 글 종류 변경 - 일정 필드 표시/숨김
 * 3. 등록 버튼 - 글 저장 처리
 */
function initializeEventHandlers() {
    document.getElementById('cancelBtn').onclick = () => closeModal();

    // 글 종류 변경 시 처리
    document.getElementById('postType').onchange = async (e) => {
        const selectedType = e.target.value;

        // 공지사항 권한 체크
        if (selectedType === 'notice') {
            const { isLoggedIn, user } = await checkAuthStatus();
            if (!isLoggedIn || !user.isAdmin) {
                alert('공지사항은 관리자만 작성할 수 있습니다.');
                e.target.value = 'community';
                return;
            }
        }

        // 일정 입력 필드 표시/숨김
        document.getElementById('scheduleFields').style.display = selectedType === 'schedule' ? 'block' : 'none';
    };

    document.getElementById('submitPost').onclick = () => handleSubmit();
}

/**
 * 새 글쓰기 버튼 초기화
 * 로그인 여부 체크 후 모달창 표시
 */
async function initializeNewPostButton() {
    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) {
        newPostBtn.onclick = async (e) => {
            e.preventDefault();
            const authStatus = await checkAuthStatus();

            if (!authStatus.isLoggedIn) {
                if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                    document.getElementById('loginModal').style.display = 'block';
                }
            } else {
                resetForm();
                showModal();
            }
        };
    }
}

/**
 * 모달창 초기화
 * 모든 입력 필드를 기본값으로 리셋
 */
function resetForm() {
    currentEditingPost = null;
    currentPostType = null;

    modal.querySelector('.modal-title').textContent = '새 글쓰기';
    document.getElementById('submitPost').textContent = '등록하기';
    document.getElementById('postTitle').value = '';
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('eventTime').value = '09:00';
    document.getElementById('important').checked = false;
    document.getElementById('postContent').value = '';
    document.getElementById('postType').value = 'schedule';
    document.getElementById('postType').disabled = false;
    document.getElementById('scheduleFields').style.display = 'block';
}

/**
 * 모달창 표시/숨김 제어
 */
function showModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    resetForm();
}

/**
 * 글 수정 모달창
 * 기존 글 정보를 모달창에 표시
 */
function openEditModal(post, type) {
    currentEditingPost = post;
    currentPostType = type;

    modal.querySelector('.modal-title').textContent = '게시글 수정';
    document.getElementById('submitPost').textContent = '수정하기';

    const postTypeValue = type === 'event' ? 'schedule' : type;
    document.getElementById('postType').value = postTypeValue;
    document.getElementById('postType').disabled = true;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postContent').value = post.content;

    if (type === 'event') {
        document.getElementById('scheduleFields').style.display = 'block';
        document.getElementById('eventDate').value = post.date;
        document.getElementById('eventTime').value = post.time;
        document.getElementById('important').checked = post.important === '1' || post.important === true;
    } else {
        document.getElementById('scheduleFields').style.display = 'none';
    }

    showModal();
}

/**
 * 글 등록/수정 처리
 * 1. 로그인 체크
 * 2. 입력값 검증
 * 3. 권한 체크
 * 4. 서버 전송
 */
async function handleSubmit() {
    try {
        const { isLoggedIn, user } = await checkAuthStatus();
        if (!isLoggedIn) {
            closeModal();
            if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'block';
                }, 100);
            }
            return;
        }

        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const postType = document.getElementById('postType').value;

        // 입력값 검증
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        // 공지사항 권한 체크
        if (postType === 'notice' && !user.isAdmin) {
            alert('공지사항은 관리자만 작성할 수 있습니다.');
            return;
        }

        // 글 종류별 처리
        let success = false;
        switch (postType) {
            case 'schedule':
                success = await handleScheduleSubmit();
                break;
            case 'community':
            case 'notice':
                success = await handlePostSubmit(postType);
                break;
        }

        if (success) {
            closeModal();
            alert(currentEditingPost ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
        }
    } catch (error) {
        console.error('제출 처리 중 오류 발생:', error);
        alert(error.message || '처리 중 오류가 발생했습니다.');
    }
}

/**
 * 일정 등록/수정
 * 날짜, 시간 추가 입력값 처리
 */
async function handleScheduleSubmit() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const important = document.getElementById('important').checked;

    if (!eventDate || !eventTime) {
        alert('날짜와 시간을 모두 입력해주세요.');
        return false;
    }

    const endpoint = currentEditingPost ? './api/events/update.php' : './api/events/create.php';
    const requestData = {
        title,
        content,
        date: eventDate,
        time: eventTime,
        important,
    };

    if (currentEditingPost) {
        requestData.id = currentEditingPost.id;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || '처리 중 오류가 발생했습니다.');
    }

    await renderCalendar();
    if (eventDate) {
        await renderDayEvents(eventDate);
    }

    return true;
}

/**
 * 커뮤니티/공지사항 등록/수정
 */
async function handlePostSubmit(type) {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    let endpoint, requestData;

    if (currentEditingPost) {
        endpoint = './api/posts/update.php';
        requestData = {
            id: currentEditingPost.id,
            title,
            content,
            type,
        };
    } else {
        endpoint = './api/posts/create.php';
        requestData = {
            title,
            content,
            type,
        };
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || '처리 중 오류가 발생했습니다.');
    }

    if (type === 'notice') {
        await renderNotices();
    } else {
        await renderCommunityPosts();
    }

    return true;
}

// 외부로 내보내기
export function initializeWriteModal() {
    initialize();
    return {
        openEditModal,
        reset: resetForm,
    };
}

export { resetForm };
