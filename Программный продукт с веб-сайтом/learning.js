function get(target){
    return Promise((resolve, reject) =>{
    database.ref(target).once("value",function(snapshot){
        //console.log(snapshot.val());
        resolve(snapshot.val());
     });
    });
}

function get(target){
    return database.ref(target).once("value",function(snapshot){
        //console.log(snapshot.val());
        return snapshot.val();
    });
}

let response = get("/foo");
console.log(response["hello"]);

get(target).then((data) =>{
    console.log(data);
  });

  function get(target){
    return Promise((resolve, reject) =>{
    });
}


function doHomework(subject, callback) {
    alert(`Starting my ${subject} homework.`);
    callback();
  }
  function alertFinished(){
    alert('Finished my homework');
  }
  doHomework('math', alertFinished);

  // import { parse } from 'node-html-parser';
const parse = require('node-html-parser');