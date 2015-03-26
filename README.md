#Talapa
A platform agnostic HTML precompiler.

---

**March 26 1.1.0 Update**

- The free server hosting the website has been moved and upgraded. No more downtime, hopefully.
- **Every reference of sass has been replaced with scss, because node-sass can't compile sass, and saying it could is confusing. Talapa won't touch sass files, and the sass keyword is now scss.**
- The ' - ' operator has been changed to be more intuitive. a - span - hello now becomes &lt;a>&lt;span>hello&lt;/span>&lt;/a> instead of &lt;a>span - hello&lt;/a>
- ' // ' and ' /// ' have been deprecated. They still work, but you should use '--' and '---' instead. This makes it play nicer with urls and things.
- Templates should now be accesed via the read keyword as a path **from process.cwd()**. This is because I feel like normal files wil be moved more than template files, and because the other way of reading templates was buggy.
- The internal files structure has been slightly restructured. 
---


Talapa is a clean html precompiler. Talapa is based around whitespace.

	html 
	scss
		body{
			a{
				background-color: blue;
			}
		}
	head
		title - Example Website
	body
		div #header
			h1 - hello
		coffeescript
			alert "welcome to Talapa"
			
Documentation and online compilation can be found [here](www.talapa.info).

