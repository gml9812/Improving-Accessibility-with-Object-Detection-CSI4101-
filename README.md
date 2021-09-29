# Skip Link Generator
tensorflow.js와 vanilla js를 이용해, 웹 페이지의 주요 요소에 대한 건너뛰기 링크를 자동 생성하는 크롬 확장 프로그램입니다.

![image](https://user-images.githubusercontent.com/28294925/135207990-f9b6b15e-7142-46ee-b780-5c2f3aca5221.png)
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

![image](https://user-images.githubusercontent.com/28294925/135208129-2b2d0efc-4957-4c3d-85d6-c67c26e838ac.png)
<p align="center"><em>크롬 메뉴-확장 프로그램</em></p>


빌드 후, 크롬 확장 프로그램 관리 메뉴에서 "압축해제된 확장 프로그램을 로드합니다" 를 선택하고, manifest.json 있는 /dist 폴더를 선택하면 설치가 완료됩니다. 

## 사용법
- 확장 프로그램을 설치한 후, '모델이 로드되었습니다' 라는 안내음이 나오면 원하는 웹 페이지에 접속한다.  

- "건너뛰기 링크 생성이 완료되었습니다" 라는 안내음이 날 때까지 기다린다. 이후 tab 키를 눌러 웹 페이지 최상단을 포커스하면 건너뛰기 링크가 생성된 것을 알 수 있다.  
 
![image](https://user-images.githubusercontent.com/28294925/135207559-65c96a12-f7b8-4572-9e0b-3380b8086c24.png)  

- 크롬 확장 프로그램 팝업창에 있는 'show boundaries' 버튼을 누르면, 빨간색 박스로 모델이 감지한 웹 페이지 요소들이 표시된다.   
![image](https://user-images.githubusercontent.com/28294925/135207794-57163551-c118-4f7f-847e-a6bfd0ae57a9.png)  

![image](https://user-images.githubusercontent.com/28294925/135207343-0502846b-c09e-4a67-8157-4f234954623a.png)  

- 캐싱을 지원하므로, 한 번 방문한 페이지에는 딜레이 없이 링크를 생성한다. 

## 사용한 기술

### tensorflow.js
JS로 브라우저에서 머신 러닝 모델 사용을 가능하게 해 주는 라이브러리입니다. 본 프로젝트에서는 Amazon Alexa 기준 트래픽 상위 100개 웹사이트에서 추출한 main page, navbar, search bar, login, sidebar의 이미지를 세부 기준으로 다시 분류한 후, MobileNet 모델에 파인 튜닝하였습니다. 프로그램 작동 시 모델이 tensorflow.js를 통해 로드되고, 새로운 웹페이지에 접근 시 해당 페이지를 캡쳐해 존재하는 주요 요소들의 좌표를 구합니다. 
![image](https://user-images.githubusercontent.com/28294925/135210765-cfbb6fec-f068-4e90-abc3-29504fef4194.png)
![image](https://user-images.githubusercontent.com/28294925/135211055-edc14087-c36f-4e83-9781-32f21cd0f535.png)

### html & vanila js 

# 참고 자료
- 소개 영상: https://www.youtube.com/watch?v=WQMst9QqhC0
