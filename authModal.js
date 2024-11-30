/**
 * authModal.js - 인증 관련 모달 UI 컴포넌트
 * 로그인, 회원가입, 프로필 조회를 위한 모달 UI 템플릿 및 이벤트 핸들러 정의
 * PHP 백엔드와 연동되어 실제 인증 처리를 수행
 */

/**
 * 로그인 모달 템플릿
 * form의 action을 PHP 엔드포인트로 직접 전송하도록 설정
 */
const loginModalTemplate = `
<div id="loginModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">로그인</h5>
            <button type="button" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form action="./auth/login.php" method="POST">
                <div class="mb-3">
                    <input type="text" class="form-control" name="username" 
                           placeholder="아이디" required>
                </div>
                <div class="mb-3">
                    <input type="password" class="form-control" name="password" 
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
 * form의 action을 PHP 엔드포인트로 직접 전송하도록 설정
 */
const registerModalTemplate = `
<div id="registerModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">회원가입</h5>
            <button type="button" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form action="./auth/register.php" method="POST">
                <div class="mb-3">
                    <input type="text" class="form-control" name="username" 
                           placeholder="아이디" required>
                </div>
                <div class="mb-3">
                    <input type="password" class="form-control" name="password" 
                           placeholder="비밀번호" required>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" name="name" 
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
 * 세션에서 가져온 사용자 정보를 표시
 */
const profileModalTemplate = `
<div id="profileModal" class="modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h5 class="modal-title">내 정보</h5>
            <button type="button" class="close-btn">&times;</button>
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
                <form action="./auth/logout.php" method="POST">
                    <button type="submit" class="btn btn-secondary w-100">로그아웃</button>
                </form>
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

    // 모달 간 전환 버튼 이벤트 설정
    document.getElementById('showRegisterBtn').onclick = () => {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'block';
    };

    document.getElementById('showLoginBtn').onclick = () => {
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
    };

    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.close-btn').forEach((btn) => {
        btn.onclick = () => {
            btn.closest('.modal').style.display = 'none';
        };
    });
}

export { initializeModals };
