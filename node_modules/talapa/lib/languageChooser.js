exports.recieve = function(code, shouldReturnVars, shouldReturnTemps, whereami) {
	
code = code.split('\r\n');
code = compress(code);

switch (code[0].trim()){
	case 'xml':
		var xml = require('./xmlCompiler');
		code.shift();
		return xml.compile(code, whereami);
		break;
	default:
		var html = require('./htmlCompiler');
		return html.compile(code, shouldReturnVars, shouldReturnTemps, whereami);
		break;
}	

function compress(code){ //removes double tabbing
	var newCode = [];
	var curTab = 0;
	var preTab = 0;
	var tabDiff = 0;
	var special = false;
	var startTab = 0;
	code.forEach(function(line){ //we want to remove double tabbing but not in markdown or coffeescript.
		if (!line.trim()) { newCode.push(''); return;} //if its an empty line, add an empty line
		
		preTab = curTab;         //update tab variables
		curTab = (line.match(/\t/g) || []).length;
		tabDiff = curTab - preTab;
		
		if (special) {
			if (curTab <= startTab) {
				special = false;
			} else{
				newCode.push(line);
				return;
			}
		}
		var trimmed = line.trim();
		if(trimmed == 'markdown' || trimmed == 'escape' || trimmed == 'javascript' || trimmed == 'css' || trimmed == 'coffeescript' || trimmed == 'sass') {
			special = true;
			newCode.push(line);
			return;
		}
		if (tabDiff == 2) {
			newCode.push(newCode.pop() + ' ' + trimmed);
			curTab = preTab;
		} else {
			newCode.push(line);
		}
		
	});
	return newCode;
}	


};