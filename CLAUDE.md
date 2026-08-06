# SeatView — Claude Code 작업 지침

이 프로젝트에서 작업할 때는 [project_rules.md](project_rules.md)의 규칙을 반드시 따릅니다. 특히 아래 두 가지는 예외 없는 필수정책입니다.

## 1. GitHub 반영 금지 원칙 (필수)
- 사용자가 정확히 **"깃허브에 올려줘"** 또는 **"깃허브에 반영해"** 라고 말하기 전까지는 `git commit`, `git push` 등 원격 저장소에 영향을 주는 작업을 절대 하지 않는다.
- 그 전까지는 모든 수정 사항을 로컬 작업 폴더 파일에만 반영한다.

## 2. 소스 수정 절차 (필수)
소스 코드를 고칠 때는 항상 다음 순서를 지킨다:
1. 어떻게 수정할지 계획한다.
2. 다른 기능/파일에 영향이 없는지 검토한다 (공용 함수, 공용 CSS 클래스, 공유 상태값 등).
3. 계획대로 수정한다.
4. 최소한 해당 기능은 로컬 환경에서 직접 테스트한다.
5. 테스트까지 끝난 뒤에만 사용자에게 완료를 보고한다.

## 로컬 개발 환경
- 이 프로젝트는 별도 빌드 과정이 없는 정적 사이트(HTML/CSS/Vanilla JS)이며, Supabase를 백엔드로 사용한다.
- 로컬 테스트 서버: `.local-server.ps1` (PowerShell 기반 정적 파일 서버, Node/Python 미설치 환경 대응용)
  - 실행: `powershell -ExecutionPolicy Bypass -File .local-server.ps1 -Port 8080`
  - 접속: http://localhost:8080/ (메인), http://localhost:8080/admin.html (관리자)
