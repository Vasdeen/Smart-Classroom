

const Telegraf = require("telegraf")
// доступ к боту - @SmartAu_Bot
const XLSX = require("xlsx");
var firebase = require('firebase');
const telegramToken = "6771461537:AAHsKer47Ws7SocKzkZ0wu9iPo-82dNtads"
const openaiKey = ""

const bot = new Telegraf.Telegraf(telegramToken)

var authCode = 0;

function reply2(text) {
    var text1 = text + "супер!!";
    return text1;
}

// const firebaseConfig = {
//     apiKey: "AIzaSyBJcZQaiwJHTndkWS5WEaQTquuE2SsMZ_g",
//     authDomain: "smau-workplace.firebaseapp.com",
//     databaseURL: "https://smau-workplace-default-rtdb.europe-west1.firebasedatabase.app/",
  
//     projectId: "smau-workplace",
//     storageBucket: "smau-workplace.appspot.com",
//     messagingSenderId: "449194790558",
//     appId: "1:449194790558:web:799b554a50ccaea50b758f",
//     measurementId: "G-8VSXVK5PPF"
//   };

const firebaseConfig = {
  apiKey: "AIzaSyDsu2cHBJuget5uyIf3abTrs2wZJqhLR7g",
  authDomain: "smau-temp.firebaseapp.com",
  databaseURL: "https://smau-temp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smau-temp",
  storageBucket: "smau-temp.appspot.com",
  messagingSenderId: "208565502888",
  appId: "1:208565502888:web:4df62cc01d3ebf4729539d",
  measurementId: "G-FWJBGEFGFY"
};

    function dbConnect(){
    firebase.initializeApp(firebaseConfig)
      var database = firebase.database()
      return database
  }
  var database = dbConnect()

  async function readFromDB(routeDB) {
    return new Promise((resolve, reject) => {
        // simulate asynchronous operation
        var result;
        var teacher_ref = database.ref(routeDB);
        teacher_ref.on('value', (snapshot) => {
                    var data = snapshot.val();
                  if (data == null){
                    console.log("ошибка");
                  }
                  else {
                    result = data;
                    // console.log("! класс! читаем любое! " + result);
                    // console.log(result);
                    
                  }
                  resolve(result);
                });
    });
}






/////////////////////разные fb функции для получения данных для журнала

async function checkJournals(groupName, pairNumber){
    
    
  dateToday = new Date();
  today = dateToday.getDate();
  today = today + "-" + (dateToday.getMonth()+1)	
  today = today + "-" + (dateToday.getFullYear())	
  // groupName = document.getElementById("left").innerText;
  // console.log(groupName + "LessonTeacher data")
  // var groupIndex = groupName.indexOf("‧");
  // groupName = groupName.slice(groupIndex+2);
  console.log('journals/'+groupName+'/'+today);

  // pairNumber = document.getElementById("right").innerText.slice(0, 1);
  console.log("номер пары - "+ pairNumber);
  
  var pairJournalEntry = await readFromDB('journals/'+groupName+'/'+today+'/'+pairNumber);

  console.log('ваши студенты на паре:' + 'journals/'+groupName+'/'+today+'/'+pairNumber);
  
  //console.log('ваши студенты на паре номер:' + pairJournalEntry.count);
  let pairArrayTest = [];
  
    for (let i in pairJournalEntry){
    pairArrayTest.push([i, pairJournalEntry [i]]);
  }
  await console.log('ваши студенты на паре:');
  await console.log(pairArrayTest);
  return pairArrayTest;
}
  
async function checkGroup(groupName){
var groupInfoEntry = await readFromDB('groups/'+groupName);

if (groupInfoEntry == undefined) {
  database.ref('groups/' + groupName).update({
    count: 0
  })
  groupInfoEntry = await readFromDB('groups/'+groupName);
  }
return groupInfoEntry;  
}


async function loadGroup(groupName){
console.log("имя группы:"+ groupName);
//var groupStudents = await readFromDB('groups/'+ groupName);
//checkGroup(groupName);
var groupStudents = await checkGroup(groupName);
var studentString = " ";
//console.log("groupStudents");
//console.log(groupStudents);
studentArray = Object.entries(groupStudents);
  for (let i = 0; i <= groupStudents.count-1; i++)
  {
  studentString = studentString + studentArray[i][1].surname + " " + studentArray[i][1].name  +  " " + studentArray[i][1].patronym + "\n";  
  }
return studentArray
}


  async function loadSite(groupName, subjectName){
  var studentsOnPairForTable = await checkJournals();
  await studentsOnPairForTable.pop();
  await console.log("в итоговый сайт загрузили с пары:");
  await console.log(studentsOnPairForTable);
  var studentsInGroupForTable = await loadGroup(groupName);
  await console.log("в итоговый сайт загрузили группу:");
  await studentsInGroupForTable.pop();
  await console.log(studentsInGroupForTable);
      
  var names = await [];
  for (i in studentsInGroupForTable) {
      names[i] = await studentsInGroupForTable[i][1].surname; 
  }
  await console.log(names);
  await console.log(names.length);
  
  var allSubjectEntries = await  readFromDB('journals/'+groupName);
  console.log("Выдан журнал группы!");

  var allSubjectEntriesArray = await Object.entries(allSubjectEntries);
  await allSubjectEntriesArray.pop();

  var allSubjectEntriesMarks = [];
  for (i in names){
      await allSubjectEntriesMarks.push([])
  }
  for (i in allSubjectEntriesArray){
      var subjectPairNum = 0;
      for (j in allSubjectEntriesArray[i][1]){
          
           await console.log(allSubjectEntriesArray[i][1][j].subject);
           
           if (allSubjectEntriesArray[i][1][j].subject == subjectName) {
              subjectPairNum +=1;
              for (k in allSubjectEntriesArray[i][1][j]) {
                  if (allSubjectEntriesArray[i][1][j][k].mark >=0){
                  await allSubjectEntriesMarks[k].push([subjectPairNum, allSubjectEntriesArray[i][1][j][k].mark]);
              }
              }
              
           }
      }
  }
  var subjectLessonsNumber = allSubjectEntriesMarks[0].length;
  var dates = [];
  for (i = 1;  i<= subjectLessonsNumber; i++){
      dates.push(i);
  }
  console.log("number of dates");
  console.log(dates);
  var data2 = [];
  for ( j in allSubjectEntriesMarks){
          await data2.push([]);
  }
  for ( j in allSubjectEntriesMarks){
      for (i in dates){
          await data2[j].push(allSubjectEntriesMarks[j][i][1]);
      }
  }

   console.log("data2");
   console.log(data2);
  for (i in data2){
    var markString = ''
    for (j in data2[i]){
      if (markString == '') markString += data2[i][j];
      else markString += ', ' + data2[i][j];
    }
    data2[i] = markString;
  
  }

  return data2;
  }



/////////////////////

async function loadAvgMarks(groupName, subjectName){
  var studentsOnPairForTable = await checkJournals();
  await studentsOnPairForTable.pop();
  await console.log("в итоговый сайт загрузили с пары:");
  await console.log(studentsOnPairForTable);
  var studentsInGroupForTable = await loadGroup(groupName);
  await console.log("в итоговый сайт загрузили группу:");
  await studentsInGroupForTable.pop();
  await console.log(studentsInGroupForTable);
      
  var names = await [];
  for (i in studentsInGroupForTable) {
      names[i] = await studentsInGroupForTable[i][1].surname; 
  }
  await console.log(names);
  await console.log(names.length);
  
  var allSubjectEntries = await  readFromDB('journals/'+groupName);
  console.log("Выдан журнал группы!");

  var allSubjectEntriesArray = await Object.entries(allSubjectEntries);
  await allSubjectEntriesArray.pop();

  var allSubjectEntriesMarks = [];
  for (i in names){
      await allSubjectEntriesMarks.push([])
  }
  for (i in allSubjectEntriesArray){
      var subjectPairNum = 0;
      for (j in allSubjectEntriesArray[i][1]){
          
           await console.log(allSubjectEntriesArray[i][1][j].subject);
           
           if (allSubjectEntriesArray[i][1][j].subject == subjectName) {
              subjectPairNum +=1;
              for (k in allSubjectEntriesArray[i][1][j]) {
                  if (allSubjectEntriesArray[i][1][j][k].mark >=0){
                  await allSubjectEntriesMarks[k].push([subjectPairNum, allSubjectEntriesArray[i][1][j][k].mark]);
              }
              }
              
           }
      }
  }
  var subjectLessonsNumber = allSubjectEntriesMarks[0].length;
  var dates = [];
  for (i = 1;  i<= subjectLessonsNumber; i++){
      dates.push(i);
  }
  console.log("number of dates");
  console.log(dates);
  var data2 = [];
  for ( j in allSubjectEntriesMarks){
          await data2.push([]);
  }
  for ( j in allSubjectEntriesMarks){
      for (i in dates){
          await data2[j].push(allSubjectEntriesMarks[j][i][1]);
      }
  }

   console.log("data2");
   console.log(data2);
  for (i in data2){
    var markSum = 0;
    var markNum = 0;
    var markAvg = 0;
    for (j in data2[i]){
      if (data2[i][j] != 0) {markSum += data2[i][j];
        markNum += 1;
      }
    
    }
    if (markSum != 0) markAvg = markSum / markNum;
    data2[i] = markAvg;
  }

  return data2;
  }

/////////////////////
async function loadAvgPresence(groupName, subjectName){
  var studentsOnPairForTable = await checkJournals();
  await studentsOnPairForTable.pop();
  await console.log("в итоговый сайт загрузили с пары:");
  await console.log(studentsOnPairForTable);
  var studentsInGroupForTable = await loadGroup(groupName);
  await console.log("в итоговый сайт загрузили группу:");
  await studentsInGroupForTable.pop();
  await console.log(studentsInGroupForTable);
      
  var names = await [];
  for (i in studentsInGroupForTable) {
      names[i] = await studentsInGroupForTable[i][1].surname; 
  }
  await console.log(names);
  await console.log(names.length);
  
  var allSubjectEntries = await  readFromDB('journals/'+groupName);
  console.log("Выдан журнал группы!");

  var allSubjectEntriesArray = await Object.entries(allSubjectEntries);
  await allSubjectEntriesArray.pop();

  var allSubjectEntriesMarks = [];
  for (i in names){
      await allSubjectEntriesMarks.push([])
  }
  for (i in allSubjectEntriesArray){
      var subjectPairNum = 0;
      for (j in allSubjectEntriesArray[i][1]){
          
           await console.log(allSubjectEntriesArray[i][1][j].subject);
           
           if (allSubjectEntriesArray[i][1][j].subject == subjectName) {
              subjectPairNum +=1;
              for (k in allSubjectEntriesArray[i][1][j]) {
                  if (allSubjectEntriesArray[i][1][j][k].absence >=0){
                  await allSubjectEntriesMarks[k].push([subjectPairNum, allSubjectEntriesArray[i][1][j][k].absence]);
              }
              }
              
           }
      }
  }
  var subjectLessonsNumber = allSubjectEntriesMarks[0].length;
  var dates = [];
  for (i = 1;  i<= subjectLessonsNumber; i++){
      dates.push(i);
  }
  console.log("number of dates");
  console.log(dates);
  var data2 = [];
  for ( j in allSubjectEntriesMarks){
          await data2.push([]);
  }
  for ( j in allSubjectEntriesMarks){
      for (i in dates){
          await data2[j].push(allSubjectEntriesMarks[j][i][1]);
      }
  }

   console.log("data2");
   console.log(data2);
  for (i in data2){
    var markSum = 0;
    var markNum = 0;
    var markAvg = 0;
    for (j in data2[i]){
      
      if (data2[i][j] == 2) {markSum += 1;}
      else {markSum += data2[i][j]}
      markNum += 1;

    
    }
    if (markSum != 0) markAvg = markSum / markNum;
    data2[i] = markAvg;
  }

  return data2;
  }

  async function loadAvgLateness(groupName, subjectName){
    var studentsOnPairForTable = await checkJournals();
    await studentsOnPairForTable.pop();
    await console.log("в итоговый сайт загрузили с пары:");
    await console.log(studentsOnPairForTable);
    var studentsInGroupForTable = await loadGroup(groupName);
    await console.log("в итоговый сайт загрузили группу:");
    await studentsInGroupForTable.pop();
    await console.log(studentsInGroupForTable);
        
    var names = await [];
    for (i in studentsInGroupForTable) {
        names[i] = await studentsInGroupForTable[i][1].surname; 
    }
    await console.log(names);
    await console.log(names.length);
    
    var allSubjectEntries = await  readFromDB('journals/'+groupName);
    console.log("Выдан журнал группы!");
  
    var allSubjectEntriesArray = await Object.entries(allSubjectEntries);
    await allSubjectEntriesArray.pop();
  
    var allSubjectEntriesMarks = [];
    for (i in names){
        await allSubjectEntriesMarks.push([])
    }
    for (i in allSubjectEntriesArray){
        var subjectPairNum = 0;
        for (j in allSubjectEntriesArray[i][1]){
            
             await console.log(allSubjectEntriesArray[i][1][j].subject);
             
             if (allSubjectEntriesArray[i][1][j].subject == subjectName) {
                subjectPairNum +=1;
                for (k in allSubjectEntriesArray[i][1][j]) {
                    if (allSubjectEntriesArray[i][1][j][k].absence >=0){
                    await allSubjectEntriesMarks[k].push([subjectPairNum, allSubjectEntriesArray[i][1][j][k].absence]);
                }
                }
                
             }
        }
    }
    var subjectLessonsNumber = allSubjectEntriesMarks[0].length;
    var dates = [];
    for (i = 1;  i<= subjectLessonsNumber; i++){
        dates.push(i);
    }
    console.log("number of dates");
    console.log(dates);
    var data2 = [];
    for ( j in allSubjectEntriesMarks){
            await data2.push([]);
    }
    for ( j in allSubjectEntriesMarks){
        for (i in dates){
            await data2[j].push(allSubjectEntriesMarks[j][i][1]);
        }
    }
  
     console.log("data2");
     console.log(data2);
    for (i in data2){
      var markSum = 0;
      var markNum = 0;
      var markAvg = 0;
      for (j in data2[i]){
        
        if (data2[i][j] == 2) {markSum += 1; markNum += 1;}
        else if (data2[i][j] == 1) {markSum += 0; markNum += 1;}
        
  
      
      }
      if (markSum != 0) markAvg = markSum / markNum;
      data2[i] = markAvg.toFixed(2);;
    }
  
    return data2;
    }

/////////////////////
async function getlastgroup_lesson() {
    var groupArray = await readFromDB("journals/' + groupName")
}

async function checkGroup(groupName){
  var groupInfoEntry = await readFromDB('groups/'+groupName);
  
  if (groupInfoEntry == undefined) {
    database.ref('groups/' + groupName).update({
      count: 0
    })
    groupInfoEntry = await readFromDB('groups/'+groupName);
    }
  return groupInfoEntry;  
}

bot.command('start', async (ctx) => {
    ctx.reply("Здравствуйте! Введите свой идентификатор.");
    
  })

 
    // bot.on("text", async (ctx) => {
    //     var chatTemp = await readFromDB("text");
    //     //const chatResponse = await reply2(ctx.message.text);
         
    //     //console.log(chatResponse);
    //     ctx.reply("Здравствуйте, Вы успешно сканировали свой отчёт. Вот ваше значение:" + chatResponse);
    // })

    async function checkTeacher(testRFID){
      var teachers = await readFromDB('teachers/');
      var teacherStatus = 0;
      var teacherPosition = -1;
      var subjectStatus = 0;
      teacherArray = await Object.entries(teachers);
      await teacherArray.pop();
      console.log(teacherArray);
      for (let i in teacherArray){
        if (teacherArray[i][1].botAuth == testRFID) {
            teacherStatus = await 1;
            teacherPosition = await i;
        }
    
      }
      return teacherStatus;
    }


    async function getTeacher(){
      var teachers = await readFromDB('teachers/');
      var teacherStatus = 0;
      
      teacherArray = await Object.entries(teachers);
      await teacherArray.pop();
      console.log(teacherArray);
      for (let i in teacherArray){
        if (teacherArray[i][1].botAuth == authCode) {
          var teacherInfo = teacherArray[i][1];
        }

      }
      console.log("Преподддд");
      console.log(teacherInfo);
      return teacherInfo;
    }


    bot.command('getlastgroup_lesson', async (ctx) => {
        //ctx.reply("Последнее занятие по вашей дисциплине");
        const chatResponse = await readFromDB('auditorium/1-333/lastSync/reportsChecked');
        ctx.reply("Здравствуйте, Вы успешно сканировали свой отчёт. Вот ваше значение:" + chatResponse);
      })
    
    bot.command('getlastgroup_allinfo', async (ctx) => {
        //ctx.reply("Последнее занятие по вашей дисциплине");
        const chatResponse = await readFromDB('auditorium/1-333/lastSync/reportsChecked');
        ctx.reply("Здравствуйте, Вы успешно сканировали свой отчёт всех групп. Вот ваше значение:" + chatResponse);
      })

      bot.command('get_reports', async (ctx) => {
        //ctx.reply("Последнее занятие по вашей дисциплине");
        if (authCode != 0){
        var teacherData = await getTeacher();
        //const chatResponse = await readFromDB('auditorium/1-333/lastSync/reportsChecked');
        await JSONtoExcel(teacherData);
        await ctx.reply("Вы успешно составили отчёт посещаемости и учебного прогресса студентов по преподаваемым дисциплинам:");
        await ctx.replyWithDocument({ source: documentName });
        }
        else {
        await ctx.reply("Вы не ввели свой идентификатор. Пожалуйста, выберите функцию входа в аккаунт для доступа к данной функции.");
        }
      })

      bot.command('get_access', async (ctx) => {
        ctx.reply(" Для доступа к функциям бота, пожалуйста, введите свой идентификатор преподавателя.");
        //const chatResponse = await readFromDB('auditorium/1-333/lastSync/reportsChecked');
        var responseRFID;
        bot.on('text', async (ctx) => { 
          responseRFID = ctx.text;
          ctx.reply("Вы ввели идентификатор: " + ctx.text + ". Проверяем ваш идентификатор..."); 
          if (await checkTeacher(responseRFID) == 1) {
            authCode = responseRFID;
            teacherData = await getTeacher();
            console.log(teacherData);
            ctx.reply("Здравствуйте, " + teacherData.name + " " + teacherData.patronym +"! Вы успешно авторизовались."); 
          }
          else {
            ctx.reply("Такого преподавателя не существует или вы ввели неправильный идентификатор."); 
          }
        });
      })


      bot.command('getlastgroup_file', async (ctx) => {
        //ctx.reply("Последнее занятие по вашей дисциплине");
        const chatResponse = await readFromDB('auditorium/1-333/lastSync/reportsChecked');
        await JSONtoExcel();
        await ctx.reply("Здравствуйте, Вы успешно сканировали свой отчёт всех групп. Вот ваше значение:" + chatResponse);
        await ctx.replyWithDocument({ source: documentName });
      })
    bot.launch();


//     //////////
//     ////excel work
//     /////////

    // const newBook = XLSX.utils.book_new();

    // const raw_data = {
    //   "name": {
    //     "first": "John",          // <-- first name
    //     "last": "Adams"           // <-- last name
    //   },
    //   "bio": {
    //     "birthday": "1735-10-19", // <-- birthday
    //   },
    //   "terms": [                  // <-- array of presidential terms
    //     { "type": "viceprez", "start": "1789-04-21", },
    //     { "type": "viceprez", "start": "1793-03-04", },
    //     { "type": "prez",     "start": "1797-03-04", } // <-- presidential term
    //   ]
    // }
  var documentName = '';
  async function JSONtoExcel (teacherData) {
  
    
    var wscols = [
      {wch: 20}, // "characters"
      {wch: 20},
      {wch: 22},
      {wch: 20}
      // {wpx: 50}, // "pixels"
      // ,
      // {hidden: true} // hide column
  ];
    ///
    //worksheet['!cols'].push({ width: 20 })
    var rows2;
    const workbook = XLSX.utils.book_new();
    var worksheet;
  var sheetNum = 0;
  var sheetName = '';
  subjectsArray = await Object.entries(teacherData.subjects);
  subjectsArray.pop();
  console.log(subjectsArray)
  console.log('элемент массива предметов');
  console.log(subjectsArray[0][1].name);
  for (i in subjectsArray){
  
    console.log(subjectsArray[i][1]);
    if (subjectsArray[i][1] != undefined){
      sheetNum += 1;
      console.log (subjectsArray[i][1].groupName)
      var subjectNameValue = subjectsArray[i][1].groupName;
      var groupNameValue = subjectsArray[i][1].name;
      console.log ("почти у цели!")
      rows2 = await getGroupInfo(subjectsArray[i][1].groupName, subjectsArray[i][1].name);
      //sheetName = subjectsArray[i][1].groupName +" "+ subjectsArray[i][1].name;
      console.log ("почти у цели! 2")
      worksheet = await XLSX.utils.json_to_sheet(rows2);
      console.log ("почти у цели! 3")
      worksheet['!cols'] = wscols;
      console.log ("почти у цели! 4")
      await XLSX.utils.book_append_sheet(workbook, worksheet, sheetNum.toString());
      console.log ("почти у цели! 5")
      ////
      console.log('колво человек - ' + rows2.length)
      console.log(rows2)
    
    var cellRef = await XLSX.utils.encode_cell({c: 0, r: rows2.length+2});
    var cell = await worksheet[cellRef];
    if (cell) {
    // update existing cell
    cell.v = 'Группа';
    } else {
    // add new cell
    await XLSX.utils.sheet_add_aoa(worksheet, [['Группа']], {origin: cellRef});
    }
    documentName = teacherData.surname + " (" + today +").xlsx"
    XLSX.writeFile(workbook, documentName, { compression: true });

     cellRef = await XLSX.utils.encode_cell({c: 1, r: rows2.length+2});
     cell = await worksheet[cellRef];
     //console.log(subjectsArray[i][1].groupName)
    subjectNameValue;
     //if (subjectsArray[i][1].groupName != undefined) subjValue = await subjectsArray[i][1].groupName
    if (cell) {
    // update existing cell
    
    cell.v = subjectNameValue; //groupNameValue и subjectNameValue перепутаны
    } else {
    // add new cell
    XLSX.utils.sheet_add_aoa(worksheet, [[subjectNameValue]], {origin: cellRef});
    }
    documentName = teacherData.surname + " (" + today +").xlsx"
    XLSX.writeFile(workbook, documentName, { compression: true });
    
    cellRef = await XLSX.utils.encode_cell({c: 2, r: rows2.length+2});
     cell = await worksheet[cellRef];
     //console.log(subjectsArray[i][1].groupName)
     //if (subjectsArray[i][1].groupName != undefined) subjValue = await subjectsArray[i][1].groupName
    if (cell) {
    // update existing cell
    
    cell.v = "Предмет";
    } else {
    // add new cell
    XLSX.utils.sheet_add_aoa(worksheet, [["Предмет"]], {origin: cellRef});
    }
    documentName = teacherData.surname + " (" + today +").xlsx"
    XLSX.writeFile(workbook, documentName, { compression: true });
     
    cellRef = await XLSX.utils.encode_cell({c: 3, r: rows2.length+2});
     cell = await worksheet[cellRef];
     //console.log(subjectsArray[i][1].groupName)
     //if (subjectsArray[i][1].groupName != undefined) subjValue = await subjectsArray[i][1].groupName
    if (cell) {
    // update existing cell
    
    cell.v = groupNameValue; //groupNameValue и subjectNameValue перепутаны
    } else {
    // add new cell
    XLSX.utils.sheet_add_aoa(worksheet, [[groupNameValue]], {origin: cellRef});
    }
    documentName = teacherData.surname + " (" + today +").xlsx"
    XLSX.writeFile(workbook, documentName, { compression: true });
     

      //teacherData.subjects[i].groupName + " " + teacherData.subjects[i].subjectName
    }
    
  
  }
  //XLSX.utils.book_append_sheet(workbook, worksheet, sheetNum);
  XLSX.writeFile(workbook, documentName, { compression: true });
  }
  
  //JSONtoExcel();

  async function getGroupInfo(groupNameCurrent, subjectNameCurrent) {
    var marksArray = await loadSite(groupNameCurrent, subjectNameCurrent);
    var groupTest = await checkGroup(groupNameCurrent);
    var marksAvgArray = await loadAvgMarks(groupNameCurrent, subjectNameCurrent);
    var presenceAvgArray = await loadAvgPresence(groupNameCurrent, subjectNameCurrent);
    var latenessAvgArray = await loadAvgLateness(groupNameCurrent, subjectNameCurrent);
     //groupTest.forEach((element) => element.value.marks = "bonkers");
  //console.log(groupTest);
  var groupArray = await Object.values(groupTest);
  await groupArray.pop();
  console.log(groupArray);
  console.log("результат лоудсайта")
  console.log(marksArray);
  console.log("средние оценки")
  console.log(marksAvgArray);
  for (i in groupArray){
    groupArray[i].marks = marksArray[i];
    groupArray[i].marksAvg = marksAvgArray[i];
    groupArray[i].presenceAvg = presenceAvgArray[i];
    groupArray[i].latenessAvg = latenessAvgArray[i];
  }
  console.log(groupArray);
  // const rowsGroup = groupArray.map(row => ({
  //   name: row.surname,
  //   id: row.rfid,
  //   marks: row.marks,
  //   marksAvg: row.marksAvg,
  //   presenceAvg: row.presenceAvg
  // }));

  const rowsGroup = groupArray.map(row => ({
    ФИО: row.surname +" "+ row.name.substring(0, 1)+"." + row.patronym.substring(0, 1)+ ".",
    //id: row.rfid,
    //marks: row.marks,
    Средняя_Оценка: row.marksAvg,
    Процент_Посещаемости: row.presenceAvg * 100 + "%",
    Процент_Опозданий: row.latenessAvg * 100 + "%"
  }));
    return rowsGroup;
  }

  //getGroupInfo();