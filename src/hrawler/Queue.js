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
    const newUrls = $('a[href]').map((i, el) => {
      { href: $(el).attr('href'),
        rel: $(el).attr('rel')}
    });

    const externalUrl = [];
    let noPathName = 0;
    const internalUrl = Array.from(newUrls).map((uri) => {
      if(uri.rel === "nofollow"){
        return false;
      }
      const parseUri = url.parse(uri.href);
      
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
        return false;
      } else {
        parseUri.pathname = path.resolve(urlDetail.pathname, parseUri.pathname);
        parseUri.href = host + parseUri.pathname;
        internalUrl.push(url.format(uri));
      }
    }).filter(Boolean)

    console.log('external url', externalUrl.length);
    console.log('internal url', internalUrl);
    console.log('no path name', noPathName);
    this.listToFollow = [...internalUrl, ...this.listToFollow];
    console.log('listToFollow', this.listToFollow.length);
    resolve()
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

              if(statusCode !== 200){
                resolve();
              }
              return res.text();
            })
            .then((html) => {
              parseHTML(html, statusCode, headers)
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
