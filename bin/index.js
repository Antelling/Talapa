#!/usr/bin/env node

var send = require('../lib/lexer.js');
var colors = require('colors');
var dirsToIgnore = ' ';
var fs = require('fs');
var path = require('path');
var skipDIR = false;

var isDefault = true;
var contains = ' ' + process.argv.join(' ') + ' ';

if (contains.indexOf(' -ot ') != -1 || contains.indexOf('--onlyThis') != -1) {
	skipDIR = true;
}    //skip scss

if (contains.indexOf(' -xs ') != -1 || contains.indexOf('--ignorescss') != -1) {
	var skipscss = true;
}    //skip scss

if (contains.indexOf(' -xc ') != -1 || contains.indexOf('--ignoreCoffeescript') != -1) {
	var skipCoffee = true;
}  //skip coffeescript

if (contains.indexOf(' -xt ') != -1 || contains.indexOf('--ignoreTalapa') != -1) {
	var skipTal = true;
}    //skip talapa

process.argv.forEach(function(arg){
	if (arg.substr(0, 3) === '-x-') {
		dirsToIgnore = dirsToIgnore + ' ' + arg.substr(3) + ' ';
	}
}); //set up the dirs to skip

if (contains.indexOf(' -p ') != -1 || contains.indexOf('--print') != -1) {
	var print = true;
}  //should I print?

if (contains.indexOf(' -f ') != -1 || contains.indexOf('--file') != -1){
	convertFile(process.argv[2], process.argv[3]);
	isDefault = false;
}  //Is it a file? 

if (contains.indexOf(' -d ') != -1 || contains.indexOf('--directory') != -1) {
	convertDir(process.argv[2], process.argv[3]);
	isDefault = false;
}   //I guess it's a directory

if (contains.indexOf(' -xm ') != -1 || contains.indexOf('--ignoreMarkdown') != -1) {
	var skipMarkdown = true;
}   //skip markdown

if (contains.indexOf(' -wf ') != -1 || contains.indexOf('--watchFile') != -1) {
	convertFile(process.argv[2], process.argv[3]);
	watchFile(process.argv[2], process.argv[3]);
	isDefault = false;
}  //now we have to watch this thing

if (contains.indexOf(' -wd ') != -1 || contains.indexOf('--watchDirectory') != -1) {
	watchDirectory(process.argv[2], process.argv[3]);
	isDefault = false;
}   //now we have to watch a whole lot of things

if (isDefault) {
	convertFile(process.argv[2], process.argv[3]);
}   //they didn't specify anything, so I'm just going to go and assume its two files

function convertFile(origFile, compFile, same) {
	var data = fs.readFileSync(origFile);
	var code;
	switch(path.extname(origFile)){
		case '.talapa':
			if (!skipTal) {
				console.log('compiling'.cyan, origFile);
				compFile = compFile.replace('.talapa', '.html');
				code = send.receive(data.toString(), false, false, path.dirname(origFile));
				same = false;
			} else {
				code = data.toString();
			}
			break;
		case '.scss':
		case '.scss':
			if (!skipscss) {
				console.log('compiling'.cyan, origFile);
				compFile = compFile.replace('.scss', '.css').replace('.scss', '.css');
				if (!scss) { var scss = require('../lib/scss.js'); }
				code = scss.compile(data.toString());
				same = false;
			} else {
				code = data.toString();
			}
			break;
		case '.coffee':
		case '.litcoffee':
			if (!skipCoffee) {
				console.log('compiling'.cyan, origFile);
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
				console.log('compiling'.cyan, origFile);
				compFile = compFile.replace('.md', '.html').replace('.markdown', '.html');
				if (!marked) { var marked = require('marked'); }
				code = marked(data.toString());
				same = false;
			} else {
				code = data.toString();
			}
			break;
		default:
			code = data;
			break;
	}
	if (same) { return; }
	if (print) {  //they told us to print instead of writing
		console.log(code);
	} else {
		console.log('saving'.green, compFile);
		fs.writeFileSync(compFile, code);
	}
}

function convertDir(origDir, compDir) {
	var files = fs.readdirSync(origDir);
	files.forEach(function(file){
		var stats = fs.lstatSync(path.join(origDir, file));
		if (file.charAt(0) !== '_') {
			if (stats.isFile()) {
				convertFile(path.join(origDir, file), path.join(compDir, file));
			} else if (stats.isDirectory()){
				if (skipDIR) {  //we shouldnt skip anything
					console.log('skipping'.blue, file);
				} else if (dirsToIgnore.indexOf( ' ' + file + ' ') != -1) {  //it is a directory we should ignore
					console.log('skipping'.blue, file);	
				} else {  //it's normal
					if (!fs.existsSync(path.join(compDir, file))) {
						fs.mkdirSync(path.join(compDir, file));
					}
					convertDir(path.join(origDir, file), path.join(compDir, file));
				}
			} else {
				//user is doing not good things. They have objects in their filesystem that are not files or directories.
				console.log();
				console.log('=======very bad thing========'.red);
				console.log(file, 'is not a file or directory. It will be skipped.');
				console.log('============================='.red);
				console.log();
				console.log('skipping'.blue, file);
			}
		} else {
			console.log('skipping'.blue, file);
		}
	});
}

function watchFile(origFile, compFile, same) {
	if ('.markdown .md .coffee .litcoffee .scss .scss .talapa'.indexOf(path.extname(origFile)) == -1 && same || origFile.charAt(0) == '_') {
		//so it's either not a file that needs to be compiled and we are in the same directory, or it starts with an underscore
		return;
	}
	console.log('watching'.cyan, origFile);
	var first = true;
	fs.watch(origFile, function (event) {
		if(first){
			first = false;
			return
		}
		if (event == 'change') {
			convertFile(origFile, compFile, same);
		}
	});
}	

function watchDirectory (origDir, compDir) {
	var files = fs.readdirSync(origDir);
	var same = false;
	if (origDir == compDir) { same = true; }
	files.forEach(function(file) {
		var stats = fs.lstatSync(path.join(origDir, file));
		if (file.charAt(0) !== '_') {
			if (stats.isFile()) {
				convertFile(path.join(origDir, file), path.join(compDir, file), same);
				watchFile(path.join(origDir, file), path.join(compDir, file), same);
			} else if (stats.isDirectory()) {
				if (skipDIR) {  //we should skip everything
					console.log('skipping'.blue, file);
				} else if (dirsToIgnore.indexOf(' ' + file + ' ') != -1) {  //it is a directory we should ignore
					console.log('skipping'.blue, file);
				} else {  //its normal
					watchDirectory(path.join(origDir, file), path.join(compDir, file));
				}
			} else {
				//user is doing not good things. They have objects in their filesystem that are not files or directories.
				console.log();
				console.log('=======very bad thing========'.red);
				console.log(file, 'is not a file or directory. It will be skipped.');
				console.log('============================='.red);
				console.log();
				console.log('skipping'.blue, file);
			}
		} else {
			console.log('skipping'.blue, file);
		}
	});
}