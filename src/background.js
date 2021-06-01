//로드전에 다른 웹사이트 접근하면 계산 취소. 

//tf.js 라이브러리 
import "babel-polyfill";
import * as tf from "@tensorflow/tfjs";

//model.json 주소 
const MODEL_URL = "https://raw.githubusercontent.com/gml9812/GUI-detection-model/main/mobilenet/model.json";
    
const IMAGE_SIZE_LOWBOUND = 640;

class Model {
  constructor(){
    this.loadModel();
    this.lock = false;
    this.model = null;
  }

  //깃허브에서 model.json 로드한다. 
  loadModel = async () => {
    console.log("loading model...");
    try {
      tf.ENV.set('WEBGL_PACK', false);
      this.model = await tf.loadGraphModel(MODEL_URL);
      console.log(this.model);
      console.log("model loaded");


      //정확도 비슷, WEBGL_PACK 끄면 gpu 사용량 왠지 모르지만 줄어듬. 
      console.log(tf.ENV);
      console.log(tf.getBackend());



    } catch(err) {
      console.log("unable to load model: ", err.message);
    }
  }
  //url 맨 뒤에 있는 스킵 링크(www.xxx.com/#skip_Link_Name)를 제거한다. 
  urlParse(url) {
    if (url.indexOf("#") == -1) return url;
    return url.substr(0,url.indexOf("#"));
  }

  predictImg(tabId,image,url) {
    //체크 
    if (this.lock) return;
    this.lock = true;
    //캐시 체크
    var cache = localStorage.getItem(this.urlParse(url));
    //console.log(cache);
    if (cache != null) {
      //캐시 통해서 make_skiplink.js 사용한다. 
      //이 부분 함수화하기 
      //url과 화면 사이즈 전부 같이. 
      chrome.tabs.executeScript(tabId,{
      code: 'var elemList = ' + cache
      }, function() {
        chrome.tabs.executeScript(tabId,{file: "src/make_skiplink.js"});
      });
      this.lock = false;
      return;
    }

    tf.engine().startScope();
    this.model.executeAsync(this.processImg(image)).then(prediction => {
      console.log(prediction);
      this.parseResult(prediction,image,tabId,url)
      this.lock = false;
      tf.engine().endScope();
    });
  }

  processImg(image) {
    //faster-rcnn
    const img = tf.browser.fromPixels(image).toFloat();
    const batched = img.reshape([1,image.height,image.width,3]).toInt();
    return batched;
  }

  //1 + 6 => 7,10,11 (main_post, searchbar, search_picto), 범위는 정확.(post는 광고까지 포함)
  //1 + 3 => 7,9,10,11 (main_post, nav, searchbar, search_picto), 범위 극히 부정확, nav 정확/부정확 섞임 
  //2 + 6 => 
  //2 + 3 => 7,9,10,11 범위 정확 
  parseResult(prediction,image,tabId,url) {

    //mobilenet
    const boxes = prediction[2].arraySync();
    const scores = prediction[3].arraySync();



    //mobilenetv2
    //const boxes = prediction[4].arraySync();
    //const scores = prediction[5].arraySync();
    
    console.log(boxes);
    console.log(scores);

    let elemList = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0; i<100; i++) {
      for (let j=0; j<14; j++) {
        if (scores[0][i][j] > elemList[j][0]) {

          const minY = boxes[0][i][0] * image.height;
          const minX = boxes[0][i][1] * image.width;
          const maxY = boxes[0][i][2] * image.height;
          const maxX = boxes[0][i][3] * image.width;
          
          elemList[j] = [
          scores[0][i][j],
          minX+(maxX-minX)/10,
          minY+(maxY-minY)/5
          ];
        }

      }
    }

    chrome.tabs.executeScript(tabId,{
      code: 'var elemList = ' + JSON.stringify(elemList)
    }, function() {
          chrome.tabs.executeScript(tabId,{file: "src/make_skiplink.js"});
       });


    //캐싱
    //url에서 마지막에 #달린 부분은 제거하고 저장. 
    localStorage.setItem(this.urlParse(url),JSON.stringify(elemList));

    return;
  }
}

const model = new Model();


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) {
    //새로운 웹페이지 접근하면, 스크린샷을 촬영한다. 
    var capturing = chrome.tabs.captureVisibleTab(null,null,function(dataUrl){
      var image = document.createElement('img');
      image.src = dataUrl;

      //console.log(tab);
          
      image.onload = function() {
        if (image.width < IMAGE_SIZE_LOWBOUND || image.height < IMAGE_SIZE_LOWBOUND) {
          console.log("screen too small")
          return;
        }
        //while (!model.model);
        if (model.model) model.predictImg(tabId,image,tab.url);

        var beep = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    	beep.play();
    	console.log("done");

      }
    });
  }
});


chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected .....");
  port.onMessage.addListener(function (msg) {
    if (msg == "stop") {
      chrome.tabs.onUpdated.removeListener(listener);
      chrome.storage.local.set({ state: "stopped" }, function () {});
    }
    if (msg == "start") {
      chrome.tabs.onUpdated.addListener(listener);
      chrome.storage.local.set({ state: "loaded" }, function () {});
    }
  });
});

////elemList 위치에 따른 type. 
/*
item {
    name: "login",
    id: 1,
    display_name: "login"
}
item {
    name: "login_input",
    id: 2,
    display_name: "login_input"
}
item {
    name: "main_board",
    id: 3,
    display_name: "main_board"
}
item {
    name: "main_card",
    id: 4,
    display_name: "main_card"
}
item {
    name: "main_graphic",
    id: 5,
    display_name: "main_graphic"
}
item {
    name: "main_portal",
    id: 6,
    display_name: "main_portal"
}
item {
    name: "main_post",
    id: 7,
    display_name: "main_post"
}
item {
    name: "main_video",
    id: 8,
    display_name: "main_video"
}
item {
    name: "navigation",
    id: 9,
    display_name: "navigation"
}
item {
    name: "search_bar",
    id: 10,
    display_name: "search_bar"
}
item {
    name: "search_picto",
    id: 11,
    display_name: "search_picto"
}
item {
    name: "sidebar",
    id: 12,
    display_name: "sidebar"
}
item {
    name: "sidebar_picto",
    id: 13,
    display_name: "sidebar_picto"
}
*/