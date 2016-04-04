var serviceData = {
  test: 0
}

function startTimer(){
  setInterval(function(){
    testFunction();
  }, 3000);
}

function testFunction(){
  //print serviceData values you want to test to the console
  //console.log("Test timer: " + serviceData.test++);
}

// expose this function to our app using module.exports
module.exports = function(mongoose) {
  startTimer();
  return serviceData;
};
