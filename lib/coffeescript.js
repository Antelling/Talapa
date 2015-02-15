var coffee = require('coffee-script');
var colors = require('colors');
exports.compile = function (code) {
	try{
		return coffee.compile(code, '');
	} catch(e){
		console.log();
		console.log('=======error in compiling Coffee-Script======='.red); 
		console.log(e); 
		console.log('=============================================='.red);
		console.log();
	}
}