var express = require('express');
var mysql   = require('mysql');
var bodyParser  = require('body-parser');
var md5 = require('MD5');
var rest = require('./REST.js');
var fs = require('fs');
var path = require('path');
var cors = require('cors')

var app  = express();


function REST(){
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 100,
        host     : 'localhost',
        user     : 'imran',
        password : 'bnm0acd312',
        database : 'circles',
        debug    :  false
    });
    pool.getConnection(function(err,connection){
        if(err) {
          self.stop(err);
        } else {
          self.configureExpress(connection);
        }
    });
}

REST.prototype.configureExpress = function(connection) {
      var self = this;
      app.use(cors())
      app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
      app.use(bodyParser.json({limit: '50mb'}));
      app.use(express.static('public'));
      var router = express.Router();
      app.use('/api', router);
      var rest_router = new rest(router,connection,md5, fs);
      self.startServer();
}

REST.prototype.startServer = function() {
      app.listen(3000,function(){
          console.log("MOtherfucker wont update right ! I am alive at Port 3000.");
      });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
}

new REST();
