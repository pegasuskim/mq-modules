
'use strict';
var amqp = require('amqplib/callback_api');
var config = require('./config')


/*
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
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      console.log("\n");
      var error_key = config.topics.error_key
      error_key.forEach(function(key) {
        //ch.bindQueue(q.queue, ex, key);
        ch.bindQueue(second, ex, key);
      });

      ch.consume(q.queue, function(msg) {
        console.log(" [x] topics Key %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
        console.log("\n");
      }, {noAck: true});
    });

  });
});
*/

function consumerStart() {
  amqp.connect(config.topics.host, function(err, conn) {
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
        consumerStart();
        //console.log("[AMQP] conn error", err.message);
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

      var first = config.topics.firstq;
      var second = config.topics.secondq;
      var ex = config.topics.exchanges;
      ch.assertExchange(ex, 'topic', {durable: false});      
      
      ch.deleteQueue(first, {ifUnused:true, ifEmpty:true}, function(err, ok) {
        if(ok){
          console.log('%s Queue Delete...', second);
        }
        if(err){
          console.log('Channel Closed by server...');
        }
      });

      ch.deleteQueue(second, {ifUnused:true, ifEmpty:true}, function(err, ok) {
        if(ok){
          console.log('%s Queue Delete...', second);
        }      
        if(err){
          console.log('Channel Closed by server...');
        }
      });

      // queue1 createsecond and bind queue, consume !!
      ch.assertQueue(first, {durable:false, exclusive:false}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
        var topics_key = config.topics.topics_key

        topics_key.forEach(function(key) {
          ch.bindQueue(q.queue, ex, key);
        });

        //ch.consume(first, function(msg) {
        ch.consume(q.queue, function(msg) {
          console.log(" [x] topics Key %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
          //ch.reject(msg, true);
          ch.ack(msg);
        }, {noAck: false});

      });

      // queue2 create and bind queue, consume !!
      ch.assertQueue(second, {durable:false, exclusive:false}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
        console.log("\n");
        var error_key = config.topics.error_key
        
        error_key.forEach(function(key) {
          ch.bindQueue(q.queue, ex, key);
        });

        ch.consume(q.queue, function(msg) {
          console.log(" [x] topics Key %s %s: '%s'", q.queue, msg.fields.routingKey, msg.content.toString());
          console.log("\n");
          ch.ack(msg);
          //ch.reject(msg, true);
        }, {noAck: false});
      });
    });
  });
}


consumerStart();










