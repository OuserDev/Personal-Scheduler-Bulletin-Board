/**
 * postRenderer.js - 게시글 렌더링 모듈
 * 일정, 커뮤니티 게시글, 공지사항 등 각종 게시글의 UI 렌더링을 담당
 */

/**
 * 서버에서 현재 인증 상태를 확인하는 함수
 * @returns {Promise<Object>} 사용자 정보를 포함한 인증 상태 객체
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('./auth/checkAuth.php');
        if (!response.ok) {
            throw new Error('인증 상태 확인 실패');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        return { isLoggedIn: false, user: null };
    }
}

/**
 * 날짜 문자열을 Date 객체로 파싱하는 유틸리티 함수
 * "MM월 DD일" 형식의 문자열을 Date 객체로 변환
 *
 * @param {string} dateStr - 파싱할 날짜 문자열 (예: "11월 15일")
 * @returns {Date} 파싱된 Date 객체
 */
function parseDate(dateStr) {
    const [month, day] = dateStr.replace('월 ', '/').replace('일', '').split('/');
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, parseInt(month) - 1, parseInt(day));
}

/**
 * 선택된 날짜의 제목을 업데이트하는 함수
 * @param {string} date - YYYY-MM-DD 형식의 날짜 문자열
 */
export function updateSelectedDateTitle(date) {
    const formattedDate = new Date(date);
    const month = formattedDate.getMonth() + 1;
    const day = formattedDate.getDate();
    document.getElementById('selectedDate').textContent = `${month}월 ${day}일의 일정 게시글 목록`;
}

export async function renderDayEvents(date) {
    try {
        // date 문자열에서 year와 month 추출
        const selectedDate = new Date(date);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; // JavaScript의 월은 0부터 시작하므로 1을 더함

        const response = await fetch(`./api/events/list.php?type=event&year=${year}&month=${month}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '일정을 불러오는데 실패했습니다.');
        }

        const events = data.events
            .filter((event) => event.date === date) // 해당 날짜의 이벤트만 필터링
            .sort((a, b) => {
                const timeA = parseInt(a.time.replace(':', ''));
                const timeB = parseInt(b.time.replace(':', ''));
                return timeA - timeB;
            });

        const listHtml = events
            .map(
                (event) => `
            <div class="list-group-item" data-event-id="${event.id}">
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <span class="event-time">${event.time}</span>
                        <h6 class="mb-0">${event.title}</h6>
                        ${event.important === '1' || event.important === true ? '<span class="badge bg-danger">중요</span>' : ''}
                    </div>
                </div>
            </div>
        `
            )
            .join('');

        const listGroup = document.querySelector('.posts-card .list-group');
        listGroup.innerHTML = listHtml;
    } catch (error) {
        console.error('일정 목록 렌더링 중 오류:', error);
        const listGroup = document.querySelector('.posts-card .list-group');
        listGroup.innerHTML = '<div class="text-center text-muted">일정을 불러오는 중 오류가 발생했습니다.</div>';
    }
}

/**
 * 커뮤니티 게시글 목록을 렌더링하는 함수
 * 최신 글이 상단에 오도록 날짜순으로 정렬하여 표시
 */
// postRenderer.js 수정
export async function renderCommunityPosts() {
    try {
        const response = await fetch('./api/events/list.php?type=community');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '게시글을 불러올 수 없습니다.');
        }

        const listHtml = data.items
            .map(
                (post) => `
            <div class="list-group-item" data-post-id="${post.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${post.title}</h6>
                    <small>${post.author_name} · ${post.date}</small>
                </div>
            </div>
        `
            )
            .join('');

        document.querySelector('.untagged-card .list-group').innerHTML = listHtml;
    } catch (error) {
        console.error('커뮤니티 게시글 로딩 실패:', error);
    }
}

export async function renderNotices() {
    try {
        const response = await fetch('./api/events/list.php?type=notice');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '공지사항을 불러올 수 없습니다.');
        }

        const listHtml = data.items
            .map(
                (notice) => `
            <div class="list-group-item" data-post-id="${notice.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${notice.title}</h6>
                    <small>${notice.author_name} · ${notice.date}</small>
                </div>
            </div>
        `
            )
            .join('');

        document.querySelector('.notice-card .list-group').innerHTML = listHtml;
    } catch (error) {
        console.error('공지사항 로딩 실패:', error);
    }
}
