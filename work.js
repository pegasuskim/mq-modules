/**
 * Created by pegasuskim on 2015-12-07.
 */
'use strict';
var amqp = require('amqplib/callback_api');
var async = require('async');


function RabbitMQ(config) {
    this.queues = config;
    this.connection = {};
    this.connect();
};


RabbitMQ.prototype.connect = function() {
    var self = this;
    Object.keys(self.queues).forEach(function(queueName) {
        var queue =  self.queues[queueName];
        var reconnectTimeout = 1000;
        amqp.connect(queue.host, function(err, conn) {
            if (err) {                
                return setTimeout(function () {
                    console.error("[AMQP]", err.message);
                    console.log('now attempting reconnect ...');
                    self.connect();
                }, reconnectTimeout);
            }
           
            conn.on("error", function(err) {
              if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
              }
            });
           
            conn.on("close", function() {
              console.error("[AMQP] reconnecting");
              //return self.connect();
                return setTimeout(function () {
                    console.log('now attempting reconnect ...');
                    self.connect();
                }, reconnectTimeout);
            });

            if(conn){
                self.connection[queueName] = conn;
                console.log('[%d] rabbitmq %s connect exchange', process.pid, queueName);
            }else{
                console.log('[%s] rabbitmq connect error msg: %s', queueName, err);
            }

        });
    })
};



RabbitMQ.prototype.publish = function(qname, data, callback) {
    var self = this;
    async.waterfall([
            function checkConnect(callback) {
                var conn = self.connection[qname];
                var error = null;
                if(conn === null || conn === undefined) {
                    error = new Error('RabbitMQ Connect error');
                }
                callback( error, conn );
            },
            function createChannel(conn, callback) {
                conn.createChannel(function(error, channel) {
                    callback( error, channel );
                });
            },
            function assertQueue(channel, callback) {
                // MQ Cluster assertQueue 설정: {durable:false, exclusive:false}
                channel.assertQueue(qname, {durable:false, exclusive:false}, function(error, ok) {
                    callback( error, ok, channel );
                });
            },
            function sendToQueue(ok, channel, callback) {
                var strData = JSON.stringify(data);
                var error = null;

                console.log('[%d] send to %s data : %s', process.pid, qname, strData);
                if( !data.method )
                    console.log('[%d] method : %s', process.pid, strData );

                channel.sendToQueue(qname, new Buffer(strData), {persistent: true});
                channel.close();
                callback( error, null );
            }
        ],
        function done(error, result) {
            if( error ) { console.log('[%d] Queue(%s) error : %s', process.pid, qname, error.message); }

            if( typeof callback === 'function' ) {
                return callback( error, result );
            }
        });
};

RabbitMQ.prototype.close = function(qname) {
    if( this.connection[qname] ) {
        this.connection[qname].close();
        this.connection[qname] = null;
    }
};

module.exports = RabbitMQ;
