const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
})





///////////////////////////////////////////////////
app.set('port', process.env.port || 8080 );
const server = app.listen(app.get('port'), () => {
    console.log(`Express running, listening on port ${server.address().port}`);
});
