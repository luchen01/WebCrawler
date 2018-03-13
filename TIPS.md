# TIPS

To parse html you can use regex, but [cheerio](https://github.com/cheeriojs/cheerio)
is a much better solution.

```javascript
import $ from 'cheerio'
const dom = $.load('<html><body><a href="./nice-page">xxx</a></body></html>')

// dom takes a css selector

dom('a[href]').map((i, el) => $(el).attr('href'))
// output: ['./nice-page']

dom('a[href]').map((i, el) => $(el).text())
// output: ['xxx']

dom.text()
// output" 'xxx' (or all the text with our html tags)
```

You will need to also fetch the page. You can use request, Axios,
superagent, node-fetch. You can even use the nodejs http module.

Axios & node-fetch have promise support so could be a good fit with
es6

```javascript
fetch('https://github.com/')
	.then(res => {
		console.log(res.ok)
		console.log(res.status)
		console.log(res.statusText)
		console.log(res.headers.raw())
		console.log(res.headers.get('content-type'))
		
		return res.text()
	})
	.then(html => {
	  console.log(html)
	})
```

You should handle the status code i.e. 200, 404, 5XX.
Keep in mind Axios & node-fetch will handle all the 3XX for you.

If you want you can find npm packages that add support to
Axios & node-fetch to handle retry logic, etc.

### URLS you need to look for

Because href can have diffrent kinds of url you need to handle them all
for example:

```
javascript:void(0)
./my-page
../my-page
//foobar.com/hi
#help
```

To handle relative paths you can use nodejs path module. For example,
```javascript
const path = require('path')
path.resolve('/foo/bar/path', '../demi')
// output: /foo/bar/demi
```

You can also use nodejs url module to parse and format any URI. For example,
```javascript
const url = require('url')
const details = url.parse('http://foobar.com/mypath?q=1&4#footer')
// output: {protocol:'http:', slashes:true, auth:null, host:'foobar.com', port:null, hostname:'foobar.com', hash:'#footer',search:'?q=1&4', query:'q=1&4', pathname:'/mypath', path:'/mypath?q=1&4',href:'http://foobar.com/mypath?q=1&4#footer'}

details.host = 'www.apple.com'

url.format(details)
// output: http://www.apple.com/mypath?q=1&4#footer
```

# ALL TOGETHER

```javascript
const url = require('url')
const path = require('path')
const fetch = require('node-fetch')
const $ = require('cheerio')

const pageToFetch = 'https://github.com/'
const _pageToFetch = url.parse(pageToFetch)

fetch(pageToFetch)
  .then(res => res.text())
  .then(html => {
    const dom = $.load(html)
    const foundUrls = dom('a[href]').map((i, el) => $(el).attr('href'))
    const externalUrls = []
    const internalUrls = Array.from(foundUrls).map(uri => {
      const _uri = url.parse(uri)
      if (!/^https?:$/i.test(_uri.protocol)) return false
      if (!_uri.hostname) {
        _uri.hostname = _pageToFetch.hostname
        _uri.protocol = _pageToFetch.protocol
        _uri.host = _pageToFetch.host
      }
      _uri.hash = null
      _uri.pathname = path.resolve(_pageToFetch.pathname, _uri.pathname)
      if(_uri.hostname !== _pageToFetch.hostname) {
        externalUrls.push(url.format(_uri))
        return null
      }
      return url.format(_uri)
    }).filter(Boolean)

    console.log(internalUrls)
    console.log(externalUrls)
  })
```
