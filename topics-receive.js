
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')

amqp.connect(config.topics.host, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = config.topics.exchanges;
    ch.assertExchange(ex, 'topic', {durable: false});

    var first = config.topics.firstq;
    var second = config.topics.secondq;

    // queue1 createsecond and bind queue, consume !!
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      var topics_key = config.topics.topics_key

      topics_key.forEach(function(key) {
        //ch.bindQueue(first, ex, key);
        ch.bindQueue(q.queue, ex, key);
      });

      //ch.consume(first, function(msg) {
      ch.consume(q.queue, function(msg) {
        console.log(" [x] topics Key %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
      }, {noAck: true});

    });

    // queue2 create and bind queue, consume !!
    ch.assertQueue(second, {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      console.log("\n");
      var error_key = config.topics.error_key
      error_key.forEach(function(key) {
        //ch.bindQueue(q.queue, ex, key);
        ch.bindQueue(second, ex, key);
      });

      ch.consume(second, function(msg) {
        console.log(" [x] topics Key %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
        console.log("\n");
      }, {noAck: true});
    });

  });
});
