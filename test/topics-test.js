'use strict';
var RabbitMq = require('../topics');
var config = require('../config')

var input = {"info":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"}

var ex = config.topics.exchanges

var rabbitmq = new RabbitMq({'topic-ex':config.topics});
var testInterval = setInterval(function(){
    rabbitmq.publish(ex, input);
},1000);

/*
// use example
exports.create = function(input, callback) {
    rabbitmq.publish(ex , input);
    callback(null, {success: true});
};
*/
