1.8.1 - April 20, 2017
----------------------
* fix "too many opened files" error

1.8.0 - February 3, 2017
------------------------
* add partialExtension option, to fix partials matching on the wrong extension

1.7.0 - November 6, 2016
-------------------
* expose consolidate.requires fix (#18)
* check if paths are already absolute before joining the metalsmith path

1.6.5 - May 3, 2016
-------------------
* normalize partial name for windows

1.6.4 - February 22, 2016
-------------------------
* allow layout: false to override default template

1.5.4 - February 14, 2016
-------------------------
* add rename option
* prevent path issue on windows

1.4.4 - January 27, 2016
------------------------
* update lodash.omit

1.4.3 - January 27, 2016
------------------------
* update consolidate

1.4.2 - October 17, 2015
------------------------
* update fs-readdir-recursive

1.4.1 - September 19, 2015
--------------------------
* move check for unspecified layout, #41
* update devdependencies

1.4.0 - August 14, 2015
-----------------------
* ignore files with unspecified layout
* update readme

1.3.1 - August 8, 2015
----------------------
* improve error message for unspecified layout
* update readme

1.3.0 - August 7, 2015
----------------------
* add swig include test
* code style, dependency and readme updates
* add partials option and test

1.2.1 - July 25, 2015
---------------------
* add error handling
* add test for partials

1.2.0 - July 25, 2015
---------------------
* ignore binary files
* add dotfiles
* update readme

1.1.0 - July 19, 2015
---------------------
* update dependencies and devDependencies

1.0.1 - July 16, 2015
---------------------
* update tests and add Travis CI

1.0.0 - November 18, 2014
-------------------------
* remove `inPlace` option
* use `layout` instead of `template` in the front-matter to specify a layout
* set default folder for layouts to `layouts` instead of `templates`

0.6.0 - October 3, 2014
-----------------------
* fix to use `path` for metalsmith `1.0.0`

0.5.2 - July 9, 2014
--------------------
* fix breaking binary files

0.5.1 - June 11, 2014
---------------------
* fix race condition with stringify file contents

0.5.0 - April 29, 2014
----------------------
* pass in options to consolidate.js

0.4.0 - April 2, 2014
---------------------
* add `default` option

0.3.0 - March 10, 2014
----------------------
* add `inPlace` option
* change `pattern` option to just filter

0.2.1 - March 10, 2014
----------------------
* fix bug in matching pattern logic

0.2.0 - March 8, 2014
---------------------
* add rendering files in place with a `pattern`

0.1.0 - March 5, 2014
---------------------
* add `string` engine convenience

0.0.6 - February 7, 2014
------------------------
* fix `directory` option bug

0.0.5 - February 7, 2014
------------------------
* stringify `contents` on the original file data

0.0.4 - February 6, 2014
------------------------
* switch to `extend` from `defaults` to avoid cloning
* add debug statements

0.0.3 - February 6, 2014
------------------------
* fix to use buffers

0.0.2 - February 5, 2014
------------------------
* mix in metadata

0.0.1 - February 4, 2014
------------------------
:sparkles:
