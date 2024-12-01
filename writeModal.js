/**
 * writeModal.js - 게시글 작성/수정 모달 컨트롤러
 */

import { renderCalendar } from './calendarRenderer.js';
import { renderDayEvents, renderCommunityPosts, renderNotices } from './postRenderer.js';

class WriteModalController {
    constructor() {
        this.modal = null;
        this.currentEditingPost = null;
        this.currentPostType = null;
    }

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

    initialize() {
        const existingModal = document.getElementById('writeModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.modalTemplate);
        this.modal = document.getElementById('writeModal');

        this.initializeEventHandlers();
        this.initializeNewPostButton();
    }

    initializeEventHandlers() {
        document.getElementById('cancelBtn').onclick = () => this.close();

        // postType select 요소의 change 이벤트 핸들러 수정
        document.getElementById('postType').onchange = async (e) => {
            const selectedType = e.target.value;

            // 공지사항 선택 시 권한 체크
            if (selectedType === 'notice') {
                const { isLoggedIn, user } = await this.checkAuthStatus();
                if (!isLoggedIn || !user.isAdmin) {
                    alert('공지사항은 관리자만 작성할 수 있습니다.');
                    // 선택을 커뮤니티로 되돌림
                    e.target.value = 'community';
                    return;
                }
            }

            // 일정 필드 표시/숨김 처리
            document.getElementById('scheduleFields').style.display = selectedType === 'schedule' ? 'block' : 'none';
        };

        document.getElementById('submitPost').onclick = () => this.handleSubmit();
    }

    async initializeNewPostButton() {
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.onclick = async (e) => {
                e.preventDefault();
                const authStatus = await this.checkAuthStatus();

                if (!authStatus.isLoggedIn) {
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

    reset() {
        this.currentEditingPost = null;
        this.currentPostType = null;
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

    show() {
        this.modal.style.display = 'block';
    }

    close() {
        this.modal.style.display = 'none';
        this.reset();
    }

    openEditModal(post, type) {
        this.currentEditingPost = post;
        this.currentPostType = type;
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
            document.getElementById('important').checked = post.important === '1' || post.important === true;
        } else {
            document.getElementById('scheduleFields').style.display = 'none';
        }

        this.show();
    }

    async handleSubmit() {
        try {
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
            const postType = document.getElementById('postType').value;

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            // 공지사항 권한 체크
            if (postType === 'notice' && !user.isAdmin) {
                alert('공지사항은 관리자만 작성할 수 있습니다.');
                return;
            }

            let success = false;

            switch (postType) {
                case 'schedule':
                    success = await this.handleScheduleSubmit();
                    break;
                case 'community':
                case 'notice':
                    success = await this.handlePostSubmit(postType);
                    break;
            }

            if (success) {
                this.close();
                alert(this.currentEditingPost ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
            }
        } catch (error) {
            console.error('제출 처리 중 오류 발생:', error);
            alert(error.message || '처리 중 오류가 발생했습니다.');
        }
    }

    async handleScheduleSubmit() {
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const important = document.getElementById('important').checked;

        if (!eventDate || !eventTime) {
            alert('날짜와 시간을 모두 입력해주세요.');
            return false;
        }

        const endpoint = this.currentEditingPost ? './api/events/update.php' : './api/events/create.php';
        const requestData = {
            title,
            content,
            date: eventDate,
            time: eventTime,
            important,
        };

        if (this.currentEditingPost) {
            requestData.id = this.currentEditingPost.id;
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

    async handlePostSubmit(type) {
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();

        let endpoint, requestData;

        if (this.currentEditingPost) {
            endpoint = './api/posts/update.php';
            requestData = {
                id: this.currentEditingPost.id,
                title,
                content,
                type, // 타입 정보 추가
            };
        } else {
            endpoint = './api/posts/create.php';
            requestData = {
                title,
                content,
                type, // 타입 정보 추가
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

        // UI 업데이트
        if (type === 'notice') {
            await renderNotices();
        } else {
            await renderCommunityPosts();
        }

        return true;
    }
}

const writeModalController = new WriteModalController();

export function initializeWriteModal() {
    writeModalController.initialize();
    return {
        openEditModal: (post, type) => writeModalController.openEditModal(post, type),
        reset: () => writeModalController.reset(),
    };
}

export function resetForm() {
    writeModalController.reset();
}
