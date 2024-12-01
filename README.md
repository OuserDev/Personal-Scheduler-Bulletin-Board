# Personal Scheduler & Bulletin Board

2024-2학기 웹마스터과정 최종 발표 팀 프로젝트  
김선혁 & 정용태

## 📌 프로젝트 소개

웹 애플리케이션 서비스를 목표로 구축한 일정관리 & 게시판 웹 애플리케이션입니다. 프레임워크 없이 순수 자바스크립트만으로 SPA(Single Page Application)를 구현하여, 마치 데스크톱 애플리케이션처럼 부드러운 사용자 경험을 제공합니다.

## 🛠 기술 스택

-   **Frontend**: HTML5, CSS3, JavaScript(바닐라)
-   **Backend**: PHP, MySQL
-   **개발 환경**: XAMPP, Visual Studio Code

## 📂 프로젝트 구조

```
personal-scheduler/
│
├── api/
│   ├── common/
│   │   └── db.php               # 데이터베이스 연결 및 공통 유틸리티 함수
│   │
│   ├── events/                  # 일정 관련 API
│   │   ├── create.php          # 일정 생성
│   │   ├── delete.php          # 일정 삭제
│   │   ├── list.php           # 일정 목록 조회
│   │   ├── update.php         # 일정 수정
│   │   └── view.php           # 일정 상세 조회
│   │
│   └── posts/                   # 게시글(커뮤니티/공지사항) 관련 API
│       ├── create.php          # 글 작성
│       ├── delete.php          # 글 삭제
│       ├── list.php           # 글 목록 조회
│       ├── update.php         # 글 수정
│       └── view.php           # 글 상세 조회
│
├── auth/                        # 인증 관련
│   ├── checkAuth.php          # 로그인 상태 확인
│   ├── login.php              # 로그인 처리
│   ├── logout.php             # 로그아웃 처리
│   └── register.php           # 회원가입 처리
│
├── app.js                      # 메인 애플리케이션 로직
├── authModal.js               # 로그인/회원가입 모달
├── calendarRenderer.js        # 캘린더 렌더링
├── calendarState.js           # 캘린더 상태 관리
├── eventHandler.js            # 이벤트 핸들러
├── modalHandler.js            # 게시글 모달 관리
├── postRenderer.js            # 게시글 목록 렌더링
├── writeModal.js              # 글쓰기 모달
├── main.css                   # 스타일시트
├── main.html                  # 메인 페이지
└── README.md                  # 프로젝트 문서
```

## 💾 데이터베이스 구조

```sql
/* 사용자 정보 */
users (id, username, password, name, is_admin, join_date)

/* 일정 정보 */
events (id, title, content, author_id, date, time, important, is_private)

/* 커뮤니티 게시글 */
community_posts (id, title, content, author_id, created_at)

/* 공지사항 */
notices (id, title, content, author_id, created_at)
```

## 🌟 주요 특징

1. **프레임워크 없는 SPA 구현**

    - Vanilla JavaScript만으로 구현한 싱글 페이지 애플리케이션
    - 페이지 새로고침 없는 부드러운 화면 전환
    - 데스크톱 애플리케이션 같은 사용자 경험

2. **통합 일정 관리**

    - 캘린더 기반 직관적 일정 관리
    - 중요도 구분 및 개인/공개 설정
    - 게시판과 연동된 일정 관리
    - 월간/일간 보기 지원

3. **실시간 UI 업데이트**

    - 상태 변경 시 즉각적인 화면 갱신
    - 비동기 통신을 통한 끊김 없는 데이터 처리

4. **파일별 주요 기능**
    - **app.js**: 앱 초기화, 인증 상태 관리, 전역 이벤트 처리
    - **calendarRenderer.js**: 캘린더 UI 생성 및 업데이트
    - **calendarState.js**: 캘린더 날짜, 선택 상태 관리
    - **eventHandler.js**: 사용자 이벤트(클릭, 입력 등) 처리
    - **modalHandler.js**: 모달 창 표시/숨김, 데이터 처리
    - **postRenderer.js**: 게시글 목록 표시 및 업데이트
    - **writeModal.js**: 글쓰기 모달 관리 및 데이터 처리

## 👥 팀원 역할

-   **김선혁**

    -   프론트엔드 SPA 아키텍처 설계
    -   캘린더 컴포넌트 개발
    -   UI/UX 디자인

-   **정용태**
    -   데이터베이스 설계
    -   백엔드 API 개발
    -   데이터 연동 및 보안 처리

## 📅 개발 기간

2024.11.10 - 2024.12.15

## 💡 실행 방법

1. XAMPP 설치 및 실행 (Apache & phpMyAdmin & MySQL)
2. MySQL 데이터베이스 생성
3. 프로젝트 파일을 htdocs 폴더에 복사
4. 웹 브라우저에서 `localhost/psbb/main.html` 접속
