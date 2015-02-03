var send = require('./languageChooser.js');
exports.compile = function(code){
	return send.recieve(code, false, false, process.cwd());
}