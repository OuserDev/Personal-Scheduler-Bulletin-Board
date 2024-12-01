/**
 * app.js
 *
 * 웹사이트의 시작점
 * 로그인 상태 확인, 화면 업데이트, 각종 이벤트 처리 담당
 */

import { initializeModals } from './authModal.js';
import { initializeEventHandlers } from './eventHandler.js';
import { resetForm } from './writeModal.js';

/**
 * 로그인 상태 확인
 * 서버에 요청해서 현재 로그인 여부와 사용자 정보를 가져옴
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
 * 로그인 상태에 따라 화면 업데이트
 * 1. 로그인 상태 - 사용자 이름, 프로필, 로그아웃 표시
 * 2. 로그아웃 상태 - 로그인 버튼만 표시
 */
async function updateAuthUI() {
    const { isLoggedIn, user } = await checkAuthStatus();
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const newPostBtn = document.getElementById('newPostBtn');
    const writeModal = document.getElementById('writeModal');

    if (!dropdownMenu) return;

    if (isLoggedIn && user) {
        // 로그인 했을 때 메뉴
        dropdownMenu.innerHTML = `
           <li><span class="dropdown-item-text">${user.name}님</span></li>
           <li><a class="dropdown-item profile-btn" href="#">프로필</a></li>
           <li>
               <form action="./auth/logout.php" method="POST" style="margin:0">
                   <button type="submit" class="dropdown-item">로그아웃</button>
               </form>
           </li>
       `;

        // 프로필 버튼 눌렀을 때
        const profileBtn = dropdownMenu.querySelector('.profile-btn');
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('profileModal');
            if (modal) {
                // 프로필 정보 채우기
                document.getElementById('profileUsername').value = user.username;
                document.getElementById('profileName').value = user.name;
                document.getElementById('profileJoinDate').value = user.joinDate;
                modal.style.display = 'block';
            }
        });
    } else {
        // 로그아웃 상태일 때 메뉴
        dropdownMenu.innerHTML = `
           <li><a class="dropdown-item login-btn" href="#">로그인</a></li>
       `;

        // 로그인 버튼 눌렀을 때
        const loginBtn = dropdownMenu.querySelector('.login-btn');
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'block';
        });
    }

    // 새글쓰기 버튼 눌렀을 때
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
 * 웹사이트 시작하기
 * 1. 각종 이벤트 연결
 * 2. 팝업창 설정
 * 3. 화면 초기화
 */
async function initializeApp() {
    // 기본 설정
    initializeEventHandlers();
    initializeModals();

    // 부트스트랩 드롭다운 설정
    if (typeof bootstrap !== 'undefined') {
        const dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
    }

    // 첫 화면 설정
    await updateAuthUI();

    // 페이지 새로고침/포커스시 화면 업데이트
    window.addEventListener('focus', updateAuthUI);

    // 팝업창 바깥 클릭시 닫기
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            if (e.target.id === 'writeModal') {
                resetForm();
            }
        }
    });

    // 팝업창 닫기 버튼
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

// 웹사이트 시작
initializeApp();
