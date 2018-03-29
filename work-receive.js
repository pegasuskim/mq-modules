
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')

/*
amqp.connect(config.pubsub.host, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = config.work.name;
    ch.assertQueue(q, {durable:false, exclusive:false});
    ch.prefetch(1);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      setTimeout(function() {
        console.log(" [x] Done");
        ch.ack(msg);
      }, 1000);
    }, {noAck: false});
  });
});
*/

function consumerStart() {
  amqp.connect(config.pubsub.host, function(err, conn) { 
    var reconnectTimeout = 1000;
    if (err) {
      return setTimeout(function () {
          console.log("[AMQP]", err.message);
          console.log('now attempting reconnect ...');
          consumerStart();
        }, reconnectTimeout);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.log("[AMQP] conn error", err.message);
      }
    });

    conn.on("close", function() {
      console.log("[AMQP] reconnecting");
        return setTimeout(function () {
            console.log('now attempting reconnect ...');
            consumerStart();
        }, reconnectTimeout);
    });


    conn.createChannel(function(err, ch) {      
      var q = config.work.name;
      ch.assertQueue(q, {durable:false, exclusive:false});
      ch.prefetch(1);

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
      ch.consume(q, function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
        setTimeout(function() {
          console.log(" [x] Done");
          ch.ack(msg);
        }, 100);
      }, {noAck: false});

    });

  });

}
consumerStart();
