import fs from 'fs'
import json from 'json5'

export default class Queue {
  constructor(concurrency, timeout) {
    this.concurrency = concurrency
    this.timeout = timeout
    this.listOfUrls = []
  }

  start() {
    // start crawling the urls
    console.log(this.listOfUrls)
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
}
