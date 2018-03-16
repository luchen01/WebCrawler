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


  parseHTML(html, statusCode, headers){
    console.log(html);
    const $ = cheerio.load(html);

  }

  fetchUrl(newUrl) {
    return new Promise((resolve, reject) => {
      const urlDetail = url.parse(newUrl);
      const host = urlDetail.host;

      if (this.visited[newUrl]) {
        resolve();
      } else {
        this.visited[newUrl] = true;
        let statusCode;
        let headers;

        try {
          fetch(newUrl)
            .then((res) => {
              statusCode = res.status;
              headers = res.headers.raw();

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
              const newUrls = $('a[href]').map((i, el) => {
                {href: $(el).attr('href'), rel: $(el).attr('rel')}
              });
              const internalUrl = [];
              const externalUrl = [];
              let noPathName = 0;
              Array.from(newUrls).map((uri) => {
                const parseUri = url.parse(uri);
                if (!parseUri.pathname) {
                  noPathName++;
                  return false;
                }
                // filter out javascripts
                if (parseUri.protocol === 'javascript') {
                  return false;
                }
                // fill out host
                if (!parseUri.host) {
                  parseUri.host = host;
                  parseUri.protocol = urlDetail.protocol;
                  parseUri.hostname = urlDetail.hostname;
                }
                // handle external paths
                if (parseUri.host !== host) {
                  externalUrl.push(uri);
                } else {
                  parseUri.pathname = path.resolve(urlDetail.pathname, parseUri.pathname);
                  parseUri.href = host + parseUri.pathname;
                  internalUrl.push(url.format(uri));
                }
              })
              console.log('external url', externalUrl.length);
              console.log('internal url', internalUrl);
              console.log('no path name', noPathName);
              this.listToFollow = [...internalUrl, ...this.listToFollow];
              console.log('listToFollow', this.listToFollow.length);
              resolve()
            })
        } catch (error) {
          reject(error)
        }
      }
    })
  }

  followUrl() {
    console.log('inside follow url');
    while (this.listToFollow.length > 0) {
      this.fetchUrl(this.listToFollow.pop());
    }
  }
}
