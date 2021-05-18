//tf.js 라이브러리 
import 'babel-polyfill';
import * as tf from '@tensorflow/tfjs';

//model.json 주소 
const MODEL_URL =
    "https://raw.githubusercontent.com/gml9812/GUI-detection-model/main/model.json";

class Model {
  constructor(){
    this.loadModel();
  }

  //깃허브에서 model.json 로드한다. 
  async loadModel() {
    try {
      this.model = await tf.loadGraphModel(MODEL_URL);
      console.log("model loaded");
      this.test(this.model);
    } catch {
      console.log("unable to load model");
    }
  }

  test(modelgiven) {
    chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
      if (changeInfo.status == 'complete' && tab.active) {
        //새로운 웹페이지 접근하면, 스크린샷을 촬영한다. 
        var capturing = chrome.tabs.captureVisibleTab(null,null,function(dataUrl){

          var image = document.createElement('img');
          image.src = dataUrl;


          image.onload = function() {
            if (image.width < 640 || image.height < 640) {
              console.log("screenshot too small")
              return;
            }

            //tf.tidy() 로 불필요한 텐서 삭제해 메모리 관리
            const logits = tf.tidy(() => {
              const img = tf.browser.fromPixels(image).toFloat();
              const batched = img.reshape([1,image.height,image.width,3]).toInt();

              //스크린샷을 모델에 넣는다. 
              const output = modelgiven.executeAsync(batched);
              output.then(prediction => {


                //1 + 6 => 7,10,11 (main_post, searchbar, search_picto), 범위는 정확.(post는 광고까지 포함)
                //1 + 3 => 7,9,10,11 (main_post, nav, searchbar, search_picto), 범위 극히 부정확, nav 정확/부정확 섞임 
                //2 + 6 => 
                //2 + 3 => 7,9,10,11 범위 정확 

                //const boxes = prediction[1].arraySync();
                const boxes = prediction[2].arraySync();
                const scores = prediction[3].arraySync();
                //const scores = prediction[6].arraySync();

                //가장 정확도 높게 나온 요소 위치 뽑아 elemList에 저장.
                //let elemList = new Array(14);
                let elemList = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
                for (let i=0; i< 300; i++) { 
                  for (let j=1; j< 14; j++) {
                    if (scores[0][i][j] > elemList[j][0]) {
                      const minY = boxes[0][i][0] * image.height;
                      const minX = boxes[0][i][1] * image.width;
                      const maxY = boxes[0][i][2] * image.height;
                      const maxX = boxes[0][i][3] * image.width;
                      let temp = [scores[0][i][j],minX,maxX,minY,maxY];
                      elemList[j] = temp;
                    }
                  }
                }
                //
                console.log(elemList);
            });
              

            });
            

          }
            
        });
      }
    })
  }

}

const model = new Model();





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