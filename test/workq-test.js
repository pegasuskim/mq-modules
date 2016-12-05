'use strict';
var RabbitMq = require('../work');
var config = require('../config')

var input = {"info":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"}

var rabbitmq = new RabbitMq({testq:config.work});

var testInterval = setInterval(function(){
    rabbitmq.publish(config.work.name, input);
    console.log("setInterval");
},1000);

/*
// use example
exports.create = function(input, callback) {
    rabbitmq.publish(config.work.name, input);
    callback(null, {success: true});
};
*/
