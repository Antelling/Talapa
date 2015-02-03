var coffee = require('coffee-script');
exports.compile = function (code) {
	try{
		return coffee.compile(code, '');
	} catch(e){
		console.log("Coffeescript compilation error: ", e);
	}
}