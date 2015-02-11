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
}  //should I print?

if (contains.indexOf(' -f') != -1 || contains.indexOf('--file') != -1){
	convertFile(process.argv[2], process.argv[3]);
	isDefault = false;
}  //Is it a file? 

if (contains.indexOf(' -d') != -1 || contains.indexOf('--directory') != -1) {
	convertDir(process.argv[2], process.argv[3]);
	isDefault = false;
}   //I guess it's a directory

if (contains.indexOf(' -xm') != -1 || contains.indexOf('--ignoreMarkdown') != -1) {
	var skipMarkdown = true;
}   //skip markdown

if (contains.indexOf(' -xs') != -1 || contains.indexOf('--ignoreSASS') != -1) {
	var skipSass = true;
}    //skip sass

if (contains.indexOf(' -xc') != -1 || contains.indexOf('--ignoreCoffeescript') != -1) {
	var skipCoffee = true;
}  //skip coffeescript

if (contains.indexOf(' -xt') != -1 || contains.indexOf('--ignoreTalapa') != -1) {
	var skipTal = true;
}    //skip talapa

if (contains.indexOf(' -wf') != -1 || contains.indexOf('--watchFile') != -1) {
	convertFile(process.argv[2], process.argv[3]);
	watchFile(process.argv[2], process.argv[3]);
	isDefault = false;
}  //now we have to watch this thing

if (contains.indexOf(' -wd') != -1 || contains.indexOf('--watchDirectory') != -1) {
	watchDirectory(process.argv[2], process.argv[3]);
	isDefault = false;
}   //now we have to watch a whole lot of things

if (isDefault) {
	convertFile(process.argv[2], process.argv[3]);
}   //they didn't specify anything, so I'm just going to go and assume its two files

function convertFile(origFile, compFile, same) {
	var data = fs.readFileSync(origFile)
	var code;
	switch(path.extname(origFile)){
		case '.talapa':
			if (!skipTal) {
				console.log('compiling', origFile);
				compFile = compFile.replace('.talapa', '.html');
				code = send.recieve(data.toString(), false, false, path.dirname(origFile));
				same = false;
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
				same = false;
			} else {
				code = data.toString();
			}
			break;
		case '.coffee':
		case '.litcoffee':
			if (!skipCoffee) {
				console.log('compiling', origFile);
				compFile = compFile.replace('.coffee', '.js').replace('.litcoffee', '.js');
				if (!coffee) { var coffee = require('../lib/coffeescript.js'); }
				code = coffee.compile(data.toString());
				same = false;
			} else {
				code = data.toString();
			}
			break;
		case '.md':
		case '.markdown':
			if (!skipMarkdown) {
				console.log('compiling', origFile);
				compFile = compFile.replace('.md', '.html').replace('.markdown', '.html');
				if (!marked) { var marked = require('marked'); }
				code = marked(data.toString());
				same = false;
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
		if (path.extname(file)) {
			convertFile(path.join(origDir, file), path.join(compDir, file));
		} else {
			if (!fs.existsSync(path.join(compDir, file))) {
				fs.mkdirSync(path.join(compDir, file));
			}
			convertDir(path.join(origDir, file), path.join(compDir, file)); 
		}
	});
}

function watchFile(origFile, compFile, same) {
	fs.watch(origFile, function (event) {
		console.log('watching', origFile);
		if (event == 'change') {
			console.log(origFile, 'saved');
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
		if (file.charAt(0) !== '_') {
			console.log('not skipping', file, '----------------------');
			if (path.extname(file)) {
				console.log('this is a file', file, 'yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaay');
				convertFile(path.join(origDir, file), path.join(compDir, file), same);
				watchFile(path.join(origDir, file), path.join(compDir, file), same);
			} else {
				watchDirectory(path.join(origDir, file), path.join(compDir, file));
			}
		} else{
			console.log('skipping', file, '88888888888888888888888888');
		}
	});
}