// import fs from 'fs';

import data from './data.json';

async function jsonRetrieve(){
  console.log(data);
  var raspDateElem = document.getElementById("raspDate");
  var raspLessonNameElem = document.getElementById("raspLessonName");
  var raspLessonTimeElem = document.getElementById("raspLessonTime");
  var raspLessonTeacherElem = document.getElementById("raspLessonTeacher");
  raspDateElem.innerText = data.raspDate;
  raspLessonNameElem.innerText = data.lessonName;
  raspLessonTimeElem.innerText = data.lessonTime;
  raspLessonTeacherElem.innerText = data.lessonTeacher;
  return data;
}
var jsonInfo = jsonRetrieve();


//  export function jsonLastReport(lastReport) {
    
//     var lastReportData = {"lastReport" : lastReport};
//    const data = JSON.stringify(lastReportData);
//    // writing the JSON string content to a file
//    fs.writeFileSync("data.json", data, (error) => {
//    // throwing the error
//    // in case of a writing problem
//    if (error) {
//      // logging the error
//      console.error(error);
  
//      throw error;
//    }
  
//    console.log("data.json written correctly");
//   });
//   }

//   //jsonLastReport(loadLastReport);

  