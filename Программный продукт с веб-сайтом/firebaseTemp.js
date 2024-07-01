


function load(){
    firebase.initializeApp(firebaseConfig)
    var database = firebase.database()

    var teacher_ref = database.ref('reports/' + 25);
          teacher_ref.on('value', function(snapshot) {
          var data = snapshot.val();
          console.log(data);
          alert(data.timestamp);
          // alert(data.name);
          // alert(data.surname);
          // alert(data.login);
          // alert(data.password);
          // alert(data.subjects.database);
          if (data == null){
            alert("Ошибка: неверный логин или пароль.");
          }
          else{
            alert("Вход успешный!");
          }
    });
}

 function loadLastReport(){
    firebase.initializeApp(firebaseConfig)
    var database = firebase.database()

    var teacher_ref = database.ref('reports/');
          teacher_ref.on('value', function(snapshot) {
          var data = snapshot.val();
          console.log(data);
          alert(data.count);
          // alert(data.name);
          // alert(data.surname);
          // alert(data.login);
          // alert(data.password);
          // alert(data.subjects.database);
          if (data == null){
            alert("Ошибка: неверный логин или пароль.");
          }
          else {
            alert("Вход успешный!");
            //jsonLastReport(data.count);
          }
    });
    return data;
}

function loadReports(){
    
    var allReportsAmount;
    var teacher_ref = database.ref('reports/');
          teacher_ref.on('value', function(snapshot) {
          var data = snapshot.val();
          console.log(data);
          // alert(data.name);
          // alert(data.surname);
          // alert(data.login);
          // alert(data.password);
          // alert(data.subjects.database);
          if (data == null){
            alert("ошибка");
          }
          else {
            alert(data.count + " отчётов всего.");
            allReportsAmount = data.count;
            alert("oh my there are " + allReportsAmount);
            //jsonLastReport(data.count);
          }
          return allReportsAmount;
    });
    alert("oh my there are 2" + allReportsAmount);
    return allReportsAmount;
}

///
async function loadReportsTemp(){
  let  dataRead = ()  => {var teacher_ref = database.ref('reports/');
         teacher_ref.on('value', function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        // alert(data.name);
        // alert(data.surname);
        // alert(data.login);
        // alert(data.password);
        // alert(data.subjects.database);
  }); 
return data;}
  
var res = await dataRead();

  if (data == null){
          alert("ошибка");
          alert("новый код");
        }
        else {
          //alert(data.count + " отчётов всего.");
          allReportsAmount = data.count;
          alert("oh my there are NEW " + allReportsAmount);
          //jsonLastReport(data.count);
        }
        //return allReportsAmount;
  //alert("oh my there are OUT OF " + allReportsAmount);
  // sleep(2000);
  //  if (allReportsAmount == undefined) { setTimeout(loadReports, 100);}
  //  else {checker.innerText = allReportsAmount;
    alert(allReportsAmount + "- allReportsAmount")
  //alert(allReportsAmount + "- allReportsAmount")
}