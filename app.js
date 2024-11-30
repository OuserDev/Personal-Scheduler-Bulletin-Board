/**
 * app.js - 메인 애플리케이션 진입점
 * 인증 상태 관리, UI 업데이트, 이벤트 핸들링을 담당하는 핵심 모듈
 * PHP 백엔드와 연동되어 실제 세션 기반 인증을 처리
 */

import { initializeModals } from './authModal.js';
import { initializeEventHandlers } from './eventHandler.js';
import { resetForm } from './writeModal.js';

/**
 * 서버로부터 현재 사용자의 인증 상태를 확인하는 함수
 * PHP 세션을 통해 로그인 상태를 확인하고 사용자 정보를 가져옴
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
 * 사용자 인증 상태에 따라 UI를 업데이트하는 함수
 * 로그인/로그아웃 상태에 따라 다른 메뉴와 기능을 표시
 */
async function updateAuthUI() {
    const { isLoggedIn, user } = await checkAuthStatus();
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const newPostBtn = document.getElementById('newPostBtn');
    const writeModal = document.getElementById('writeModal');

    if (!dropdownMenu) return;

    if (isLoggedIn && user) {
        // 로그인된 사용자 UI 구성
        dropdownMenu.innerHTML = `
            <li><span class="dropdown-item-text">${user.name}님</span></li>
            <li><a class="dropdown-item profile-btn" href="#">프로필</a></li>
            <li>
                <form action="./auth/logout.php" method="POST" style="margin:0">
                    <button type="submit" class="dropdown-item">로그아웃</button>
                </form>
            </li>
        `;

        // 프로필 버튼 클릭 이벤트 처리
        const profileBtn = dropdownMenu.querySelector('.profile-btn');
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('profileModal');
            if (modal) {
                // 프로필 정보 폼 필드 설정
                document.getElementById('profileUsername').value = user.username;
                document.getElementById('profileName').value = user.name;
                document.getElementById('profileJoinDate').value = user.joinDate;
                modal.style.display = 'block';
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
        newPostBtn.onclick = async (e) => {
            e.preventDefault();
            const { isLoggedIn } = await checkAuthStatus();

            if (!isLoggedIn) {
                if (writeModal) {
                    writeModal.style.display = 'none';
                }
                if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                    setTimeout(() => {
                        document.getElementById('loginModal').style.display = 'block';
                    }, 100);
                }
            } else {
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
async function initializeApp() {
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

    // 초기 UI 상태 설정
    await updateAuthUI();

    // 페이지 새로고침 또는 상태 변경 시 UI 업데이트
    window.addEventListener('focus', updateAuthUI);

    // 모달 외부 클릭 시 닫기 처리
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
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
                if (modal.id === 'writeModal') {
                    resetForm();
                }
            }
        }
    });
}

// 애플리케이션 초기화 실행
initializeApp();
