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
          minY+(maxY-minY)/10
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

    console.log("done");
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
      }
    });
  }
})


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