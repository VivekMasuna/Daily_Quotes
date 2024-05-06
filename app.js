if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const mongoose = require('mongoose');
const faker = require('faker');
const Quote = require('./models/quote');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const axios = require("axios");

const MONGO_URL = process.env.ATLASDB_URL;

main()
    .then((res) => {
        console.log("Connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(express.static(path.join(__dirname, "/public/assets")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/today');
        const quote = response.data[0];
        // console.log(quote);

        res.render("quotes/index.ejs", {quote});
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});

app.get('/quotes', async (req, res) => {
    // generateFakeData();
    const allQuotes = await Quote.find({});
    res.render("quotes/allQuotes.ejs", {allQuotes});
});

app.get('/add50', async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/quotes?count=50');
        const quotes = response.data;

        const formattedQuotes = quotes.map(quote => ({
            q: quote.q,
            a: quote.a
        }));
        await Quote.insertMany(formattedQuotes);

        console.log('50 quotes added to the database successfully!');
        res.redirect('/quotes');
    } catch (error) {
        console.error('Error adding quotes:', error);
        res.status(500).json({ error: 'Failed to add quotes' });
    }
});

app.get('/quotes/:author', async (req, res) => {
    let { author } = req.params;
    const quotesOfAuthor = await Quote.find({a: `${author}`});
    res.render("quotes/author.ejs", {quotesOfAuthor, author});
});

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});

const generateFakeData = async () => {
    try {
      // Generate 10 fake data entries
      const fakeData = Array.from({ length: 10 }, () => ({
        q: faker.lorem.sentence(),
        a: faker.name.findName(),
      }));
  
      // Insert fake data into the database
      await Quote.insertMany(fakeData);
      console.log('Fake data generated successfully!');
    } catch (error) {
      console.error('Error generating fake data:', error);
    } finally {
      // Close the database connection
      mongoose.disconnect();
    }
};