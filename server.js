var app = require('./server-config.js');

// app.listen(process.env.PORT);
// console.log('Server now listening on port ' + process.env.PORT);

var port = 4568;

app.listen(port);
console.log('Server now listening on port ' + port);

