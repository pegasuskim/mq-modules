
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')

amqp.connect(config.routing.host, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = config.routing.exchanges;
    ch.assertExchange(ex, 'direct', {durable: false});

    var first = config.routing.firstq;
    var second = config.routing.secondq;
    // queue1 createsecond and bind queue, consume !!
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

      var routing_key = config.routing.routing_key

      routing_key.forEach(function(key) {
        //ch.bindQueue(first, ex, key);
        ch.bindQueue(q.queue, ex, key);
      });

      //ch.consume(first, function(msg) {
      ch.consume(q.queue, function(msg) {
        console.log(" [x] error routingKey %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
      }, {noAck: true});

    });

    // queue2 create and bind queue, consume !!
    ch.assertQueue(second, {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      console.log("\n");
      var routing_error_key = config.routing.error_routing_key
      routing_error_key.forEach(function(key) {
        //ch.bindQueue(second, ex, key);
        ch.bindQueue(second, ex, key);
      });

      ch.consume(second, function(msg) {
        console.log(" [x] error routingKey %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
        console.log("\n");
      }, {noAck: true});
    });

  });
});
