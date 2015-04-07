exports.compile = function compileTalapa(code, returnVars, returnTemps) {


  var colors = require('colors');

  code.push('7'); //we need something to force us out of any special at the end.
//list of tags:

  var fs = require('fs');

  var htmlTagsData = require('./data/html_tags')();
  var htmlTags = htmlTagsData;
  var prevTabOcc = 0, currTabOcc = 0, tabDiff = 0;  //tab variables

  var svgTagsData = require('./data/svg_tags.js')();

  var output = '';  //output code variable
  var tags = [];   //stores tags

  var allTemplates = {}, currTemplate = ''; //this is for dealing with templates
  var shouldReturnVars = false, shouldReturnTemps = false;  //for reading templates and variables from other files

  var variables = {};  //this is for storing variables

  var special = '', startIndent = 0, altCode = '', compStyle = '', svg = false;   //variables for dealing with other languages

  var inclusions = ''; //variable to store included files

  var isFullHTML = false;  //we need a way to tell if the talapa code is a full HTML file or just an HTML snippet

  function mult(x, n) {
    var s = '';
    for (; ;) {
      if (n & 1) {
        s += x;
      }
      n >>= 1;
      if (n) {
        x += x;
      }
      else {
        break
      }

    }
    return s;
  }  //multiplies two strings, stolen from http://www.webreference.com/programming/javascript/jkm3/3.html

  function parse(line) {
    var data = {tag: '', att: '', cont: '', temp: '', comment: ''};

    data.comment = comment;

    line = replaceVars(line);

    line = line.trim() + ' ';

    //check for templates

    var firstWord = line.substr(0, line.indexOf(' '));

    if (htmlTags.indexOf('<' + firstWord + '>') == -1 || firstWord.substr(0, 1) == '`') { //not an html tag, return the line
      if (firstWord.substr(0, 1) == '`') {
        line.replace('`', '');
      }
      data.cont = line;
      if (data.comment) {
        data.cont += ' <!--' + data.comment + '-->';
      }
      return data;
    }
    //still here, is not content

    data.tag = firstWord;
    line = line.substr(line.indexOf(' '));
    data.att = line;
    if (typeof data.att === 'undefined') {
      data.att = '';
    }
    if (typeof data.cont === 'undefined') {
      data.cont = '';
    }
    var storage = '';
    var classList = '';
    data.att.split(' ').forEach(function (word) {
      switch (word.substr(0, 1)) {
        case '#':
          word = word.replace('#', 'id="') + '"';
          storage += ' ' + word;
          break;
        case '.':
          classList += word.replace('.', '') + ' ';
          break;
        case '-':
          word = word.replace('--', 'data-');
          storage += ' ' + word;
          break;
        default:
          storage += ' ' + word;
      }
    });
    if (classList) {
      storage += 'class="' + classList + '"';
    }
    data.att = ' ' + storage.trim();
    data.cont = data.cont.trim();
    if (data.comment) {
      data.cont += ' <!--' + data.comment + '-->';
    }
    return data;
  }  //returns data from a parsed line

  function closeTags(difference) {
    for (var flp = difference * -1, flr = 0; flr <= flp; flr++) {
      var pop = tags.pop();  //so we don't have little spaces
      if (pop) {
        output += pop;
      }
    }
  }  //pops the tags list according to the tabDiff

  function replaceVars(line) {
    line = ' ' + line;
    if (line.indexOf(' ?') != -1) {
      var tempLine = '';
      line.split(' ').forEach(function (word) {
        if (word.substr(0, 1) == '?') {
          if (variables[word]) {
            tempLine += variables[word] + ' ';
          } else {
            var newWord = word.slice(0, -1);
            if (variables[newWord]) {
              tempLine += variables[newWord] + ' ';
            } else {
              tempLine += word + ' ';
            }
          }
        } else {
          tempLine += word + ' ';
        }
      });
      return tempLine;
    } else {
      return line;
    }
  }

  function checkComments(line) {
    var comment = line.split('---'); //find the comments we do want to keep
    line = comment.shift();
    if (comment[0]) {
      comment = comment.join('---');
    } else {
      comment = '';
    }

    line = line.split('--').shift(); //remove comments we don't want to keep

    return [line, comment];
  }

  function addComment(comment) {
    if (comment) {
      output += ' <!--' + comment + '-->';
    }
  }


  for (var i = 0, length = code.length; i < length; i++) { //loop through lines
    prevTabOcc = currTabOcc;         //update tab variables
	if (code[i] !== code[i].trim()){
		currTabOcc = (code[i].split(code[i].trim())[0].match(/\t/g) || []).length;
	} else {
		currTabOcc = 0;
	}
    tabDiff = currTabOcc - prevTabOcc;

    if (special) { //deal with other languages
      if (!code[i].trim()) {
        currTabOcc = prevTabOcc;
        altCode += '\r\n';
        continue; //never happened - whitespace doesn't matter here, but it will mess us up
      }
      tabDiff = currTabOcc - startIndent;
      if (currTabOcc <= startIndent) { //normal again
        switch (special) {
          case 'escape':
          case 'javascript':
            output += altCode;
            break;
          case 'markdown':
            if (!marked) {
              var marked = require('marked');
            } //So it doesn't try to grab the file twice. I think.
            try {
              output += marked(altCode);
            }
            catch (e) {
              console.log();
              console.log("=======error in compiling Markdown=======".red);
              console.log(e);
              console.log('========================================='.red);
              console.log();
              output += altCode;
            }
            break;
          case 'def':
            allTemplates[currTemplate] = altCode;
            break;
          case 'template':
            try {
              altCode = altCode.trim().split('\r\n');
              var templateDefinition = {};
              var currAtt = '';
              var tabbing = mult('\t', startIndent + 1);
              altCode.forEach(function (line) {
                if (line) {
                  line = line.replace(tabbing, '');
                  if (line) {  //it's not an empty line
                    if (line.substr(0, 1) == '@') {  //it is a definition
                      currAtt = line.split(' ')[0]; //firstword
                      templateDefinition[currAtt] = '';
                      line = line.split(' - ');  //code for the ' - ' operator
                      line.shift();
                      if (line[0]) {
                        templateDefinition[currAtt] += line.join(' - ');
                      }
                    } else if (currAtt) {
                      templateDefinition[currAtt] += '\r\n' + line;
                    }
                  }
                }
              });
              if (!send) {
                send = require('./lexer.js');
              }
              for (prop in templateDefinition) {
                if (templateDefinition.hasOwnProperty(prop)) {
                  templateDefinition[prop] = send.receive(templateDefinition[prop]).replace(/\r\n/g, '').replace(/\t/g, '');
                }
              }
              /*so now we have this object of this template call, with another object holding the template,
              which has the HTML code with the variables we want to fill in. We're going to find them in the template
              definition, check if they have a passed value, and then replace them. Then we are going to replace the
              variables of this code, and send it off to be compiled by this file. Then we'll add it to our output. */

              var rawTemplate = allTemplates[currTemplate];

              for (var prop in templateDefinition) {
                if (templateDefinition.hasOwnProperty(prop)) {

                  var replacee = new RegExp(prop, "g");
                  try {
                    rawTemplate = rawTemplate.replace(replacee, templateDefinition[prop]);
                  }
                  catch (e) {
                    console.log();
                    console.log('=======error in templates======='.red);
                    console.log(e);
                    console.log('================================'.red);
                    console.log();
                  }
                }
              }

              output += send.receive(rawTemplate);  //send this off to turn into html

            } catch (e) {
              console.log();
              console.log('=======error in templates======='.red);
              console.log(e);
              console.log(templateDefinition, allTemplates);
              console.log('================================'.red);
              console.log();
            }
            break;
          case 'css':
            compStyle += altCode;
            break;
          case 'scss':
            if (!scss) {
              var scss = require('./scss.js');
            }
            compStyle += scss.compile(altCode);
            break;
          case 'coffeescript':
            if (!coffee) {
              var coffee = require('./coffeescript.js');
            }
            output += coffee.compile(altCode);
            break;
        }
        special = '';
        altCode = '';
      } else {
        altCode += ' \r\n' + code[i].replace(mult('\t', startIndent + 1), '').replace(mult('    ', startIndent + 1), '');
        continue;
      }
    }

    //not in anything special, but we might start. Let's check.
    var words = code[i].trim();
    var commentStorage = checkComments(words);  //just a temporary container
    words = commentStorage[0].split(" ");
    var comment = commentStorage[1];
    var firstWord = words[0].toLowerCase();

    switch (firstWord) {
      case '':
        addComment(comment);
        currTabOcc = prevTabOcc;  //it never happened
        output += '\r\n';
        break;
      case 'html':
        output += '<!doctype html> \r\n <html>';
        isFullHTML = true;
        break;
      case 'include':
        addComment(comment);
        var includer = require('./inclusions.js');
        inclusions = includer.compile(words);
        break;
      case 'read':
        try {
          addComment(comment);
          words.shift();
          var isPath = false;
          var location = '';
          words.forEach(function (word) {
            if (isPath) {
              location = word;
            }
            switch (word) {
              case 'templates':
                shouldReturnTemps = true;
                break;
              case 'variables':
                shouldReturnVars = true;
                break;
              case 'from':
                isPath = true;
                break;
              default:
                break;
            }
          });

          if (!path) {
            var path = require('path');
          }
          if (!send) {
            var send = require('./lexer');
          }

          data = fs.readFileSync(location).toString();

          if (shouldReturnVars) {
            var newVars = {};
            newVars = send.receive(data, true);
          }

          if (shouldReturnTemps) {
            var newTemps = {};
            newTemps = send.receive(data, false, true);
          }

          if (newVars) {
            for (prop in newVars) {
              if (newVars.hasOwnProperty(prop)) {
                variables[prop] = newVars[prop];
              }
            }
          }

          if (newTemps) {
            for (prop in newTemps) {
              if (newTemps.hasOwnProperty(prop)) {
                allTemplates[prop] = newTemps[prop];
              }
            }
          }
        } catch (e){
          console.log('========Error in Templates========'.red);
          console.log(e);
          console.log('=================================='.red);
        }
        break;
      case 'def':
        addComment(comment);
        startIndent = currTabOcc;
        special = firstWord;
        words.shift();  //get rid of def
        currTemplate = words.shift();  //keep track of the template we're in
        break;
      case 'markdown':
        closeTags(tabDiff);
        output += '\r\n<div class="markdown-body">';
        addComment(comment);
        startIndent = currTabOcc;
        special = firstWord;
        tags.push('</div>');
        break;
      case 'css':
      case 'scss':
        addComment(comment);
        startIndent = currTabOcc;
        special = firstWord;
        break;
      case 'coffeescript':
      case 'javascript':
        closeTags(tabDiff);
        addComment(comment);
        startIndent = currTabOcc;
        special = firstWord;
        tags.push('</script>');
        output += '\r\n<script>';
        break;
      case 'escape':
        closeTags(tabDiff);
        addComment(comment);
        startIndent = currTabOcc;
        special = firstWord;
        tags.push('');
        break;
      case 'vars':
        addComment(comment);
        var sto = words.join(' ').trim();
        sto.substr(sto.indexOf(' ')).split(',,').forEach(function (pair) {
          pair = pair.split(' - ');
          variables[pair[0].trim()] = pair[1].trim();
        });
        break;
      default:
        //okay, great. We're in a normal html tag. We already
        //know the tabbing, and are keeping a stack of all the
        //tags we're in.
        if (currTabOcc <= startIndent && svg) {       //we're in an svg tag, lets change our list of html tags to svg ones
          svg = false;
          htmlTags = htmlTagsData
        }
        if (firstWord == 'svg') {
          svg = true;
          htmlTags = svgTagsData;
          startIndent = currTabOcc;
        }

        if (firstWord.substr(0, 1) == '%') {
          //now we're invoking a template. We're going to use our special variable.
          special = 'template';
          currTemplate = firstWord;
          startIndent = currTabOcc;
          closeTags(tabDiff);
          output += '\r\n';
          tags.push('');
          break;
        }

        if (firstWord.substr(0, 1) == '`') { //if they used backticks to prevent a template from firing, or something.
          words.join(' ').replace('`', '');
        }

        var data = parse(words.join(' '));

        if (tabDiff > 0) { //tabbed in
          updateOutput();
        } else {
          closeTags(tabDiff);
          updateOutput();
        }

        break;
    }
  }
  output = output.slice(0, -2);

  if (isFullHTML) {
    output += '\r\n</html>';
  }

  if (returnTemps || returnVars) {
    if (returnTemps) {
      return allTemplates;
    }
    if (returnVars) {
      return variables;
    }
  } else {
    return output;
  }
  function updateOutput() {
    if (data.tag) {
      if (firstWord === 'html') {
        output += '<!doctype html>';
      }
      output += '\r\n' + mult('\t', currTabOcc) + '<' + data.tag + data.att + '>' + data.cont;
      tags.push('</' + data.tag + '>');
      if (firstWord == 'head') {
        output += '<meta charset="utf-8"/>' + inclusions;
      }
      if (firstWord == 'head' && compStyle) {
        output += '<style>' + compStyle + ' \r\n\t </style>';
      }
    } else {
      output += '\r\n' + mult('\t', currTabOcc) + data.cont;
      tags.push('');
    }
  }
};

