exports.compile = function including (list){
	var data = require('./data/inclusions.js')();
  var output = '';
	var colors = require('colors');
	function tagify(word) { //this will be called on every word
		word = word.replace(',',''); //remove commas
		if(!word) {
      console.log();
      console.log("Error in parsing inclusions, check your :: protocol".red);
      console.log();return;
    } //if there isn't anything after ::
		switch(word.substr(-3)){  //what's the last three letters?
			case 'css':
				output+= ' \r\n\t<link rel="stylesheet" type="text/css" href="' + word + '"/>';
				break;
			case '.js':
				output+= ' \r\n\t<script src="' + word + '"></script>';
				break;
			case 'ico':
				output+= '\r\n\t<link rel="shortcut icon" type="image/x-icon" href="' + word + '">';
				break;
			default:
				word = word.split('::');
				if( word[1] ){
					word = word[0] + ':' + data[word[1]];
				} else {
					word = data[word[0]];
				}
				tagify(word);
				break;
		}
	}
	list.shift();
	list.forEach(function(word){
			if(word){
				try{
          tagify(word.toLowerCase());
        }
				catch (e) {
          console.log();
          console.log('Incorrect inclusion name:'.red, word, 'inclusion skipped'.red);
          console.log();
        }
			}
		});
	return output;
};