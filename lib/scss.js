var scss = require('node-sass');
var stats = {};
exports.compile = function compilingSass (code) {
	try {
		return scss.renderSync({
			data: code,
			outputStyle: 'compressed',
			stats: stats
		}).css;
	} catch(e){
		console.log();
		console.log('=======error compiling SCSS======='.red);
		console.log(e); 
		console.log('=================================='.red);
		console.log();
		return code;
	}
};