module.exports = function(req, res, next) {

    if(req.session.authenticated) {
        // This request is authenticated
        return next();
    }

    // This request is not authenticate...
    return res.redirect("/");

};