//로드전에 다른 웹사이트 접근하면 계산 취소. 

//tf.js 라이브러리 로드 
import "babel-polyfill";
import * as tf from "@tensorflow/tfjs";

//model.json 위치 
const MODEL_URL = "https://raw.githubusercontent.com/gml9812/GUI-detection-model/main/mobilenet/model.json";
    
const IMAGE_SIZE_LOWBOUND = 640;

class Model {
  constructor(){
    this.loadModel();
    this.lock = false;
    this.model = null;
  }

  //Github에서 model.json 로드한다. 
  loadModel = async () => {
    console.log("loading model...");
    try {
      //WEBGL_PACK 끈다 
      tf.ENV.set('WEBGL_PACK', false);
      this.model = await tf.loadGraphModel(MODEL_URL);
      console.log(this.model);
      console.log("model loaded");
      //console.log(tf.ENV);
      //console.log(tf.getBackend());
    } catch(err) {
      console.log("unable to load model: ", err.message);
    }
  }

  //url 맨 뒤에 있는 스킵 링크(www.xxx.com/#skip_Link_Name)를 제거한다. 
  urlParse(url) {
    if (url.indexOf("#") == -1) return url;
    return url.substr(0,url.indexOf("#"));
  }

  //현재 탭 이미지를 모델에 넣어 각 GUI 요소들의 위치를 구한다. 
  predictImg(tabId,image,url) {
    if (this.lock) return;
    this.lock = true;


    //현재 URL의 캐시가 존재하는지 확인
    var cache = localStorage.getItem(this.urlParse(url));

    //만약 캐시가 존재한다면, 바로 skip link를 만든다. 
    if (cache != null) {
      chrome.tabs.executeScript(tabId,{
        code: 'var elemList = ' + cache
      }, function() {
        chrome.tabs.executeScript(tabId,{file: "src/make_skiplink.js"});
      });
      this.lock = false;
      return;
    }

    //캐시가 존재하지 않는다면, 모델을 사용해 skip link를 만들 요소를 인식한다. 
    tf.engine().startScope();
    this.model.executeAsync(this.processImg(image))
    .then(prediction => {
      console.log(prediction);
      this.parseResult(prediction,image,tabId,url)
      this.lock = false;
      tf.engine().endScope();
    })
    //종료시 알림음을 낸다.
    .then(() => {
      var beep = new Audio("src/sound.mp3");
    	beep.play();
    	console.log("done");
    });
  }

  processImg(image) {
    const img = tf.browser.fromPixels(image).toFloat();
    const batched = img.reshape([1,image.height,image.width,3]).toInt();
    return batched;
  }

  //모델이 산출한 결과물을 저장한다. 
  parseResult(prediction,image,tabId,url) {

    //mobilenet
    const boxes = prediction[2].arraySync();
    const scores = prediction[3].arraySync();

    //mobilenet.2
    //const boxes = prediction[4].arraySync();
    //const scores = prediction[5].arraySync();

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


    //캐시 저장
    //url에서 마지막에 #달린 부분은 제거하고 저장. 
    localStorage.setItem(this.urlParse(url),JSON.stringify(elemList));

    return;
  }
}

const model = new Model();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) {
    //새로운 웹페이지 접근하면, 스크린샷을 촬영한다. 
    var capturing = chrome.tabs.captureVisibleTab(null,null, function(dataUrl){
      var image = document.createElement('img');
      image.src = dataUrl;
          
      image.onload = function() {
        if (image.width < IMAGE_SIZE_LOWBOUND || image.height < IMAGE_SIZE_LOWBOUND) {
          console.log("screen too small")
          return;
        }
        if (model.model) {
          model.predictImg(tabId,image,tab.url);
        }

      }
    });
  }
});



//elemList 위치에 따른 type. 
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