const express = require("express");
const Pool = require("pg").Pool;

const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432
});

function initDB()
{
    /*
    const sql = `
    CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL,
        status VARCHAR(16),
        openDate DATE,
        priority VARCHAR(8),
        title TEXT,
        author INTEGER REFERENCES users,
        category VARCHAR(32),
        assignee INTEGER REFERENCES users,
        description TEXT,
        image TEXT
    )`;
    */

    const sql = `
    CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL,
        status TEXT,
        openDate TEXT,
        priority TEXT,
        title TEXT,
        author TEXT,
        category TEXT,
        assignee TEXT,
        description TEXT,
        image TEXT
    )`;

    pool.query(sql, (err, result) => {
        if (err) throw err;
        else
        {
            console.log("'tickets' table created.");
        }
    });
}

let tickets = [];

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.listen(3000, () => {
    console.log("Listening on port 3000");
    initDB();
});

app.get('/allTickets', (req, res) => {
    res.send(tickets);
});

app.get('/ticket/:ticketId', (req, res) => {
    let ticket = tickets.find(ticket => ticket.id === parseInt(req.params.ticketId));
    res.send(ticket);
});

app.post('/newTicket', (req, res) => {
    let data = req.body;

    const query = `INSERT INTO tickets (status, openDate, priority, title, author, category, assignee, description, image) VALUES ('${data.status}', '${data.openDate}', '${data.priority}', '${data.title}', '${data.author}', '${data.category}', '${data.assignee}', '${data.description}', '${data.image}')`;

    pool.query(query, (err, result) => {
        if (err) throw err;

        //console.log(result.rows);
    });
});

var options = [
    "Walmart",
    "Kroger",
    "Meijer"
];

app.get('/getnames', (req, res) => {
    res.send(options);
});

