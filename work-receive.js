
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')

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
