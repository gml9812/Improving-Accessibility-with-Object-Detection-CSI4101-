console.log("popup js loaded");

var btn;

const checkStorage = async () => {
  chrome.storage.local.get(["state"], function (items) {
    switch (items.state) {
      case "loading":
        btn.style.backgroundColor = "white";
        btn.innerText = "Loading...";
        btn.disabled = true;
        break;
      case "loaded":
        btn.style.backgroundColor = "red";
        btn.innerText = "STOP";
        btn.disabled = false;
        break;
      case "stopped":
        btn.style.backgroundColor = "green";
        btn.innerText = "START";
        btn.disabled = false;
        break;
    }
  });
};

window.onload = () => {
  btn = document.getElementById("model_button");

  checkStorage();

  btn.addEventListener("click", () => {
    var port = chrome.extension.connect({
      name: "button",
    });
    chrome.storage.local.get(["state"], function (items) {
      switch (items.state) {
        case "loaded":
          port.postMessage("stop");
          break;
        case "stopped":
          port.postMessage("start");
          break;
      }
    });
  });
};

chrome.storage.onChanged.addListener(function (changes, namespace) {
  checkStorage();
});
