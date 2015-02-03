This still isn't done, but you can download and use it now. [Open an issue](https://github.com/Dibillilia/Talapa) if you find a bug.


##Tabbed Layout Pages

Talapa is an html precompiler. Talapa runs on NodeJS and can be installed through npm.


##Talapa Syntax

Talapa is based around whitespace. 

	html 
	head
		title
			Example Website
	body
		div
			h1
				Hello
				
Every time there is a new line, it checks if the first word is a tag. If it is a tag, it will be turned into html. If it does not start with a tag, it will just be added to the compiled file, after replacing variables. If you want to start a line with a tag, but want it to be treated like content, start it with a backtick.

	div
		`A rabbit!
		
Tags can have attributes:

	div onclick="go()"

Talapa can fill in for some common attributes. A . becomes class=, a # becomes id=, and a -- becomes data=.

	div .class #id --data-something

Anything after a ' - ' will be treated as content.

	div .class - Hello!
	
Comments can be added with ' // ', if you want the compiler to get rid of the comment, or ' /// ', if you want the comment to be added to HTML. Comments need a space on both sides so there aren't issues with URLs.
	
	div .class - Hello!  // this won't be added to the HTML
	span #id - Hi there! // this will be added in <!-- tags -->

If you double tab in, Talapa will condense that line into the previous line.

	div
			#ID
			.Class  // so all of this is on one line.
			But be careful. This is also treated like a comment.

Talapa also supports css, javascript, sass, coffeescript, markdown, and svg.

	html
	sass  //all styling information must go before the head. 
		//whatever sass code you want.
	css
		/* Why would you use CSS when you have SASS? */
	head
		title - Example
		coffeescript
			//whatever coffeescript code you want
		javascript
			//whatever javascript code you want
	body
		markdown
			//Whatever markdown code you want
		escape
			This just tells Talapa not to compile whatever you put here.
		svg
			//now Talapa recognizes SVG tags and not HTML tags
			path
				//svg coordinates and things

Talapa makes it a lot easier to include other files in your HTML document. It has a list of everything on Google Hosted Libraries and cdnjs as of December. You can see the complete list [here](list.txt).

	html
	include stylesheet.css, game.js, favicon.ico, bootstrap, bootstrap-stylesheet
	head
	
Anything added will not have a protocol specified, to avoid http/https conflicts. If you need to specify the protocol, use a double colon:
	
	include http::bootstrap, http::bootstrap-stylesheet

Talapa has templates. They can be defined and used in any file, and can be read from any file. This makes it a lot easier to reuse code.
To define a template, use the def keyword, and then put any HTML you want in the following tabbed block. Anything you want to be user defined should start with an @ symbol.

	def %post
		h1 - @title
		div #postWrapper
		@content

When you call a template, you put a % followed by the template name on it's own line. you can fill in values for any variables you want in the following tabbed block. Passed values can be full Talapa code. Any variable you don't give a value for will not be changed.

	%post
		@title - My Blog
		@content
			p
				once upon a time there was a very 
				nice lady named Wilfred
			p
				She liked cats. She had them everywhere.

Templates can be read from other files with the read keyword.

	read templates from ./file

Talapa has variables. This is a pretty useless feature.
To define some variables, use the var keyword, put a ? then the variable name, a dash surrounded by spaces, and then the value. Seperate variables with double commas.

	vars ?copywrite - Trademark of whatever, blah, foo&reg;,, ?foo - bar!

Then you can just put the variable name anywhere in Talapa code, except templates. Variables don't work in templates.

	div .small - ?copywrite

You can read variables from other files too.

	read variables from ./foo
	read variables and templates from ./bar



##Using Talapa

Install Talapa through npm:

	npm install talapa -g

This will let you use Talapa in a terminal.

You can call Talapa on an individual file. This will compile it into the location you provide if it is Talapa, SASS, or Coffeescript, and copy it to the location if it is anything else. 

	talapa ./index.talapa ./index.html
	talapa ./script.coffee ./logic.js
	talapa ./.gitignore ./compiled/.gitignore

Talapa can compile whole directories. The file architecture will be preserved. Make sure to use the -d or flag.

	talapa ./development ./production -d

You can use x flags if you don't want talapa to compile a filetype. -xs is for SASS, -xc for Coffeescript, -xm for Markdown, and -xt for Talapa.

	talapa ./development ./production -d -xm  //meaning move markdown files instead of compiling them

Talapa can watch a file for saves with the -wf flag.

	talapa ./index.talapa ./index.html -wf

Talapa can watch a directory for saved files with the -wd flag. It will watch sub-folders and preserve file architecture.

	talapa ./development ./production -wd

This will work for any files you save, and can watch sub-folders, but won't work on files you create or rename while this script is running.

##FAQ

#####Why isn't Talapa written as TALAPA?	

Because that's really ugly.

#####I found a bug?

[Open an issue.](https://github.com/Dibillilia/Talapa) Or fix it and submit a Pull Request. Those are nice.

#####Can I use spaces instead of tabs?

No. That's annoying. 

#####Can I use Talapa on Express like Jade?

No. That's what Jade is for. Talapa isn't dynamic.

#####Can I use Talapa to make HTML 4 code?

No. Don't support old browsers. Enabling people to be stupid is mean. Unless you work for a restrictive company. In which case I am so sorry.

#####Can I use Talapa client-side?

I doubt it. You would have to get coffeescript, node-sass, marked, and talapa all working together. And node-sass is written in C++.

#####What license does Talapa use?

Whatever the npm default is. I don't care, do whatever you want.