'use strict';
var RabbitMq = require('../routing');
var config = require('../config')

var input = {"info":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"}

var ex = config.routing.exchanges

var rabbitmq = new RabbitMq({'routing-ex':config.routing});
var testInterval = setInterval(function(){
    rabbitmq.publish(ex, input);
    console.log("setInterval");
},1000);

/*
// use example
exports.create = function(input, callback) {
    rabbitmq.publish(ex , input);
    callback(null, {success: true});
};
*/
