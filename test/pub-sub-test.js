'use strict';
var RabbitMq = require('../pub-sub');
var config = require('../config')

var input = {"info":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"}

var ex = config.pubsub.exchanges

var rabbitmq = new RabbitMq({'test-ex':config.pubsub});
var testInterval = setInterval(function(){
    rabbitmq.publish(ex , input);
    console.log("setInterval");
},1000);

/*
// use example
exports.create = function(input, callback) {
    rabbitmq.publish(ex , input);
    callback(null, {success: true});
};
*/
