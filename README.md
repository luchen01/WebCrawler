# Hello, Hoogle

We recognize that doing a coding exercise at a whiteboard during an interview is
stressful and likely doesn't represent how you would do if you were to work on a
problem in your own time, in a comfortable environment.

Instead, we're asking you to implement a few features on this web crawler app.
 We ask that you return this exercise to us in about a week.
 Out of respect for your time, we suggest that you timebox your efforts to several hours.
 If you would like to spend more
time getting familar with the frameworks/libraries or polishing your code, feel
free. We don't expect you to implement every suggested feature in the exercise.

If you have questions or get stuck during the exercise, please reach out to your
interviewer by email.

## App

Build a web crawler app using nodejs. This application will take an input
file `list-of-urls.json` JSON5 list of URLs to crawl. Your job is
to implement a bot that will fetch all the URLs in the file. Parse and follow
all the links on the page. The goal of the crawler is to discover all the content
on the site and download its content (only HTML not other resources) to the output directory.

When crawling the site we do not want to follow external websites, only the URLs
that are listed in `list-of-urls.json`, but we want to output a list of external websites
the crawler found so we can crawl them later.

Use your knowledge of HTTP and async programming to shine. Thing about the architecture
like how should you handle throttling network calls, handle errors, retries, etc.

Your spider should also understand HTTP and respect the standers a good website should abide by.
In addition, it should also support the concurrency flag so on large sites like apple.com it will
not slam apples servers with requests.

For extra credit, you can store the documents in elastic search and build a simple search
interface.

Please feel free to rewrite any part of the application!

## Getting Started

Node 6.3.1+ is the only prerequisite. Consider using [nvm](http://nvm.sh/) for
installation.

Fetch dependencies with `npm install`.  
Link the npm package `npm link .`.
Start the web crawler `npm start` or `hrawler -f ./data/list-of-urls.json` 

If you have not run the `npm link .` you can manually run by bin path
```
$> ./bin/hrawler -f ./data/list-of-urls.json
```

## TODO

- parse HTML and extract all internal links and track external links
- build a queue and throttling mechanism to control the page fetcher
- handle HTTP status, headers, meta tag, error code, and standards
- parse malformed html and find all anchors

### Extra Credit
- write the documents to ES not file system
- build a search interface
- build a priority queue
- add basic monitoring and stats around the crawler
- make the crawler work in a distributed way

Though the main task is implementing the crawler, please feel free to implement
additional features if you like. This is your chance to shine: show us what you
think is a good representation of your skills and interests.

## What We're Looking For

There are likely more tasks than you will be able to complete in the suggested
day timeframe. We encourage you to focus on tasks and implementation details that
highlight your skillset and interests; fewer tasks done well is better than more
tasks done at a lower degree of fidelity. Additionally, feel free to "fill in
the gaps" by explaining in TODO.md what you would do and how you might do it
given more time.

In addition to functionality, we also look at architecture, organization,
linting and style, and overall polish. We're looking for idiomatic modern
JavaScript that matches the established style of the existing codebase. 
We're looking for a mobile app that makes sense in terms of navigation 
and feel.  We value
code that is easy to follow and understand, without stale or commented-out
sections. Aim for code that you would be proud to deploy.

Lastly, this exercise does not have to be done in isolation. We encourage you to
ask questions as you familiarize yourself with the codebase, architecture, and
application. You should have received an email invite to a private Slack channel
where you can discuss questions with your interviewer. Feel free to reach out or
work alone, whichever suits you.

And remember, the purpose of this exercise is to help you demonstrate your
abilities on your own time in a low-pressure environment. Have fun with it!

## Saving and Submitting

- Work on a new branch not master
- Commit your work to that branch (make sure not to leave uncommitted work!)
- Feel free to use TODO.md to include any additional thoughts or comments on
the app, your implementation, or what you would do if given more time.
