# show-markup

show markup file on browser at realtime

support Lightweight markup language

* Markdown (`*.md, *.markdown`)
* Textile (`*.tt, *.textile`)

## Install

```bash
$ npm install -g show-markup
```

## Usage


```bash
$ show-markup
```

open http://localhost:3000 on browser.  
show file or directory list of 'current working directory'  

ex. 

```
here
|- aaa.markdown
|- bbb.textile
|- ccc.txt
`- ddd (directory)
    |- eee.md
    `- fff.tt
```

so,

http://localhost:3000 on browser

aaa.markdown  
bbb.textile  
ddd  

http://localhost:3000/ddd on browser

eee.md  
fff.tt  





## License

Copyright (c) 2012, Ryota Kato (MIT License).
