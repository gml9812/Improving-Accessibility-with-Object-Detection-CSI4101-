chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse) {
      console.log('a')
      if (request.greeting == "hello") {
          let skpLink = document.getElementById('$skip_Link$')
          //만약 skip link가 생성되지 않았다면 생성 전이라는 메시지 띄운다.
          if (skpLink === null) {
              sendResponse('아직 건너뛰기 링크가 생성되지 않았어요!')
          } else {
              //건너뛰기 링크들 보이게 한다. 
              skpLink.style.top = '0px';
              skpLink.style.zIndex = 99999;

              //각각 링크 위치에 빨간색 boundary 그린다. 
              let list = document.getElementsByClassName('custom_skip_link');
              Array.from(list).forEach((link) => {
                  let id = link.href.split('#')[1]
                  document.getElementById(id).style.border = "5px solid red"
              })
              sendResponse('완료!')
          }
      }
    }
)
