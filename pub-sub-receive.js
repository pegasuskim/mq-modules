
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')

amqp.connect(config.pubsub.host, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = config.pubsub.exchanges;
    ch.assertExchange(ex, 'fanout', {durable: false});

    var first = config.pubsub.firstq;
    var second = config.pubsub.secondq;

    // queue1 createsecond and bind queue, consume !!
    ch.assertQueue(first, {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(first, ex, '');

      ch.consume(first, function(msg) {
        console.log(" [x] %s  %s", q.queue, msg.content.toString());
      }, {noAck: true});

    });

    // queue2 create and bind queue, consume !!
    ch.assertQueue(second, {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      console.log("\n");
      ch.bindQueue(second, ex, '');
      ch.consume(second, function(msg) {
        console.log(" [x] %s  %s", q.queue, msg.content.toString());
        console.log("\n");
      }, {noAck: true});

    });

  });
});
