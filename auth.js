/**
 * auth.js - 사용자 인증 관련 기능을 처리하는 모듈
 * 로그인, 회원가입, 프로필 업데이트 등 사용자 인증 관련 핵심 기능 구현
 */

import { mockData } from './mockData.js';
import { setCurrentUser, getCurrentUser } from './authState.js';

/**
 * 사용자 로그인 처리 함수
 * @param {string} username - 사용자 아이디
 * @param {string} password - 사용자 비밀번호
 * @returns {boolean} 로그인 성공 여부
 *
 * @example
 * const isLoggedIn = login('user123', 'password123');
 * if (isLoggedIn) {
 *    console.log('로그인 성공');
 * }
 */
export function login(username, password) {
    // 입력받은 아이디/비밀번호로 사용자 찾기
    const user = mockData.users.find((u) => u.username === username && u.password === password);

    if (user) {
        // 보안을 위해 비밀번호를 제외한 사용자 정보만 저장
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        return true;
    }
    return false;
}

/**
 * 새로운 사용자 등록(회원가입) 함수
 * @param {Object} userData - 새로운 사용자 정보
 * @param {string} userData.username - 사용자 아이디
 * @param {string} userData.password - 사용자 비밀번호
 * @param {string} userData.name - 사용자 이름
 * @returns {boolean} 회원가입 성공 여부
 *
 * @example
 * const userData = {
 *    username: 'newuser',
 *    password: 'userpass123',
 *    name: '홍길동'
 * };
 * const isRegistered = register(userData);
 */
export function register(userData) {
    // 아이디 중복 검사
    if (mockData.users.some((u) => u.username === userData.username)) {
        return false;
    }

    // 새로운 사용자 객체 생성
    const newUser = {
        id: mockData.users.length + 1,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        joinDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
    };

    // 사용자 목록에 추가
    mockData.users.push(newUser);
    return true;
}

/**
 * 사용자 프로필 정보 업데이트 함수
 * @param {number} userId - 업데이트할 사용자의 ID
 * @param {Object} updateData - 업데이트할 사용자 정보
 * @returns {boolean} 업데이트 성공 여부
 *
 * @example
 * const isUpdated = updateProfile(1, { name: '새이름' });
 */
export function updateProfile(userId, updateData) {
    // 사용자 찾기
    const userIndex = mockData.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return false;

    // 기존 정보와 새로운 정보를 병합
    const updatedUser = { ...mockData.users[userIndex], ...updateData };
    mockData.users[userIndex] = updatedUser;

    // 현재 로그인된 사용자의 정보를 업데이트하는 경우
    // 전역 상태도 함께 업데이트
    if (getCurrentUser()?.id === userId) {
        const { password, ...userWithoutPassword } = updatedUser;
        setCurrentUser(userWithoutPassword);
    }
    return true;
}