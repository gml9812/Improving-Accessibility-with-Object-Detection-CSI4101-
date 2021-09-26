# Skip Link Generator
tensorflow.js와 vanilla js를 이용해, 웹 페이지의 주요 요소에 대한 건너뛰기 링크를 자동 생성하는 크롬 확장 프로그램입니다.

<img src="https://user-images.githubusercontent.com/19797697/87106796-2f71e680-c299-11ea-95d4-746ce09effaa.png" alt="skip link example">
<p align="center"><em>네이버의 건너뛰기 링크</em></p>

건너뛰기 링크(skip link)는 메뉴 및 배너 등을 건너뛰고 핵심 콘텐츠(본문, 메인 메뉴 등)로 포커스를 옮겨 주는 역할을 하는 링크입니다. 스크린 리더 사용 시, 건너뛰기 링크는 원하는 내용에 접근할 때까지 반복적으로 tab키를 눌러야 하는 불편을 줄여 줍니다.  
이 확장 프로그램은 스크린 리더 사용자가 건너뛰기 링크를 제공하지 않는 페이지에 접근할 시, 혹은 접근하는 페이지의 종류와 상관없이 일관적인 방식으로 건너뛰기 링크를 사용하고자 할 때 사용할 수 있습니다. 

## 설치
NVDA 등, 스크린 리더와 함께 사용하는 걸 추천합니다. 
```zsh
# package.json 이 있는 위치에서 사용
% yarn 
% yarn build
```

<img src="https://user-images.githubusercontent.com/19797697/87106796-2f71e680-c299-11ea-95d4-746ce09effaa.png" alt="skip link example">
<p align="center"><em>크롬 메뉴-확장 프로그램</em></p>


빌드 후, 크롬 확장 프로그램 관리 메뉴에서 "압축해제된 확장 프로그램을 로드합니다" 를 선택하고, manifest.json 있는 /dist 폴더를 선택하면 설치가 완료됩니다. 

## 사용법
- 확장 프로그램을 설치한 후, '모델이 로드되었습니다' 라는 안내음이 나오면 원하는 웹 페이지에 접속한다. 
- 링크 생성을 알리는 띵 소리가 날 때까지 기다린다. 소리가 난 후 tab 키를 눌러 웹 페이지 최상단을 포커스하면, 건너뛰기 링크가 생성된 것을 알 수 있다. 
<img src="https://user-images.githubusercontent.com/19797697/87106796-2f71e680-c299-11ea-95d4-746ce09effaa.png" alt="skip link example">
<p align="center"><em>크롬 메뉴-확장 프로그램</em></p>
- 크롬 확장 프로그램 팝업창에 있는 'show boundaries' 버튼을 누르면, 빨간색 박스로 모델이 감지한 웹 페이지 요소들이 표시된다. 
<img src="https://user-images.githubusercontent.com/19797697/87106796-2f71e680-c299-11ea-95d4-746ce09effaa.png" alt="skip link example">
<p align="center"><em>크롬 메뉴-확장 프로그램</em></p>
- 캐싱을 지원하므로, 한 번 방문한 페이지에는 딜레이 없이 링크를 생성한다. 

## 사용한 기술

### tensorflow.js

dataset 수집 + mobilenet으로 주요한 웹 페이지 요소 학습함. 

- 주요 요소에 대한 좌표 구함. 

### html & css & vanila js
- xxx함수 등을 사용해 모델이 구한 좌표로 점프하는 링크 만든다. 

# 개선점


# 참고 자료
- 보고서: 
- 발표 영상: 
