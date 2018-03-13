import test from 'ava'
import path from 'path'
import Queue from '../src/hrawler/Queue'

test('loading a good JSON file', async t => {
  const queue = new Queue()
  await queue.loadFile(path.resolve(__dirname, './fixtures/good.json5'))
  t.snapshot(queue.listOfUrls)
})

test('loading a bad JSON file', async t => {
  const queue = new Queue()
  try {
    await queue.loadFile(path.resolve(__dirname, './fixtures/bad.json5'))
  } catch(err) {
    t.snapshot(err.message)
  }
})

test('loading duplicate JSON file', async t => {
  const queue = new Queue()
  await queue.loadFile(path.resolve(__dirname, './fixtures/good.json5'))
  await queue.loadFile(path.resolve(__dirname, './fixtures/good2.json5'))

  t.snapshot(queue.listOfUrls)
})

test('filter out bad UIR', t => {
  const testUrls = [
    '/full-root-path',
    '/full-root-path?q=123',
    '/full-root-path?q=123#header',
    './samedir-path',
    './samedir-path?q=123',
    './samedir-path?q=123#header',
    '../samedir-path',
    '../samedir-path?q=123',
    '../samedir-path?q=123#header',
    'javascript:void(0)',
    'http2://something',
    'http2://something?q=123',
    'http2://something?q=123#header',
    'http2://somedomain.com/some/path',
    'http2://somedomain.com/some/path?q=123',
    'http2://somedomain.com/some/path?q=123#header',
    '//newdomain.com/my-path',
    '//newdomain.com/my-path?q=12345',
    '//newdomain.com/my-path?q=123#header',
    'http://newdomain.com/my-path',
    'http://newdomain.com/my-path?q=123',
    'http://newdomain.com/my-path?q=123#header',
    'https://newdomain.com/my-path',
    'https://newdomain.com/my-path?q=123',
    'https://newdomain.com/my-path?q=123#header',
    'https://newdomain.com/#header',
    'https://newdomain.com#header',
    'https://newdomain.com',
    '#header',
    '#',
    '',
  ]

  // you will need a base site like 'http://mytest.domain.com/some/path?q=123'
  // think about http vs https for base site
})

test('parse HTML', t => {
  function markup(head, fragment) {
    return `<html><head>${head}</head><body>${fragment}</body></html>`
  }

  const testFragments = [
    markup(``, `<a>`),
    markup(``, `<h1>foo</h1><div>woo <i>hoo</div><h1>bar</h1>`),

    // single a[href] with ' " ` (NaN quoting)
    markup(``, `<p>foo<a href=page>my link</a>bar 1</p>`),
    markup(``, `<p>foo<a href="page">my link</a>bar 2</p>`),
    markup(``, `<p>foo<a href='page'>my link</a>bar 3</p>`),
    markup(``, '<p>foo<a href=`page`>my link</a>bar 4</p>'),

    // single a[href] spaces after att
    markup(``, `<p>foo<a href= page >my link</a>bar a</p>`),
    markup(``, `<p>foo<a href= "page" >my link</a>bar b</p>`),
    markup(``, `<p>foo<a href= 'page' >my link</a>bar c</p>`),
    markup(``, '<p>foo<a href= `page` >my link</a>bar d</p>'),
    markup(``, `<p>foo<a href = page >my link</a>bar e</p>`),
    markup(``, `<p>foo<a href = "page" >my link</a>bar f</p>`),
    markup(``, `<p>foo<a href = 'page' >my link</a>bar g</p>`),
    markup(``, '<p>foo<a href = `page` >my link</a>bar h</p>'),

    // check rel nofollow, noindex
    markup(``, `<p>foo<a href="page" rel="nofollow">my link a</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel="noindex">my link b</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel="noindex nofollow">my link c</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel="noindex,nofollow">my link d</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel="nofollow+noindex">my link e</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel="nofollow , noindex">my link f</a>bar</p>`),
    markup(``, `<p>foo<a href="page" rel=noindex,nofollow>my link g</a>bar</p>`),
    markup(``, `<p>foo<a rel="noindex" href="page">my link h</a>bar</p>`),
    markup(``, `<p>foo<a rel=noindex,nofollow href="page">my link i</a>bar</p>`),

    // check for 2 urls
    markup(``, `<p>foo<a href="link1">link1</a>bar<a href="link2">link2<a></p>`),
    markup(``, `<p>foo<a href="link1">link1 nested <a href="link2">link2 nested<a></a></p>`),

    // check the robots meta tag
    markup(`<meta content="noindex" name="robots">`, `<p>foo<a href="link1">link1</a>bar<a href="link2">link2<a></p>`),
    markup(`<meta name=robots content=noindex>`, `<p>foo<a href="link1">link1</a>bar<a href="link2">link2<a></p>`),
    markup(`<meta name=robots content=noindex foobar="noindex">`, `<p>foo<a href="link1">link1</a>bar<a href="link2">link2<a></p>`),

    // misc meta tag with noindex
    markup(`<meta name=foobar content="noindex">`, `<p>foo<a href="link1">link1</a>bar<a href="link2">link2<a></p>`),
  ]
})

