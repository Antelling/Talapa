#!/usr/bin/env node

var send = require('../lib/languageChooser.js');
//code to read and watch files and directories
//read a file
var fs = require('fs');
var path = require('path');

var isDefault = true;
var contains = ' ' + process.argv.join(' ') + ' ';

if (contains.indexOf(' -p') != -1 || contains.indexOf('--print') != -1) {
	var print = true;
}

if (contains.indexOf(' -f') != -1 || contains.indexOf('--file') != -1){
	convertFile(process.argv[2], process.argv[3]);
	isDefault = false;
}

if (contains.indexOf(' -d') != -1 || contains.indexOf('--directory') != -1) {
	convertDir(process.argv[2], process.argv[3]);
	isDefault = false;
}

if (contains.indexOf(' -xm') != -1 || contains.indexOf('--ignoreMarkdown') != -1) {
	var skipMarkdown = true;
}

if (contains.indexOf(' -xs') != -1 || contains.indexOf('--ignoreSASS') != -1) {
	var skipSass = true;
}

if (contains.indexOf(' -xc') != -1 || contains.indexOf('--ignoreCoffeescript') != -1) {
	var skipCoffee = true;
}

if (contains.indexOf(' -xt') != -1 || contains.indexOf('--ignoreTalapa') != -1) {
	var skipTal = true;
}

if (contains.indexOf(' -wf') != -1 || contains.indexOf('--watchFile') != -1) {
	convertFile(process.argv[2], process.argv[3]);
	watchFile(process.argv[2], process.argv[3]);
	isDefault = false;
}

if (contains.indexOf(' -wd') != -1 || contains.indexOf('--watchDirectory') != -1) {
	watchDirectory(process.argv[2], process.argv[3]);
	isDefault = false;
}

	
if (isDefault) {
	convertFile(process.argv[2], process.argv[3]);
}

function convertFile(origFile, compFile, same) {
	console.log('converting', origFile);
	var data = fs.readFileSync(origFile)
	var code;
	switch(path.extname(origFile)){
		case '.talapa':
			console.log('compiling', origFile);
			if (!skipTal) {
				compFile = compFile.replace('.talapa', '.html');
				code = send.recieve(data.toString(), false, false, path.dirname(origFile)); 
			} else {
				code = data.toString();
			}
			break;
		case '.sass':
		case '.scss':
			if (!skipSass) {
				console.log('compiling', origFile);
				compFile = compFile.replace('.sass', '.css');
				if (!sass) { var sass = require('../lib/sass.js'); }
				code = sass.compile(data.toString());
			} else {
				code = data.toString();
			}
			break;
		case '.coffee':
		case '.litcoffee':
			console.log('compiling', origFile);
			if (!skipCoffee) {
				console.log('compiling', origFile);
				compFile = compFile.replace('.coffee', '.js').replace('.litcoffee', '.js');
				if (!coffee) { var coffee = require('../lib/coffeescript.js'); }
				code = coffee.compile(data.toString());
			} else {
				code = data.toString();
			}
			break;
		case '.md':
			console.log('compiling', origFile);
			if (!skipMarkdown) {
				compFile = compFile.replace('.md', '.html');
				if (!marked) { var marked = require('marked'); }
				code = marked(data.toString());
			} else {
				code = data.toString();
			}
			break;
		default:
			code = data.toString();
			break;
	}
	if (same) { return; }
	if (print) {  //they told us to print instead of writing
		console.log(code);
	} else {
		fs.writeFileSync(compFile, code);
	}
}

function convertDir(origDir, compDir) {
	var files = fs.readdirSync(origDir);
	files.forEach(function(file){
		console.log('------------------------------------------------' + file);
		try{if (path.extname(file)) {
			convertFile(path.join(origDir, file), path.join(compDir, file));
		} else {
			if (!fs.existsSync(path.join(compDir, file))) {
				fs.mkdirSync(path.join(compDir, file));
			}
			convertDir(path.join(origDir, file), path.join(compDir, file)); 
		}
		   } catch (e) {
			   console.log(e);
		   }
	});
}

function watchFile(origFile, compFile, same) {
	fs.watch(origFile, function (event) {
		if (event == 'change') {
			convertFile(origFile, compFile, same);
		}	
	});
}

function watchDirectory (origDir, compDir) {
	var files = fs.readdirSync(origDir);
	var same = false;
	if (origDir == compDir) { same = true; }
	console.log(files);
	files.forEach(function(file) {
		console.log('------------------------------------------------' + file);
		if (file.charAt(0) !== '_') {
			if (path.extname(file)) {	
				convertFile(path.join(origDir, file), path.join(compDir, file), same);
				watchFile(path.join(origDir, file), path.join(compDir, file), same);
			} else {
				convertDir(path.join(origDir, file), path.join(compDir, file));
				watchDirectory(path.join(origDir, file), path.join(compDir, file));
			}
		} else{
			return '';
		}
	});
}