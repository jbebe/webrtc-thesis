const path = require('path');
const express = require('express');
const app = express();

const root = path.join(process.cwd(), '..', 'client');
console.log(root);
app.use(express.static(root));

const port = 80;
app.listen(port, () => console.log(`Example app listening on port ${port}`));