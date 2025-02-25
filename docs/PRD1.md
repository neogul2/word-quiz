# 제품 요구사항 문서 (PRD)

---

## 1. 제품 개요

엑셀 파일의 두 열(영어, 한글 뜻)에 정리된 단어들을 복사해 붙여넣기만 하면 단어 리스트가 생성되고, 이를 토대로 영어↔한글 퀴즈를 진행할 수 있는 웹 애플리케이션이다. 주요 기술 스택으로는 **Next.js**를 활용하여 서버사이드 렌더링과 쾌적한 사용자 경험을 제공한다.

---

## 2. 목표

1. **단순하고 직관적인 UI**  
   - 사용자 입력(엑셀에서 복사/붙여넣기)을 통해 간편하게 단어 리스트를 생성한다.  
   - 각 페이지에서 필요한 기능만 노출해 학습 흐름을 단순화한다.

2. **효율적인 단어 암기**  
   - 영어에서 한글, 한글에서 영어 모두 퀴즈를 진행해 이중 학습 효과를 높인다.  
   - 정답/오답 결과는 네 번째 페이지에서 한꺼번에 확인하도록 설계해 집중도를 높인다.

3. **오답 반복 학습**  
   - 학습 후 네 번째 페이지에서 결과를 분석하고, 틀린 단어를 재시험한다.  
   - 재시도 결과도 종합적으로 관리해 학습 효과를 극대화한다.

4. **시간 기록 및 관리**  
   - 각 학습 세션(Chapter)별로 퀴즈 풀이 시간을 기록하고, 사용자가 본인의 학습 추이를 파악할 수 있도록 지원한다.

---

## 3. 주요 기능

1. **단어 입력 (첫 페이지)**
   - **복사/붙여넣기 입력**: 엑셀(또는 스프레드시트)에서 “영어 - 한글 뜻”이 정리된 칼럼을 복사해 웹 앱에 붙여넣으면 자동으로 단어 리스트가 생성됨.
   - **단어 리스트 확인**: 테이블 형태로 목록을 표시하고, 필요하면 개별 수정 가능.
   - **학습 시간 기록**: 학습 “Chapter” 별 퀴즈 예정 시간을 입력하거나, 타이머를 시작할 수 있음.

2. **영어 → 한글 퀴즈 (두 번째 페이지)**
   - **모든 영어 단어**를 리스트로 한꺼번에 보여주고, 각 단어 옆에 한글 뜻을 입력하도록 구성.
   - 제출하더라도 즉시 정답/오답을 표시하지 않고, 사용자 입력값만 저장해 둠.

3. **한글 → 영어 퀴즈 (세 번째 페이지)**
   - **모든 한글 단어**를 리스트로 한꺼번에 보여주고, 각 단어 옆에 영어 뜻을 입력하도록 구성.
   - 이 페이지 역시 제출 시 즉시 정답/오답을 표시하지 않음. 답안만 저장한다.

4. **퀴즈 결과 & 오답 복습 (네 번째 페이지)**
   - 두 번째, 세 번째 페이지에서 입력한 답안을 한꺼번에 채점해 결과를 공개.
   - 정답/오답 통계, 소요 시간, 틀린 단어 목록 등을 요약해서 보여줌.
   - 틀린 단어를 다시 한번(영→한, 한→영) 퀴즈할 수 있는 **오답 복습** 모드 제공.
   - 재시험 후 맞은 개수 등을 추가로 분석해 학습 성취도를 높임.

---

## 4. 사용자 플로우

1. **첫 페이지**
   1. 엑셀 “영어 - 한글” 열을 복사/붙여넣어 단어 리스트 생성.
   2. 현재 학습 Chapter의 퀴즈 시간 목표를 입력하거나 타이머 시작.

2. **두 번째 페이지 (영어 → 한글 퀴즈)**
   - 한 번에 모든 영어 단어를 표시하고, 각 단어 옆 칸에 한글 뜻 입력.
   - 제출 시 답안을 저장하되, 정답 여부는 아직 보여주지 않음.

3. **세 번째 페이지 (한글 → 영어 퀴즈)**
   - 한 번에 모든 한글 단어를 표시하고, 각 단어 옆 칸에 영어 뜻 입력.
   - 제출 시 마찬가지로 정답 여부는 표시하지 않음.

4. **네 번째 페이지 (퀴즈 결과 & 오답 복습)**
   - 앞서 입력된 답안을 채점해 정오답 결과를 요약해서 한꺼번에 공개.
   - 틀린 단어를 재학습할 수 있는 퀴즈(영→한, 한→영)를 다시 제공.
   - 재시험 후 추가 점검을 통해 학습 상태를 더욱 명확히 확인 가능.

---

## 5. 기술 스택 및 구조

1. **Next.js**
   - [Next.js 공식 문서](https://nextjs.org/docs) 참고.
   - 서버사이드 렌더링(SSR), 라우팅 기능을 통해 빠르고 직관적인 UX 제공.

2. **React**
   - 동적 UI와 상태 관리를 위해 사용.

3. **데이터베이스 & API**
   - Next.js의 API Routes를 이용해 단어 리스트와 퀴즈 결과를 저장 및 조회.
   - DB는 MongoDB, MySQL, PostgreSQL 등 자유롭게 선택 가능.

4. **UI/UX 디자인**
   - 복붙 기능과 퀴즈 입력 폼을 간소화하여, 학습 자체에 집중할 수 있도록 구성.
   - 반응형 디자인 적용으로 다양한 디바이스에 대응.

5. **오프라인 지원(옵션)**
   - PWA(Progressive Web App) 형태로 작성해 네트워크 불안정 시에도 기본 퀴즈 진행 가능.

6. **분석 & 로깅**
   - Google Analytics, Firebase Analytics 등으로 사용자 학습 패턴을 추적.

---