var express = require('express');
var app = express();
app.use(express.logger());
app.enable('jsonp callback');
app.get('/build', function(request, response) {
    console.log(request.query);
    if (!request.query.primary_color || !request.query.secondary_color) {
        res.status(400).send('Server no comprende...probably missing required http param');
    }
    // Here we'd:
    // 1. parse out the query params
    // 2. build an _options partial ... probably use a template and fill in the dynamic stuff
    // 3. call compass compile as system call maybe
    // 4. read the generated buttons.css in to a string
    // 5. stuff that in css: <the_string>
    var primaryColor = request.query.primary_color;
    response.jsonp({css: '.foo { color: '+primaryColor+'; }'});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on '+ port);
});

