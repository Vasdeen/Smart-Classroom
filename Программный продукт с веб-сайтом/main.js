import puppeteer from 'puppeteer'
//const url = 'https://rasp.rusoil.net/?page=schedule&search=%7B"value"%3A"1-333"%2C"filial"%3A1%2C"auditor_id"%3A1503%2C"auditor_name"%3A"1-334"%7D'
const url = 'https://rasp.rusoil.net/?page=schedule&search=%7B"value"%3A"1-334"%2C"filial"%3A1%2C"auditor_id"%3A1504%2C"auditor_name"%3A"1-334"%7D'
import fs from 'fs';

var raspDate;
var raspDate2;

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}



function jsonData(raspData, filename) {
  // var raspData = {"raspDate" : raspDate,
  // "raspDate2" : raspDate2};
  const data = JSON.stringify(raspData);
  // writing the JSON string content to a file
  fs.writeFileSync(filename, data, (error) => {
  // throwing the error
  // in case of a writing problem
  if (error) {
    // logging the error
    console.error(error);

    throw error;
  }

  console.log("data.json written correctly");
});
}

  const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    sleep(3000);
    await page.screenshot({path: 'screenshot4.png'});
      const result = await page.evaluate(() => {
        console.log('wow works3!');
        const weekday = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
      const d = new Date();
      let minutes = d.getMinutes() + d.getHours()*60;
      let day = weekday[d.getDay()];
      //let day = 'понедельник';
      console.log(day);
      var day1 = 'четверг';
      //var day1 = day;
      var dayRetrieved = '';
        var childNumber = 2;
        while (day != dayRetrieved) {
      // 14/01 1:49 изменил day1 на day с целью убрать день-заглушку
        var articles = document.querySelector('#root > div > div.overflow-y-scroll.max-h-\\[calc\\(100vh-60px\\)\\] > div:nth-child('+ childNumber + ') > div > div.sticky.top-\\[10px\\].backdrop-blur-sm.bg-\\[rgba\\(255\\,255\\,255\\,0\\.8\\)\\].font-helvetica.self-center.text-\\[\\#8E8E8E\\].dark\\:bg-\\[rgba\\(30\\,30\\,30\\,0\\.8\\)\\].font-medium.text-\\[13px\\].laptop\\:text-\\[15px\\].rounded-\\[40px\\].px-\\[10px\\].py-\\[1px\\].mt-\\[10px\\].mb-\\[5px\\]').innerText
        dayRetrieved = articles.substr(0, articles.indexOf(','));
        childNumber += 1;
        }
        childNumber -= 1;
        
        
        var pairNumRetrieved = 0;
        //let minutes = 1000;
        
        
        // 14/01 1:49 верхняя строчка раскомменчена и строчка выше нее закомменчена
      var pairNum = 0;
      switch(true) {
  
        case (minutes >= 520 && minutes <625):  
        pairNum = 1
        break;
    
        case (minutes >= 625 && minutes <730):  
        pairNum = 2
        break;
    
        case (minutes >= 730 && minutes <840):  
        pairNum = 3
        break;
  
        case (minutes >= 840 && minutes <975):  
        pairNum = 4
        break;
  
        case (minutes >= 975 && minutes <1080):  
        pairNum = 5
        break;
  
        case (minutes >= 1080 && minutes <1185):  
        pairNum = 6
        break;
  
        case (minutes >= 1185 && minutes <1280):  
        pairNum = 2
        break;
    
        default:
        pairNum = 2
        console.log("Сейчас не учебное время.");
        break;
    }
    console.log("Номер пары: " + pairNum);

      if (pairNum != 0){
        var childNumberTime = 2;
        var PairPresence = 0;
    while (pairNum != pairNumRetrieved) {
      if (document.querySelector('#root > div > div.overflow-y-scroll.max-h-\\[calc\\(100vh-60px\\)\\] > div:nth-child('+ childNumber + ') > div > div:nth-child('+ childNumberTime + ')') != null) {
        var lessonTime = document.querySelector('#root > div > div.overflow-y-scroll.max-h-\\[calc\\(100vh-60px\\)\\] > div:nth-child('+ childNumber + ') > div > div:nth-child('+ childNumberTime + ') > div:nth-child(2)')
      //Название двойной пары
      //#root > div > div.overflow-y-scroll.max-h-\[calc\(100vh-60px\)\] > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1)
      //Препод
      //#root > div > div.overflow-y-scroll.max-h-\[calc\(100vh-60px\)\] > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(2)
      //Текст
      //#root > div > div.overflow-y-scroll.max-h-\[calc\(100vh-60px\)\] > div:nth-child(2) > div > div:nth-child(2) > div.text-\[14px\].laptop\:text-\[16px\].leading-\[19px\].laptop\:mt-\[6px\].mt-\[5px\].text-\[\#EEA02B\]
      var lessonTimeText = lessonTime.innerText;
      
      pairNumRetrieved = lessonTimeText.substr(0, lessonTimeText.indexOf(' '));
      childNumberTime += 1;
      PairPresence = 1;
        }
      else {
        var noLessons = "Нет занятий";
        var raspData = {"raspDate" : noLessons,
    "lessonTime" : noLessons,
    "lessonName" : noLessons, 
    "lessonTeacher": noLessons};
        pairNumRetrieved = pairNum;
        PairPresence = 0;
      }
      }
          if (PairPresence == 1){
            childNumberTime -= 1;
            var lessonName = document.querySelector('#root > div > div.overflow-y-scroll.max-h-\\[calc\\(100vh-60px\\)\\] > div:nth-child('+ childNumber + ') > div > div:nth-child('+ childNumberTime + ') > div:nth-child(1)')
            var lessonTeacher = document.querySelector('#root > div > div.overflow-y-scroll.max-h-\\[calc\\(100vh-60px\\)\\] > div:nth-child('+ childNumber + ') > div > div:nth-child('+ childNumberTime + ') > div:nth-child(3)')
            console.log(articles);
          console.log('wow works!');
          //return articles;
          var raspData = {"raspDate" : articles,
        "lessonTime" : lessonTime.innerText,
        "lessonName" : lessonName.innerText, 
        "lessonTeacher": lessonTeacher.innerText};
          }
          else {
            var noLessons = "Нет занятий";
            var raspData = {"raspDate" : noLessons,
            "lessonTime" : noLessons,
            "lessonName" : noLessons, 
            "lessonTeacher": noLessons};
          }
      }
      else {
        var noLessons = "Нет занятий";
        var raspData = {"raspDate" : noLessons,
    "lessonTime" : noLessons,
    "lessonName" : noLessons, 
    "lessonTeacher": noLessons};
      }
      // return lessonName.innerText;
      return raspData;
      });
      const weekday = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
      const d = new Date();
      let day = weekday[d.getDay()];
      console.log(day);
      
      console.log('wow works2!');
      console.log(result);
      
    await browser.close();
    jsonData(result, "data.json");
    var noLessons = "Нет занятий";
    var testData = {"raspDate" : noLessons,
    "lessonTime" : noLessons,
    "lessonName" : noLessons, 
    "lessonTeacher": noLessons};
    
    jsonData(testData, "data3.json");
    
  }
  
  
  main();






