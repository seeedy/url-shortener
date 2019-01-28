require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const URL = require('url').URL;
const dns = require('dns');
const { MongoClient } = require('mongodb');
const nanoid = require('nanoid');

const dbUrl = process.env.database;


const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// storing reference to db in app.locals to make accesible in other middleware
MongoClient.connect(dbUrl, { useNewUrlParser: true })
  .then(client => {
    app.locals.db = client.db('shortener');
  })
  .catch(() => console.error('Failed to connect to the database'));


const shortenUrl = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');
    return shortenedURLs.findOneAndUpdate(
        { original_url: url },
        { $setOnInsert: {
            original_url: url,
            short_id: nanoid(7),
            },
        },
        { returnOriginal: false,
          upsert: true,
        }
    );
};


app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

app.post('/new', (req, res) => {
    console.log(req.body.url);

    let originalUrl;
    // return new URL object if input has valid structure
    try {
        originalUrl = new URL(req.body.url);
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'invalid url' });
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(400).send({ error: 'address not found' });
        }

        const { db } = req.app.locals;
        shortenUrl(db, originalUrl.href)
        .then(result => {
            const doc = result.value;
            res.json({
                original_url: doc.original_url,
                short_id: doc.short_id,
            });
        })
        .catch(console.error);
    })

});





///////////////////////////////////////////////////
app.set('port', process.env.port || 8080 );
const server = app.listen(app.get('port'), () => {
    console.log(`Express running, listening on port ${server.address().port}`);
});
