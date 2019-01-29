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
    // findOneAndUpdate() method modifies a document that already exists
    // or creates it if it doesn’t exist.
    return shortenedURLs.findOneAndUpdate(
        { original_url: url },
        // $setOnInsert operator sets value of the document only if
        // it is being inserted, no modification if it already exists
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

const checkIfShortExists = (db, id) => {
    // findOne() method returns document that matches the filter object passed
    // to it or null if no documents match the filter.
        return db.collection('shortenedURLs').findOne({ short_id: id });
};


app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/:short_id', (req, res) => {
    const shortId = req.params.short_id;
    const { db } = req.app.locals;

    console.log(shortId);

    checkIfShortExists(db, shortId)
        .then(doc => {
            if (doc === null) {
                return res.send('No link at that URL found');
            }
            res.redirect(doc.original_url);
        })
        .catch(console.error);
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
        res.redirect(doc.original_id);
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
    });

});





///////////////////////////////////////////////////
// app.set('port', process.env.PORT || 8080 );
// const server = app.listen(app.get('port'), () => {
//     console.log(`Express running, listening on port ${server.address().port}`);
// });


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
