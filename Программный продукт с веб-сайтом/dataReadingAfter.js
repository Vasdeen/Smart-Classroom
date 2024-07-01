import data from "./data.json" assert { type: 'json' };




setTimeout(loadTopInfo, 1)
function loadTopInfo(){
    var entireLessonData = data;
console.log(entireLessonData);
    var raspDateElem = document.getElementById("info");
    var raspLessonNameElem = document.getElementById("center3");
    var raspLessonTimeElem = document.getElementById("right");
    var raspLessonTeacherElem = document.getElementById("left");
    console.log("жто тут")
//     var raspDateElem = document.getElementById("raspDate");
//   var raspLessonNameElem = document.getElementById("raspLessonName");
//   var raspLessonTimeElem = document.getElementById("raspLessonTime");
//   var raspLessonTeacherElem = document.getElementById("raspLessonTeacher");

    raspDateElem.innerText = data.raspDate;
    raspLessonNameElem.innerText = data.lessonName;
    raspLessonTimeElem.innerText = data.lessonTime;
    raspLessonTeacherElem.innerText = data.lessonTeacher;



    var subjectName = raspLessonNameElem.innerText;
    //console.log(subjectName + " mommy");
    var dateName = raspDateElem.innerText;
    var groupName = raspLessonTeacherElem.innerText;
    var teacherName = groupName;
    console.log("teacher 1 "+ teacherName)
    var groupIndex = groupName.indexOf("‧");
    groupName = groupName.slice(groupIndex+2);
    //console.log(groupName + " groupName");
    raspLessonTeacherElem.innerText = groupName;

    

    var pairTime = raspLessonTimeElem.innerText;
    var pairIndex = pairTime.indexOf("‧");
    pairTime = pairTime.slice(pairIndex+2);
    //console.log(pairTime + " groupName");
    

    var teacherIndex = teacherName.indexOf("‧");
    teacherName = teacherName.slice(0, teacherIndex);
    console.log("teacher 2 "+ teacherName)
        var pairNumber = raspLessonTimeElem.innerText;
        var numIndex = pairNumber.indexOf("‧");
        pairNumber = pairNumber.slice(0, numIndex-1);
        //console.log(pairNum + " groupName");
        //additionalInfo.innerText = pairTime;
        var subjectContainer1 = document.getElementById("center3");
        subjectContainer1.innerText = teacherName;
    
    raspLessonTimeElem.innerText = pairTime;

    //console.log(subjectName + " mommy2");

    var subjectContainer2 = document.getElementById("center");
        subjectContainer2.innerText = subjectName;

    
    //console.log("teacherName = " + teacherName);
    
    console.log(subjectName + " teacherName");
    console.log(groupName + " groupName");
    console.log(teacherName + " teacherName");
    console.log(dateName + " dateName");
    console.log(pairNumber + "pairNumber");
    raspDateElem.innerText = pairNumber + ", " + raspDateElem.innerText;
    //raspLessonTeacherElem.innerText = groupName;
};
