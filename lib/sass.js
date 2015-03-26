var sass = require('node-sass');
var stats = {};
exports.compile = function compilingSass (code) {
	try {
		return sass.renderSync({
			data: code,
			outputStyle: 'compressed',
			stats: stats
		}).css;
	} catch(e){
		console.log();
		console.log('=======error compiling SASS======='.red); 
		console.log(e); 
		console.log('=================================='.red);
		console.log();
		return code;
	}
};