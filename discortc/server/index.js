const express = require("express");
const path = require("path");

const app = express();

const root = path.join(process.cwd(), '..', 'client');
app.use(express.static(root));
console.log(`static root: ${root}`);

app.listen(8000);