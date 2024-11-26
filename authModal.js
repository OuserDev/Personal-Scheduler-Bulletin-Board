/**
 * authModal.js - 인증 관련 모달 UI 컴포넌트
 * 로그인, 회원가입, 프로필 조회를 위한 모달 UI 템플릿 및 이벤트 핸들러 정의
 */

import { login, register, updateProfile } from './auth.js';
import { getCurrentUser } from './authState.js';

/**
 * 로그인 모달 템플릿
 * Bootstrap 스타일링 적용된 로그인 폼
 */
const loginModalTemplate = `
<div id="loginModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">로그인</h5>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form id="loginForm">
                <div class="mb-3">
                    <input type="text" class="form-control" id="loginUsername" 
                           placeholder="아이디" required>
                </div>
                <div class="mb-3">
                    <input type="password" class="form-control" id="loginPassword" 
                           placeholder="비밀번호" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">로그인</button>
                <button type="button" class="btn btn-link w-100" id="showRegisterBtn">
                    회원가입
                </button>
            </form>
        </div>
    </div>
</div>`;

/**
 * 회원가입 모달 템플릿
 * Bootstrap 스타일링 적용된 회원가입 폼
 */
const registerModalTemplate = `
<div id="registerModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">회원가입</h5>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form id="registerForm">
                <div class="mb-3">
                    <input type="text" class="form-control" id="regUsername" 
                           placeholder="아이디" required>
                </div>
                <div class="mb-3">
                    <input type="password" class="form-control" id="regPassword" 
                           placeholder="비밀번호" required>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" id="regName" 
                           placeholder="이름" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">가입하기</button>
                <button type="button" class="btn btn-link w-100" id="showLoginBtn">
                    로그인으로 돌아가기
                </button>
            </form>
        </div>
    </div>
</div>`;

/**
 * 프로필 정보 조회 모달 템플릿
 * 사용자 정보를 읽기 전용으로 표시
 */
const profileModalTemplate = `
<div id="profileModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">내 정보</h5>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form id="profileForm">
                <div class="mb-3">
                    <label class="form-label">아이디</label>
                    <input type="text" class="form-control" id="profileUsername" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">이름</label>
                    <input type="text" class="form-control" id="profileName" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">가입일</label>
                    <input type="text" class="form-control" id="profileJoinDate" readonly>
                </div>
                <button type="button" class="btn btn-secondary w-100" id="closeProfileBtn">
                    닫기
                </button>
            </form>
        </div>
    </div>
</div>`;

/**
 * 모달 초기화 및 이벤트 핸들러 설정 함수
 * 모든 인증 관련 모달을 문서에 추가하고 이벤트를 바인딩
 */
function initializeModals() {
    // DOM에 모달 템플릿 추가
    document.body.insertAdjacentHTML('beforeend', loginModalTemplate);
    document.body.insertAdjacentHTML('beforeend', registerModalTemplate);
    document.body.insertAdjacentHTML('beforeend', profileModalTemplate);

    // 모달 요소 참조
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const profileModal = document.getElementById('profileModal');

    /**
     * 로그인 폼 제출 핸들러
     * 사용자 인증 처리 및 결과에 따른 UI 업데이트
     */
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (login(username, password)) {
            loginModal.style.display = 'none';
            document.getElementById('loginForm').reset();
            alert('로그인되었습니다.');
        } else {
            alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    });

    /**
     * 회원가입 폼 제출 핸들러
     * 새로운 사용자 등록 및 결과에 따른 UI 업데이트
     */
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById('regUsername').value,
            password: document.getElementById('regPassword').value,
            name: document.getElementById('regName').value,
        };

        if (register(userData)) {
            // 회원가입 성공 시 로그인 모달로 전환
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
            document.getElementById('registerForm').reset();
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
        } else {
            alert('이미 사용 중인 아이디입니다.');
        }
    });

    // 모달 간 전환 버튼 이벤트 설정
    document.getElementById('showRegisterBtn').onclick = () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    };

    document.getElementById('showLoginBtn').onclick = () => {
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    };
}

export { initializeModals };
