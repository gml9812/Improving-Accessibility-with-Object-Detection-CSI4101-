# Improving-Accessibility-with-Object-Detection-CSI4101-

# 사용법
- 1. 터미널 사용해 다운로드한 폴더로 이동
- 2. yarn => yarn build 사용
- 3. 크롬 확장 프로그램 관리 => "압축해제된 확장 프로그램을 로드합니다" => manifest.json 있는 폴더(dist) 선택
- 4. "뷰 검사" 옆에 있는 "백그라운드 페이지" 클릭해 결과 검사

# 결과 화면 설명
- ![제목 없음](https://user-images.githubusercontent.com/28294925/118645700-3737db00-b81a-11eb-9973-073c2d3eddc9.png)
- 1. 모델이 제대로 로드되면 최상단에 model loaded 문구가 표시
- 2. 이 상태에서 웹페이지 접속 시, 잠깐의 대기시간 후에 [정확도, 박스X좌표 시작, 박스X좌표 끝, 박스Y좌표 시작, 박스Y좌표 끝] 으로 구성된 배열 표시. Array[1] 부터 Array[14] 까지 순서대로
"login", "login_input", "main_board", "main_graphic", "main_portal", "main_post", "main_video", "navigation", "search_bar", "search_picto", "sidebar", "sidebar_picto" 중 가장 정확도가
높은 박스 좌표를 담고 있다. 

# 확인해 주셨으면 하는 점
- 1. 연속으로 웹페이지를 변경하면 사진처럼 오류가 나오는데, 메모리 오류인지 아니면 코드 문제인지 아직 모르겠습니다. 같은 오류 메시지가 나오는지 확인 부탁드립니다.
