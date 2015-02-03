var sass = require('node-sass');
var stats = {};
exports.compile = function (code) {
	try {
		return sass.renderSync({
			data: code,
			outputStyle: 'compressed',
			stats: stats
		}).css;
	} catch(e){
		console.log("=======SASS compilation error=======");
		console.log(e);
		return code;
	}
};