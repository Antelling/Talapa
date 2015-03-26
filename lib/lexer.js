exports.receive = function lexer(code, shouldReturnVars, shouldReturnTemps) {

  code = code
    .toString()//it gets mad otherwise. whatever.
    .replace(/\r\n/g, ':::--!tab:::')
    .replace(/\n/g, ':::--!tab:::')
    .replace(/\r/g, ':::--!tab:::')
    .replace(/:::--!tab:::/g, '\r\n');

  var firstLine = code.trim().split('\r\n')[0];
  if (firstLine.trim().indexOf(' s:') !== -1){
    var tabStyle = firstLine.split(' ').pop().slice(2);
    code = code.replace('s:', ':::talapa-split-mark!!!:::').split(':::talapa-split-mark!!!:::');
    code = code[0] + code[1].slice(1);
  } else {
    tabStyle = 4;
  }

  code =
    expand(
      compress(
        code
          .replace(new RegExp(mult(' ', tabStyle), 'g'), '\t')
          .replace(/ \/\/ /g, '--')
          .replace(/ \/\/\/ /g, '---')
          .split('\r\n')
      )
    )
    .join('\r\n')
    .replace(/ `- /g, ' - ')
    .split('\r\n');

  var html = require('./htmlCompiler');
  return html.compile(code, shouldReturnVars, shouldReturnTemps);

  function compress(code) { //removes double tabbing
    var newCode = [];
    var curTab = 0;
    var preTab = 0;
    var tabDiff = 0;
    var special = false;
    var startTab = 0;
    code.forEach(function (line) { //we want to remove double tabbing but not in markdown or coffeescript.
      if (!line.trim()) {
        newCode.push('');
        return;
      } //if its an empty line, add an empty line

      preTab = curTab;         //update tab variables
      curTab = (line.match(/\t/g) || []).length;
      tabDiff = curTab - preTab;

      if (special) {
        if (curTab <= startTab) {
          special = false;
        } else {
          newCode.push(line);
          return;
        }
      }
      var trimmed = line.trim();
      if (trimmed == 'markdown' || trimmed == 'escape' || trimmed == 'javascript' || trimmed == 'css' ||
          trimmed == 'coffeescript' || trimmed == 'scss') {
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

  function expand(code){ //deals with - operator.
    //this code is pretty redundant, and you might be able to merge it with compress(). But I think that could cause
    //problems with lines that use both double tab in and - .
    var newCode = [];
    var curTab = 0;
    var preTab = 0;
    var tabDiff = 0;
    var special = false;
    var startTab = 0;
    code.forEach(function (line) {
      if (!line.trim()) {
        newCode.push('');
        return;
      } //if its an empty line, add an empty line

      preTab = curTab;         //update tab variables
      curTab = (line.match(/\t/g) || []).length;
      tabDiff = curTab - preTab;

      if (special) {  //don't touch specials
        if (curTab <= startTab) {
          special = false;
        } else {
          newCode.push(line);
          return;
        }
      }
      var trimmed = line.trim();
      if (trimmed == 'markdown' || trimmed == 'escape' || trimmed == 'javascript' || trimmed == 'css' ||
        trimmed == 'coffeescript' || trimmed == 'scss') {
        special = true;
        newCode.push(line);
        return;
      }
      if (trimmed.indexOf(' - ') !== -1){
        var diff = 0;
       trimmed.split(' - ').forEach(function(newLine){
         newCode.push(mult('\t', curTab + diff) + newLine);
         diff++;
       });
      } else {
        newCode.push(line);
      }

    });
    return newCode;
  }

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


};
