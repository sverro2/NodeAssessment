var bcrypt = require('bcrypt-nodejs');

function init(mongoose) {
    // define the schema for our user model
    var userSchema = mongoose.Schema({

        local: {
            email: String,
            password: String,
        },
        facebook: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        roles: [String]

    });

    // methods ======================
    // generating a hash
    userSchema.methods.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function (password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    userSchema.methods.hasRole = function (roleToSearch) {
        return this.roles.indexOf(roleToSearch) > -1
    }

    userSchema.statics.getUser = function (userId, cb) {
        this.findOne({ '_id': userId }, 'route', function (err, user) {
            if (err) {
                console.log("An error occured" + err);
            }
            if (cb) {
                cb(user);
            }
        });
    }

    mongoose.model('User', userSchema)
}

// create the model for users and expose it to our app
module.exports = init;
