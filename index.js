const express = require("express");
const Pool = require("pg").Pool;

const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '5432',
    port: 5432
});

function initDB()
{

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
    const sql = "SELECT * From Tickets";

    pool.query(sql, (error, results) => {
        if (error) throw error
        res.status(200).json (results.rows)
    })
});

app.get('/ticket/:ticketId', (req, res) => {
    const query = 'SELECT * FROM tickets WHERE ID = $1'; 
    const ticketId = parseInt(req.params.ticketId);
    const values = [ticketId];

    pool.query(query, values, (error, results) => { 
        if (error) throw error
        
        res.status(200).json(results.rows); 
    });
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

