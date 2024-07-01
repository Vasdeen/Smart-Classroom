import data from "./data.json" assert { type: 'json' };

var entireLessonData = data;
console.log(entireLessonData);
    var raspDateElem = document.getElementById("info");
    var raspLessonNameElem = document.getElementById("center3");
    var raspLessonTimeElem = document.getElementById("right");
    var raspLessonTeacherElem = document.getElementById("left");

//     var raspDateElem = document.getElementById("raspDate");
//   var raspLessonNameElem = document.getElementById("raspLessonName");
//   var raspLessonTimeElem = document.getElementById("raspLessonTime");
//   var raspLessonTeacherElem = document.getElementById("raspLessonTeacher");

    raspDateElem.innerText = data.raspDate;
    raspLessonNameElem.innerText = data.lessonName;
    raspLessonTimeElem.innerText = data.lessonTime;
    raspLessonTeacherElem.innerText = data.lessonTeacher;


