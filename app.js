/**
 * app.js - 메인 애플리케이션 진입점
 * 인증 상태 관리, UI 업데이트, 이벤트 핸들링을 담당하는 핵심 모듈
 */

import { initializeModals } from './authModal.js';
import { getCurrentUser, logout } from './authState.js';
import { initializeEventHandlers } from './eventHandler.js';
import { resetForm } from './writeModal.js';

/**
 * 사용자 인증 상태에 따라 UI를 업데이트하는 함수
 * 로그인/로그아웃 상태에 따라 다른 메뉴와 기능을 표시
 */
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const profileDropdown = document.getElementById('profileDropdown');
    const newPostBtn = document.getElementById('newPostBtn');
    const writeModal = document.getElementById('writeModal');

    if (!dropdownMenu) return;

    // 로그인된 사용자 UI 구성
    if (currentUser) {
        // 사용자 메뉴 템플릿 설정
        dropdownMenu.innerHTML = `
            <li><span class="dropdown-item-text">${currentUser.name}님</span></li>
            <li><a class="dropdown-item profile-btn" href="#">프로필</a></li>
            <li><a class="dropdown-item logout-btn" href="#">로그아웃</a></li>
        `;

        // 프로필 버튼 클릭 이벤트 처리
        const profileBtn = dropdownMenu.querySelector('.profile-btn');
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('profileModal');
            if (modal) {
                // 프로필 정보 폼 필드 설정
                document.getElementById('profileUsername').value = currentUser.username;
                document.getElementById('profileName').value = currentUser.name;
                document.getElementById('profileJoinDate').value = currentUser.joinDate;
                modal.style.display = 'block';
            }
        });

        // 로그아웃 버튼 클릭 이벤트 처리
        const logoutBtn = dropdownMenu.querySelector('.logout-btn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('정말 로그아웃 하시겠습니까?')) {
                logout();
                location.reload(); // 페이지 새로고침으로 상태 초기화
            }
        });
    } else {
        // 비로그인 사용자 UI 구성
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item login-btn" href="#">로그인</a></li>
        `;

        // 로그인 버튼 클릭 이벤트 처리
        const loginBtn = dropdownMenu.querySelector('.login-btn');
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'block';
        });
    }

    // 새글쓰기 버튼 이벤트 처리
    if (newPostBtn) {
        newPostBtn.onclick = (e) => {
            e.preventDefault();
            // 비로그인 사용자 처리
            if (!currentUser) {
                if (writeModal) {
                    writeModal.style.display = 'none';
                }
                if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                    // 모달 전환 시 깜빡임 방지를 위한 지연 처리
                    setTimeout(() => {
                        document.getElementById('loginModal').style.display = 'block';
                    }, 100);
                }
            } else {
                // 로그인 사용자는 바로 글쓰기 모달 표시
                if (writeModal) {
                    writeModal.style.display = 'block';
                }
            }
        };
    }
}

/**
 * 애플리케이션 초기화 함수
 * 모든 이벤트 핸들러와 모달을 설정하고 초기 UI를 렌더링
 */
function initializeApp() {
    // 기본 이벤트 핸들러와 모달 초기화
    initializeEventHandlers();
    initializeModals();

    // Bootstrap 드롭다운 컴포넌트 초기화
    if (typeof bootstrap !== 'undefined') {
        const dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
    }

    // 인증 상태 변경 감지 및 UI 업데이트
    document.body.addEventListener('auth-changed', () => {
        updateAuthUI();
    });

    // 초기 UI 상태 설정
    updateAuthUI();

    // 모달 외부 클릭 시 닫기 처리
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            // writeModal 닫을 때 폼 초기화
            if (e.target.id === 'writeModal') {
                resetForm();
            }
        }
    });

    // 모달 닫기 버튼 클릭 이벤트 처리
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                // writeModal 닫을 때 폼 초기화
                if (modal.id === 'writeModal') {
                    resetForm();
                }
            }
        }
    });
}

// 애플리케이션 초기화 실행
initializeApp();
