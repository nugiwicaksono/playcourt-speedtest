// //  OpenShift sample Node application
// var express = require('express'),
//     app     = express(),
//     morgan  = require('morgan');
    
// Object.assign=require('object-assign')

// app.engine('html', require('ejs').renderFile);
// app.use(morgan('combined'))

// var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
//     ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
//     mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
//     mongoURLLabel = "";

// if (mongoURL == null) {
//   var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
//   // If using plane old env vars via service discovery
//   if (process.env.DATABASE_SERVICE_NAME) {
//     var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
//     mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
//     mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
//     mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
//     mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
//     mongoUser = process.env[mongoServiceName + '_USER'];

//   // If using env vars from secret from service binding  
//   } else if (process.env.database_name) {
//     mongoDatabase = process.env.database_name;
//     mongoPassword = process.env.password;
//     mongoUser = process.env.username;
//     var mongoUriParts = process.env.uri && process.env.uri.split("//");
//     if (mongoUriParts.length == 2) {
//       mongoUriParts = mongoUriParts[1].split(":");
//       if (mongoUriParts && mongoUriParts.length == 2) {
//         mongoHost = mongoUriParts[0];
//         mongoPort = mongoUriParts[1];
//       }
//     }
//   }

//   if (mongoHost && mongoPort && mongoDatabase) {
//     mongoURLLabel = mongoURL = 'mongodb://';
//     if (mongoUser && mongoPassword) {
//       mongoURL += mongoUser + ':' + mongoPassword + '@';
//     }
//     // Provide UI label that excludes user id and pw
//     mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
//     mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
//   }
// }
// var db = null,
//     dbDetails = new Object();

// var initDb = function(callback) {
//   if (mongoURL == null) return;

//   var mongodb = require('mongodb');
//   if (mongodb == null) return;

//   mongodb.connect(mongoURL, function(err, conn) {
//     if (err) {
//       callback(err);
//       return;
//     }

//     db = conn;
//     dbDetails.databaseName = db.databaseName;
//     dbDetails.url = mongoURLLabel;
//     dbDetails.type = 'MongoDB';

//     console.log('Connected to MongoDB at: %s', mongoURL);
//   });
// };

// app.get('/', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   if (!db) {
//     initDb(function(err){});
//   }
//   if (db) {
//     var col = db.collection('counts');
//     // Create a document with request IP and current time of request
//     col.insert({ip: req.ip, date: Date.now()});
//     col.count(function(err, count){
//       if (err) {
//         console.log('Error running count. Message:\n'+err);
//       }
//       res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
//     });
//   } else {
//     res.render('index.html', { pageCountMessage : null});
//   }
// });

// app.get('/pagecount', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   if (!db) {
//     initDb(function(err){});
//   }
//   if (db) {
//     db.collection('counts').count(function(err, count ){
//       res.send('{ pageCount: ' + count + '}');
//     });
//   } else {
//     res.send('{ pageCount: -1 }');
//   }
// });

// // error handling
// app.use(function(err, req, res, next){
//   console.error(err.stack);
//   res.status(500).send('Something bad happened!');
// });

// initDb(function(err){
//   console.log('Error connecting to Mongo. Message:\n'+err);
// });

// app.listen(port, ip);
// console.log('Server running on http://%s:%s', ip, port);

// module.exports = app ;
var express = require('express');
var Server = express();
var randomBytes = require('random-bytes');
var path = require('path');
var request = require('request');
var helpers = require('./Helpers');

var cache;

Server.get('/empty', function (req, res) {
    res.sendStatus(200);
});

Server.post('/empty', function (req, res) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.set("Cache-Control", "post-check=0, pre-check=0");
    res.set("Pragma", "no-cache");
    res.sendStatus(200);
});

Server.get('/garbage', function (req, res) {
    res.set('Content-Description', 'File Transfer');
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', 'attachment; filename=random.dat');
    res.set('Content-Transfer-Encoding', 'binary');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Cache-Control', 'post-check=0, pre-check=0', false);
    res.set('Pragma', 'no-cache');
    var requestedSize = (req.query.ckSize || 100);
    
    var send = () => {
        for (var i = 0; i < requestedSize; i++)
            res.write(cache);
        res.end();
    }
    
    if (cache) {
        send();
    } else {
        randomBytes(1048576, (error, bytes) => {
            cache = bytes;
            send();
        });
    }

});

Server.get('/getIP', function (req, res) {
    var requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['HTTP_CLIENT_IP'] || req.headers['X-Real-IP'] || req.headers['HTTP_X_FORWARDED_FOR'];
    if (requestIP.substr(0, 7) === "::ffff:") {
        requestIP = requestIP.substr(7)
    }
    request('https://ipinfo.io/' + requestIP + '/json', function (err, body, ipData) {
        ipData = JSON.parse(ipData);
        if (err) res.send(requestIP);
        else {
            request('https://ipinfo.io/json', function (err, body, serverData) {
                serverData = JSON.parse(serverData);
                if (err) res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                else if (ipData.loc && serverData.loc) {
                    var d = helpers.calcDistance(ipData.loc.split(','), serverData.loc.split(','));
                    res.send(`${requestIP} - ${ipData.org}, ${ipData.country} (${d}km)`);
                } else {
                    res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                }
            })
        }
    });
});

Server.use(express.static(path.join(__dirname, 'views')));

Server.listen(8080, function () {
    console.log('Speedtest Server is up and running!');
});
