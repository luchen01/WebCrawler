import fs from 'fs'
import json from 'json5'
import axios from 'axios'
import cheerio from 'cheerio'
import path from 'path'
import url from 'url'
import fetch from 'node-fetch'

export default class Queue {
  constructor(concurrency, timeout) {
    this.concurrency = concurrency
    this.timeout = timeout
    this.listOfUrls = []
    this.listToFollow = []
    this.visited = {}
  }

  start() {
    // start crawling the urls
    console.log('inside urls', this.listOfUrls);
  }

  loadFile(fullPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          reject(err)
        } else {
          try {
            const parsedUrls = json.parse(data.toString())
            this.listOfUrls = parsedUrls.reduce((acc, val) => {
              if (acc.find(item => item.url === val.url)) return acc
              return acc.concat(val)
            }, this.listOfUrls)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })
    })
  }

  fetchUrl(newUrl) {
    const urlDetail = url.parse(newUrl);
    const host = urlDetail.host;
    fetch(newUrl)
      .then((res) => {
        if (res.status === 400) {
          console.log('page not found');
          res.sendStatus(400);
        } else if (res.status === /5*/) {
          console.log('500');
          res.sendStatus(500);
        } else if (res.status === 200) {
          console.log('200');
        }
        console.log('res status', res.status);
        return res.text();
      })
      .then((html) => {
        const $ = cheerio.load(html);
        const newUrls = $('a[href]').map((i, el) => $(el).attr('href'));
        const internalUrl = [];
        const externalUrl = [];
        let noPathName = 0;
        console.log('newUrl length', newUrls.length);
        Array.from(newUrls).map((uri) => {
          const parseUri = url.parse(uri);
          if (!parseUri.pathname) {
            noPathName++;
            return false;
          }
          // handle externam paths
          if (parseUri.hostname !== host) {
            externalUrl.push(uri);
          } else {
            parseUri.host = host;
            parseUri.protocol = urlDetail.protocal;
            parseUri.pathname = path.resolve(urlDetail.pathname, parseUri.pathname);
            parseUri.href = host + parseUri.pathname;
            internalUrl.push(uri);
          }
        })
        console.log('external url', externalUrl.length);
        console.log('internal url', internalUrl.length);
        console.log('no path name', noPathName);
        this.listToFollow = [...this.listToFollow, ...internalUrl];
      })
      .catch(err => console.log('err in fetch', err))
  }
}
