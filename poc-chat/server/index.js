const https = require("https"),
  express = require("express"),
  path = require("path"),
  fs = require("fs");

const options = {
  key: fs.readFileSync('ssl/server-key.pem'),
  cert: fs.readFileSync('ssl/server-crt.pem'),
  ca: fs.readFileSync('ssl/ca-crt.pem'),
};

const app = express();

const root = path.join(process.cwd(), '..', 'client');
app.use(express.static(root));
console.log(`static root: ${root}`);

app.listen(9000);

https.createServer(options, app).listen(9090);

/*
chrome flags to run this on LAN:
--disable-background-networking --disable-client-side-phishing-detection --disable-default-apps --disable-hang-monitor --disable-popup-blocking --disable-prompt-on-repost --disable-sync --disable-web-resources --enable-automation --enable-logging --force-fieldtrials=SiteIsolationExtensions/Control --ignore-certificate-errors --log-level=0 --metrics-recording-only --no-first-run --password-store=basic --remote-debugging-port=12207 --safebrowsing-disable-auto-update --test-type=webdriver --use-mock-keychain --user-data-dir="C:\Users\Sam\AppData\Local\Temp\some-non-existent-directory"

 */