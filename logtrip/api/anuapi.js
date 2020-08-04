//ANUapi
const http       = require('http')
const crypto     = require('crypto');

const size_url   = 520;
const length_url = 500;

//Used for getting entropy from ANU by Size
exports.getsizeqrng  = function(size){
  return new Promise(resolve => {

  //One size_url generates 2 hex characters for every number. 
  //1 size_url generates 2 hex characters. 

  //A big query is 260000 Characters (520*500)
  var big_query;

  //A small qeury' length is undetermined, block size is 520.
  var small_query;

  var results = [];

  var size_url = 520;

  //Do sum
  var size_f = (size/2)

  if (size_f-(520*500) < 0){ //Check if there is no big query possible, only a small query
  big_query = 0; //No big query
  var size_f = Math.trunc(size_f/520); //We remove the remainder.
  var size_f = size_f+1; //We add one

  small_query = size_f;

  } else { //Check for big queries

  var big_query = Math.trunc(size_f/(520*500)) //This is the amount of big queries

  var size_f = size_f % (520*500); //We get the remainder
  
  if (size_f == 0) { //Check if remainder is zero

    small_query = size_f; //0 Small queries

  } else {

    var size_f = Math.trunc(size_f/520); //Remainder / 520 and we remove the fraction
    var size_f = size_f+1; //We add one

    small_query = size_f; //This is the amount of small queries
  }


  }

  //We send big_query x amount of times. 
  if (big_query != 0 && small_query == 0){
    var length_url = 500;
    var url = "http://qrng.anu.edu.au/API/jsonI.php?type=hex16&size="+size_url+"&length="+length_url;
  

    callanuBig(size, url, big_query, function(result) {
          return(result)
    })

  //We only have small queries.
  } else if (small_query != 0 && big_query == 0) {
  var length = small_query;
  var url = "http://qrng.anu.edu.au/API/jsonI.php?type=hex16&size="+size_url+"&length="+length;
    console.log('reacccch')

    anuSmall(size, length, url, function(result) {
        resolve(result);
      
    });


  } else if (big_query != 0 && small_query != 0){
  var length = small_query;
  var length_url = 500;
  var url = "http://qrng.anu.edu.au/API/jsonI.php?type=hex16&size="+size_url+"&length="+length_url;

  callanumulti(size, url, big_query, length, function(result) {
    return(result)
  })


  }
});
} //End Function

//Used for calling ANU Quantum Random Numbers Server
function anu(url, length, callback){

  http.get(url, function(res){
    var body = '';

      res.on('data', function(chunk){
          body += chunk;
      });

      res.on('end', function(){

        var object_entropy = undefined; 
        var fbResponse = JSON.parse(body);
        var tmpstring = fbResponse.data

        for (v = 0; v < length; v++){
          if(!object_entropy){
              object_entropy = tmpstring[v]
          } else {
              object_entropy += tmpstring[v]
          }         
        }

        callback(object_entropy)

    });


  }).on('error', function(e){
  });

} //End Function

//Used for querying ANU for small queries
function anuSmall(size, length, url, callback){
  var results_anu = undefined; //This is a large array containing the entropy. 
  console.log('rraccccfffffsdf')

  anu(url, length, function(result) {
    if(results_anu == undefined){
      results_anu = result; 
    } else { 
      results_anu += result; 
    }

    callback(createEntropyObject(results_anu, size))
      
  })
} //End Function

//Used for querying ANU for big queries
function callanuBig(size, url, big_query, callback){
  var results_anu = undefined; //This is a large array containing the entropy. 

  for (i = 0; i < big_query; i++) {

    anu(url, length_url, function(result) {
      if(results_anu == undefined){
        results_anu = result; 
      } else { 
        results_anu += result; 
      }

      if(i == big_query){ 
        
         callback(createEntropyObject(results_anu, size))

      }
    })

  } // End loop
} //End Function

//Used for calling ANU for big and small queries
function callanumulti(size, url, big_query, small_query_length, callback){
  var results_anu = undefined; //This is a large array containing the entropy. 
  var timesRun = 0;

  for (i = 0; i < big_query; i++) {
    anu(url, length_url, function(result) {
        ++timesRun
        if(results_anu == undefined){
          results_anu = result; 
        } else {
          results_anu += result; }

        if(timesRun == big_query){
          var url = "http://qrng.anu.edu.au/API/jsonI.php?type=hex16&size="+size_url+"&length="+small_query_length;
          
          anu(url, small_query_length, function(result){
              results_anu += result;

              callback(createEntropyObject(results_anu, size))
              
          }) //End anu function

        }
    })

  } // End loop
} //End Function

//Used to create an entropy object
createEntropyObject = function(object_entropy, size){

  var gid = crypto.createHash('sha256').update(object_entropy).digest('hex');
  var timestamp = Date.now(); 
  var entropy = object_entropy.substring(0,size); 
                    
  var entropy_size = entropy.length;

  return(entropy)
} //End Function

//end ANUapi
