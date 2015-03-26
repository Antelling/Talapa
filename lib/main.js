var send = require('./lexer.js');
var colors = require('colors');
var fs = require('fs');
var path = require('path');

exports.compile = function compiling (code) {
    return send.receive(code, false, false, process.cwd());
};