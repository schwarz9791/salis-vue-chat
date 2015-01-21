var passport = require('passport'),  
LocalStrategy = require('passport-local').Strategy,  
bcrypt = require('bcrypt');


//helper functions
function findById(id, fn) {  
    User.findOne(id).exec(function (err, user) {
        if (err) {
            return fn(null, null);
        } else {
            return fn(null, user);
        }
    });
}

function findByUsername(u, fn) {  
    User.findOne({
        username: u
    }).exec(function (err, user) {
        // Error handling
        if (err) {
            return fn(null, null);
        // The User was found successfully!
        } else {
            return fn(null, user);
        }
    });
}

// ① passport コアモジュール 基本動作定義
passport.serializeUser(function (user, done) {  
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {  
    findById(id, function (err, user) {
        done(err, user);
    });
});

// ② passport-local サブモジュール ID/Password認証定義
passport.use(new LocalStrategy(  
    function (username, password, done) {
        process.nextTick(function () {

            findByUsername(username, function (err, user) {
                if (err)
                    return done(null, err);
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user ' + username
                    });
            }

            bcrypt.compare(password, user.password, function (err, res) {
                if (!res)
                    return done(null, false, {
                        message: 'Invalid Password'
                    });
                var returnUser = {
                    username: user.username,
                    id: user.id
                };
                return done(null, returnUser, {
                    message: 'Logged In Successfully'
               });
            });
        })
    });
}
));

// ③ express middleware hook
module.exports = {  
    http: {
        customMiddleware: function(app){
            // app: express() オブジェクト
            console.log("passport module initialize");
            
            app.use(passport.initialize());
            app.use(passport.session());
        }
    }
};