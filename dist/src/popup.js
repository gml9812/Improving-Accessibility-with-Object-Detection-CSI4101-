
window.onload = () => {
  let btn = document.getElementById("boundary_button");

  //버튼을 누르면 감지한 GUI 요소들의 Boundary가 표시되고, skip link가 드러난다. 
  btn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"},
      function(response) {
        document.getElementById('warning').innerText = response;
      })
    });
  })
};

