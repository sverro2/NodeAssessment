var bcrypt   = require('bcrypt-nodejs');

function init(mongoose){
  // define the schema for our user model
  var userSchema = mongoose.Schema({

    local: {
      email        : String,
      password     : String,
    },
    facebook: {
      id           : String,
      token        : String,
      email        : String,
      name         : String
    },
    google: {
      id           : String,
      token        : String,
      email        : String,
      name         : String
    },
    role          : String

  });

  // methods ======================
  // generating a hash
  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

  userSchema.methods.hasRole = function(roleToSearch){
    return this.roles.indexOf(roleToSearch) > -1
  }

  mongoose.model('User', userSchema)
}

// create the model for users and expose it to our app
module.exports = init;
