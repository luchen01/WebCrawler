# SIMPLE SOLUTION TIP

You can use the code below to fetch each page. It has support to
get the innerHTML and parse out all the uri (internal/external)

```javascript
const url = require('url')
const path = require('path')
const fetch = require('node-fetch')
const $ = require('cheerio')

const pageToFetch = 'https://github.com/'
const _pageToFetch = url.parse(pageToFetch)

// TODO: check robot.txt and create a blacklist of paths maybe: fetch(pageToFetch+'/robots.txt')

fetch(pageToFetch)
// TODO: check status code, X-robot header (pass it along)
  .then(res => res.text())
  .then(html => {
    const dom = $.load(html)
    // TODO: href can also have rel=nofollow, etc... need to pass on
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
      // TODO: need to handle '//domain.com/path'
      _uri.pathname = path.resolve(_pageToFetch.pathname, _uri.pathname)
      if(_uri.hostname !== _pageToFetch.hostname) {
        externalUrls.push(url.format(_uri))
        return null
      }

      return url.format(_uri)
    }).filter(Boolean)

		// TODO: find <meta robots...>
    return {
      internalUrls,
      externalUrls,
      innerText: dom.text().replace(/\s+/, ' ')
    }
  })
  .then(({internalUrls, externalUrls, innerText}) => {
  console.log(internalUrls)
  console.log(externalUrls)
  console.log(innerText)

  // TODO: push the new URI to the Queue
  // TODO: save the innerText to DB, or file system
})
```

Using the throttle function you can just queue items using
addToQueue() and it will call fn that can fetch the pages

```javascript
function throttle(concurrent, fn) {
  let inflightCount = 0
  const queueOrder = []
  const queue = {}

  function nextItem() { inflightCount--; process.nextTick(go) }

  function go(uri) {
    if(uri && !queue[uri]) queue[uri] = queueOrder.push(uri)
    if(queueOrder.length === 0) return

    if(inflightCount <= concurrent) {
      const nextURI = queueOrder.pop()
      inflightCount++
      fn(nextURI)
        .then((res) => {
          queue[nextURI] = {done: true} // TODO: save res.status etc.
          nextItem()
        })
        .catch(err => {
          // read to the que (maybe add timeout)
          queue[nextURI] = {err} // save the error
          queueOrder.push(nextURI)
          nextItem()
        })
    }
  }

  return go
}

const addToQueue = throttle(2, uri => new Promise((resolve, reject) => {
  setTimeout(()=> resolve({/* my data */}), 150) // 150ms
}))
```

# Solution branchs

Please checkout all the different solution branches to see what is the best or better way to solve the problem

<strong>OK</strong>: hoogle-solotion

<strong>GOOD</strong>: hoogle-solotion-extra

<strong>OUR GOAL</strong>: hoogle-solotion-clean
