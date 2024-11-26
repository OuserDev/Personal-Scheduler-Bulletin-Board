/**
 * authState.js - 인증 상태 관리 모듈
 * 사용자 인증 상태를 전역적으로 관리하고 상태 변경 이벤트를 처리
 */

/**
 * 현재 로그인된 사용자 정보를 저장하는 변수
 * @type {Object|null} 사용자 객체 또는 null (비로그인 상태)
 * @property {number} id - 사용자 고유 ID
 * @property {string} username - 사용자 아이디
 * @property {string} name - 사용자 이름
 * @property {string} joinDate - 가입일
 */
let currentUser = null;

/**
 * 현재 로그인된 사용자 정보를 반환하는 함수
 * @returns {Object|null} 현재 로그인된 사용자 객체 또는 null
 *
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *    console.log(`현재 사용자: ${user.name}`);
 * }
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * 현재 사용자 정보를 설정하고 변경 이벤트를 발생시키는 함수
 * @param {Object|null} user - 설정할 사용자 정보 객체
 * @fires CustomEvent#auth-changed - 인증 상태 변경 이벤트
 *
 * @example
 * setCurrentUser({
 *    id: 1,
 *    username: 'user123',
 *    name: '홍길동',
 *    joinDate: '2024-01-01'
 * });
 */
export function setCurrentUser(user) {
    currentUser = user;
    // 인증 상태 변경을 알리는 커스텀 이벤트 발생
    document.body.dispatchEvent(
        new CustomEvent('auth-changed', {
            detail: { user },
            bubbles: true, // 이벤트 버블링 허용
            cancelable: false, // 이벤트 취소 불가
        })
    );
}

/**
 * 사용자의 로그인 상태를 확인하는 함수
 * @returns {boolean} 로그인 여부
 *
 * @example
 * if (isLoggedIn()) {
 *    showUserDashboard();
 * } else {
 *    showLoginForm();
 * }
 */
export function isLoggedIn() {
    return currentUser !== null;
}

/**
 * 로그아웃 처리 함수
 * 현재 사용자 정보를 초기화하고 변경 이벤트를 발생시킴
 * @fires CustomEvent#auth-changed - 인증 상태 변경 이벤트
 *
 * @example
 * logout();
 * // 인증 상태가 변경되고 UI가 업데이트됨
 */
export function logout() {
    currentUser = null;
    // 로그아웃 상태 변경을 알리는 커스텀 이벤트 발생
    document.body.dispatchEvent(
        new CustomEvent('auth-changed', {
            detail: { user: null },
            bubbles: true,
            cancelable: false,
        })
    );
}