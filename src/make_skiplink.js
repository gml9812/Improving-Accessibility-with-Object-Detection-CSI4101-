//만약 만들어진 링크 없으면 그냥 빈 링크만 존재하는 것 고치기. => done
//beep음 async await 이용해 전부 끝나고 난 뒤 나게 하기.
//버튼 누르면 경계선 보이게 하기.


var login = [0,0,0];
var main = [0,0,0];
var navbar = [0,0,0];
var searchbar = [0,0,0];
var sidebar = [0,0,0];

for (let i=1;i<14;i++){ 
		if (0< i && i <= 2) {
			if (elemList[i][0] > login[0]) {
				login = elemList[i];
			}
		}
		else if (2 < i && i <= 8) {
			if (elemList[i][0] > main[0]) {
				main = elemList[i];
			}
		}
		else if (i === 9) {
			navbar = elemList[i];
		}
		//searchbar는 무조건 바 우선 
		else if (i === 10) {
			if (elemList[i][0] > searchbar[0]) {
				searchbar = elemList[i];
			}
		}		
		else if (11 < i && i <= 13) {
			if (elemList[i][0] > sidebar[0]) {
				sidebar = elemList[i];
			}
		}
}

//skip link의 style 설정
function setStyle() {
	var styles = `
	.custom_skip_link {
      top: -30px;
      left: 0;
      width: 138px;
      border: 1px solid #4ec53d;
      background: #333;
      text-align: center;
    }
    .custom_skip_link > span {
      display: inline-block;
      padding: 2px 6px 0 0;
      font-size: 13px;
      line-height: 26px;
      color: #fff;
      letter-spacing: -1px;
      white-space: nowrap;
    }`

    var styleTag = document.createElement('style');
    if (styleTag.styleSheet)
    	styleTag.styleSheet.cssText = styles;
    else
    	styleTag.appendChild(document.createTextNode(styles));
    document.getElementsByTagName('head')[0].prepend(styleTag);
}

//찾아낸 element의 id를 이용해 링크 만든다.
function makeLink(coordX,coordY,name) {
	var elem = document.elementFromPoint(coordX,coordY);

	if (elem === null || (coordX === 0 && coordY === 0)) {
		let emptyLink = document.createElement('a');
		let linkText = document.createElement('span');
		linkText.innerText = `현재 페이지에 ${name}은 없습니다`
		return emptyLink;
	}

	//만약 id 없다면 상위 element의 id 찾는다. 
	while (elem.id === "") {
		elem = elem.parentNode;
	}

	var skpLink = document.createElement('a');
	skpLink.href = `#${elem.id}`;
	skpLink.id = `$${name}$`;
	skpLink.className = "custom_skip_link";
	skpLink.tabIndex = 0;

    var linkText = document.createElement('span');
    linkText.innerText = name;

	console.log(coordX,coordY);
	console.log(document.elementFromPoint(coordX,coordY));

	skpLink.appendChild(linkText);
	return skpLink;
}

if (document.getElementById(`$skip_Link$`) === null ) {
	setStyle();
	var linkList = document.createElement('div');
	//@@@@@@@@@test.z-index: 99999'
	linkList.style = `position: absolute; top: -30px`;
	linkList.id = `$skip_Link$`;
	linkList.appendChild(makeLink(main[1],main[2],'본문'));
	linkList.appendChild(makeLink(navbar[1],navbar[2],'메뉴'));
	linkList.appendChild(makeLink(searchbar[1],searchbar[2],'검색'));
	linkList.appendChild(makeLink(login[1],login[2],'로그인'));
	linkList.appendChild(makeLink(sidebar[1],sidebar[2],'사이드바'));
	document.body.prepend(linkList);
	//다 만들어진 후, 링크 시작점에 포커스 옮긴다. ==>지금 안됨
	document.getElementById(`$skip_Link$`).focus();
}


var map = {};
//문제: 일단 스크롤 내려온 후에는 스크롤 위에 있는 요소(ex:nav) 접근 불가
onkeydown = function(e){
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';

	if (map[18] && map[49]) { //ALT + 1, 본문 점프
		map[18] = false;
		map[49] = false; 
		document.getElementById("$본문$").click();

	} else if (map[18] && map[50]) { //ALT + 2, 메뉴 점프 
		map[18] = false;
		map[50] = false;
		document.getElementById("$메뉴$").click();

	} else if (map[18] && map[51]) { //ALT + 3, 검색
		map[18] = false;
		map[51] = false;
		document.getElementById("$검색$").click();

	} else if (map[18] && map[81]) { //ALT + Q, 로그인 점프
		map[18] = false;
		map[81] = false; 
		document.getElementById("$로그인$").click();

	} else if (map[18] && map[87]) { //ALT + W, 사이드바 점프
		map[18] = false;
		map[87] = false;
		document.getElementById("$사이드바$").click(); 
	}
	console.log(map);
}

onkeyup = function(e){
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';
	console.log(e.type);
}


