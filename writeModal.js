/**
 * writeModal.js - 게시글 작성/수정 모달 컨트롤러
 * 일정, 커뮤니티 게시글, 공지사항 등의 작성과 수정을 위한 모달 UI 및 기능 관리
 */

import { mockData } from './mockData.js';
import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';

/**
 * 모달 컨트롤러 클래스
 * 모달 UI와 관련된 모든 상태와 동작을 관리
 */
class WriteModalController {
    constructor() {
        this.modal = null;
        this.currentEditingPost = null;
    }

    // 권한 확인을 위한 새로운 메서드 추가
    async checkAuthStatus() {
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
     * 모달 HTML 템플릿
     * @returns {string} 모달 HTML 문자열
     */
    get modalTemplate() {
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
     * 모달 초기화 함수
     * 모달을 생성하고 이벤트 핸들러를 설정
     */
    initialize() {
        // 기존 모달 제거
        const existingModal = document.getElementById('writeModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 새 모달 추가
        document.body.insertAdjacentHTML('beforeend', this.modalTemplate);
        this.modal = document.getElementById('writeModal');

        // 이벤트 핸들러 설정
        this.initializeEventHandlers();
        this.initializeNewPostButton();
    }

    /**
     * 모달 내부 이벤트 핸들러 초기화
     */
    initializeEventHandlers() {
        document.getElementById('cancelBtn').onclick = () => this.close();
        document.getElementById('postType').onchange = (e) => {
            document.getElementById('scheduleFields').style.display = e.target.value === 'schedule' ? 'block' : 'none';
        };
        document.getElementById('submitPost').onclick = () => this.handleSubmit();
    }

    /**
     * 새글쓰기 버튼 이벤트 핸들러 초기화
     */
    initializeNewPostButton() {
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.onclick = (e) => {
                e.preventDefault();
                const currentUser = getCurrentUser();

                if (!currentUser) {
                    if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                        document.getElementById('loginModal').style.display = 'block';
                    }
                } else {
                    this.reset();
                    this.show();
                }
            };
        }
    }

    /**
     * 폼 초기화
     */
    reset() {
        this.currentEditingPost = null;
        this.modal.querySelector('.modal-title').textContent = '새 글쓰기';
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
     * 모달 표시
     */
    show() {
        this.modal.style.display = 'block';
    }

    /**
     * 모달 닫기
     */
    close() {
        this.modal.style.display = 'none';
        this.reset();
    }

    /**
     * 게시글 수정 모달 열기
     * @param {Object} post - 수정할 게시글 객체
     * @param {string} type - 게시글 타입
     */
    openEditModal(post, type) {
        this.currentEditingPost = post;
        this.modal.querySelector('.modal-title').textContent = '게시글 수정';
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
            document.getElementById('important').checked = post.important;
        } else {
            document.getElementById('scheduleFields').style.display = 'none';
        }

        this.show();
    }

    /**
     * 폼 제출 처리
     */
    async handleSubmit() {
        try {
            // 인증 상태 확인
            const { isLoggedIn, user } = await this.checkAuthStatus();

            if (!isLoggedIn) {
                this.close();
                if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                    setTimeout(() => {
                        document.getElementById('loginModal').style.display = 'block';
                    }, 100);
                }
                return;
            }

            const title = document.getElementById('postTitle').value.trim();
            const content = document.getElementById('postContent').value.trim();

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            let success = false;

            switch (document.getElementById('postType').value) {
                case 'schedule':
                    success = await this.handleScheduleSubmit(title, content);
                    break;
                // 다른 케이스들은 아직 mockData 사용
                case 'community':
                    this.handleCommunitySubmit(title, content, user);
                    success = true;
                    break;
                case 'notice':
                    this.handleNoticeSubmit(title, content, user);
                    success = true;
                    break;
            }

            if (success) {
                this.close();
                alert(this.currentEditingPost ? '게시글이 수정되었습니다.' : '글이 등록되었습니다.');
            }
        } catch (error) {
            console.error('제출 처리 중 오류 발생:', error);
            alert('처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 일정 제출 처리
     */
    async handleScheduleSubmit(title, content) {
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const important = document.getElementById('important').checked;

        // 입력값 검증
        if (!eventDate || !eventTime) {
            alert('날짜와 시간을 모두 입력해주세요.');
            return;
        }

        try {
            // 새 일정 생성 API 호출
            const response = await fetch('./api/events/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: eventDate,
                    time: eventTime,
                    title: title,
                    content: content,
                    important: important,
                }),
            });

            // 응답 처리
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '일정 생성 중 오류가 발생했습니다.');
            }

            // 성공적으로 생성된 경우 UI 업데이트
            await renderCalendar();
            await renderDayEvents(eventDate);

            return true;
        } catch (error) {
            console.error('일정 생성 실패:', error);
            alert(error.message);
            return false;
        }
    }

    /**
     * 커뮤니티 게시글 제출 처리
     */
    handleCommunitySubmit(title, content, currentUser, dateStr) {
        if (this.currentEditingPost) {
            Object.assign(this.currentEditingPost, {
                title: title,
                content: content,
            });
        } else {
            mockData.community.unshift({
                id: mockData.community.length + 1,
                title: title,
                content: content,
                author: currentUser.name,
                date: dateStr,
            });
        }
        renderCommunityPosts();
    }

    /**
     * 공지사항 제출 처리
     */
    handleNoticeSubmit(title, content, currentUser, dateStr) {
        if (!currentUser.isAdmin) {
            alert('공지사항은 관리자만 작성할 수 있습니다.');
            return;
        }

        if (this.currentEditingPost) {
            Object.assign(this.currentEditingPost, {
                title: title,
                content: content,
            });
        } else {
            mockData.notices.unshift({
                id: mockData.notices.length + 1,
                title: title,
                content: content,
                author: '관리자',
                date: dateStr,
            });
        }
        renderNotices();
    }
}

// 모달 컨트롤러 인스턴스 생성
const writeModalController = new WriteModalController();

/**
 * 모달 초기화 함수
 * @returns {Object} 모달 컨트롤러 인터페이스
 */
export function initializeWriteModal() {
    writeModalController.initialize();
    return {
        openEditModal: (post, type) => writeModalController.openEditModal(post, type),
        reset: () => writeModalController.reset(),
    };
}

// 외부에서 사용할 수 있도록 reset 함수 export
export function resetForm() {
    writeModalController.reset();
}
