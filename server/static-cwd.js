#! /usr/bin/env node

// 在当前目录启动静态资源服务器
const path = require("path");
const fs = require("fs");
const URL = require("url");
const http = require("http");
const util = require("util");

let CWD = process.cwd();
let PORT = process.env.PORT || 7000;
let DIR = process.env.DIR || CWD;

const extmap = {
  html: "text/html",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  json: "application/json"
};

const app = http.createServer(function(req, res) {
  let { pathname } = URL.parse(req.url);
  // console.log(pathname);
  let extname = path.extname(pathname).slice(1);

  if (pathname === "/favicon.ico") {
    res.end();
  }

  try {
    let filepath = require.resolve(path.join(DIR, pathname));

    util
      .promisify(fs.readFile)(filepath, "utf-8")
      .then(file => {
        res.writeHead(200, {
          "content-type": extmap[extname] || "text/plain"
        });
        res.end(file);
      })
      .catch(err => {
        res.writeHead(500);
        res.end("server error");
      });
    // fs.readFile(filepath, "utf-8", function(err, file) {
    //   if (err) {
    //     res.writeHead(500);
    //     res.end("server error");
    //   } else {
    //     res.writeHead(200, {
    //       "content-type": extmap[extname] || "text/plain"
    //     });
    //     res.end(file);
    //   }
    // });
  } catch (e) {
    res.writeHead(302, {
      Location: "/404.html"
    });
    res.end("page not found");
  }
});

app.listen(PORT, function(err) {
  if (err) return;
  console.log(`static server listen on ${PORT}`);
});
