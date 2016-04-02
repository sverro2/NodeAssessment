function getCallbackURL(service){
  if(process.env.PORT){
    return "https://node-assessment.herokuapp.com/auth/"+ service + "/callback"
  }else {
    return "http://localhost:3000/auth/"+ service + "/callback"
  }
}
// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '953811691407027', // your App ID
        'clientSecret'  : '5b8aed773d592f4f21c40bbeeb058842', // your App Secret
        'callbackURL'   : getCallbackURL("facebook")
    },

    'googleAuth' : {
        'clientID'      : '262257929815-um7eitdcdb04r4kgm36bi11fjjm7cfkp.apps.googleusercontent.com',
        'clientSecret'  : 'DkSZS48axo5O2K_z2aP9bnC3',
        'callbackURL'   : getCallbackURL("google")
    }

};
