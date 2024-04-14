const express = require("express");
const session = require("express-session");
const Pool = require("pg").Pool;
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '5432',
    port: 5432
});

// Creates all necessary tables
function initDB()
{
    let sql = `
    CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        status TEXT,
        openDate TEXT,
        priority TEXT,
        title TEXT,
        author INT,
        category TEXT,
        assignee INT,
        description TEXT,
        image BYTEA,
        site INTEGER
    )`;
    pool.query(sql, (err, result) => {
        if (err) throw err;
    });
    
    sql = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT,
        name TEXT,
        password TEXT,
        site INTEGER,
        role TEXT default 'user'
    )`;
    pool.query(sql, (err, result) => {
        if (err) throw err;
    });

    // Creates the "Any" user, which is used to allow unassigned tickets
    sql = "SELECT * FROM users WHERE id = 0";
    pool.query(sql, (err, result) => {
        if (err) throw err;

        if (result.rowCount === 0)
        {
            sql = `INSERT INTO users (id, name, site) 
                VALUES (0, 'Any', 0)`;
            pool.query(sql, (err, result) => {
                if (err) throw err;
            });
        }
    });

    sql = `
    CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        name TEXT,
        UNIQUE(name)
    )`;
    pool.query(sql, (err, result) => {
        if (err) throw err;
    });
}

app.use(express.static('public'));
app.use(fileUpload());

app.use(express.urlencoded({extended: true}));

app.set("trust proxy", 1);

app.use(session({
    secret: "shhhh",
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        secure: false,
        maxAge: 300000 // 5 minutes
    }
}));


// middleware for checking if the user is logged in
function authLogin (req, res, next) {
    if (req.session.profile) {
        next();
    }
    else {
        res.redirect("/login");
    }
}

app.listen(3000, () => {
    console.log("Listening on port 3000");
    initDB();
});

app.get('/', authLogin, (req, res) => {
    res.redirect("/tickets");
});

app.get('/tickets', authLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/tickets.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.get('/settings', authLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/settings.html'));
});

app.get('/admin', authLogin, (req, res) => {
    if (req.session.profile.role === 'admin') {
        res.sendFile(path.join(__dirname, '/public/admin.html'));
    }
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.post('/api/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = $1 AND password = $2 AND site = $3";
    const values = [req.body.email, req.body.password, parseInt(req.body.site)];

    for (const val of values)
    {
        if (!val) {
            res.json({success: false});
            return;
        }
    }

    pool.query(sql, values, (error, results) => {
        if (error) {
            res.json({success: false});
            throw error;
        }
        if (results.rowCount > 0) {
            let result = results.rows[0];
            req.session.profile = { 
                id: result.id,
                name: result.name,
                site: result.site,
                role: result.role
            };
            res.json({ success: true, url: "/tickets"});
        }
        else {
            res.json({success: false});
        }
    })
});

app.post('/api/signup', (req, res) => {
    let query = `INSERT INTO users (name, email, password, site, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, site, role`;
    let values = [req.body.name, req.body.email, req.body.password, req.body.site, 'user'];
    pool.query(query, values, (error, results) => {
        if (error || results.rowCount < 1) {
            res.json({success: false, message: "error signing up"});
        }
        else {
            let result = results.rows[0];
            req.session.profile = { 
                id: result.id,
                name: result.name,
                site: result.site,
                role: result.role
            };
            res.json({success: true, url: "/tickets"});
        }
    });
});

// This route handles an "admin" signup. It creates the new site as well.
app.post('/api/signup-admin', (req, res) => {
    let query = "INSERT INTO sites (name) VALUES ($1) RETURNING id";
    let values = [req.body.siteName];
    pool.query(query, values, (error, results) => {
        if (error) {
            res.json({success: false, message: "error creating site"});
        }
        else {
            let subquery = `INSERT INTO users (name, email, password, site, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, site, role`;
            values = [req.body.name, req.body.email, req.body.password, results.rows[0].id, 'admin'];
            pool.query(subquery, values, (sub_error, sub_results) => {
                if (sub_error || sub_results.rowCount < 1) {
                    res.json({success: false, message: "error creating account"});
                }
                else {
                    let result = sub_results.rows[0];
                    req.session.profile = { 
                        id: result.id,
                        name: result.name,
                        site: result.site,
                        role: result.role
                    };
                    res.json({success: true, url: "/tickets"});
                }
            });
        }
    })
});

app.get('/allTickets', authLogin, (req, res) => {
    /*
        * Since author and assignee are stored as ids, this
        * joins the tickets and users tables in order to change
        * the fields in the result to the user's names
    */
    const sql = `
    SELECT tickets.id, status, opendate, priority, title, 
        u1.name AS author, category, u2.name AS assignee, 
        description
    FROM tickets
        JOIN users u1 ON tickets.author = u1.id
        JOIN users u2 ON tickets.assignee = u2.id
    WHERE tickets.site = $1 OR tickets.site = 0`;

    const values = [req.session.profile.site];

    pool.query(sql, values, (error, results) => {
        if (error) throw error
        res.status(200).json (results.rows)
    })
});

app.get('/ticket/:ticketId', authLogin, (req, res) => {
    const query = 'SELECT * FROM tickets WHERE ID = $1'; 
    const ticketId = parseInt(req.params.ticketId);
    const values = [ticketId];
    
    /*
        * canModify is sent to the client and is used for hiding the
        * delete and change priority buttons
    */
    let canModify = true;
    if (req.session.profile.role != "tech") canModify = false;

    pool.query(query, values, (error, results) => { 
        if (error) throw error

        let result = results.rows[0];

        if (result.site != req.session.profile.site) {
            return;
        };

        if (result.image) {
            const b64 = Buffer.from(result.image).toString('base64');
            const mimeType = 'image/png';
            result.image = `data:${mimeType};base64,${b64}`;
        }
        else {
            result.image = "";
        }


        res.status(200).json({ticket: result, canModify: canModify}); 
    });
});

app.post('/deleteTicket', authLogin, (req, res) => {
    if (req.session.profile.role != "tech" &&
        req.session.profile.role != "admin") {
        res.json({success: false, message: "role not authorized"});
        return;
    }

    const query = "SELECT * FROM tickets WHERE id = $1"
    const values = [req.body.id];
    pool.query(query, values, (error, results) => {
        if (error) throw error;

        let result = results.rows[0];
        if (!result) {
            res.json({success: false, message: "ticket not found"});
            return;
        }
        else if (result.site != req.session.profile.site) {
            res.json({success: false, message: "site not authorized"});
            return;
        }
        else {
            const subquery = "DELETE FROM tickets WHERE id = $1"
            pool.query(subquery, values, (sub_error, sub_results) => {
                if (sub_error) throw sub_error;

                res.json({success: true});
                return;
            });
        }
    });

});

app.post('/updateTicket', authLogin, (req, res) => {
    if (req.session.profile.role != "tech" &&
        req.session.profile.role != "admin") {
        res.json({success: false, message: "role not authorized"});
        return;
    }

    const query = "SELECT * FROM tickets WHERE id = $1"
    let values = [req.body.id]; 
    pool.query(query, values, (error, results) => {
        if (error) throw error;

        let result = results.rows[0];
        if (!result) {
            res.json({success: false, message: "ticket not found"});
            return;
        }
        else if (result.site != req.session.profile.site) {
            res.json({success: false, message: "site not authorized"});
            return;
        }
        else {
            let newStatus = "";
            if (result.status === "New") newStatus = "In Progress";
            else newStatus = "Closed";

            values = [newStatus, req.body.id];
            const subquery = "UPDATE tickets SET status = $1 WHERE id = $2"
            pool.query(subquery, values, (sub_error, sub_results) => {
                if (sub_error) throw sub_error;

                res.json({success: true});
                return;
            });
        }
    });
});

/*
    * This does not actually delete the user, as it would cause problems
    * with tickets. Instead, it changes their name to "deleted user" and
    * removes the ability to login.
*/
app.post('/deleteUser', authLogin, (req, res) => {
    if (req.session.profile.role != 'admin') {
        res.json({success: false, message: "role not authorized"});
        return;
    }

    const query = "UPDATE users SET name = 'deleted user', email = null, password = null WHERE id = $1 AND site = $2";
    const values = [req.body.id, req.session.profile.site];
    pool.query(query, values, (error) => {
        if (error) {
            res.json({success: false, message: "error deleting user"});
        }
        else {
            res.json({success: true});
        }
    });
});

app.post('/newTicket', authLogin, (req, res) => {
    let data = req.body;
    
    const query = `
    INSERT INTO tickets(status, openDate, priority, title,
        author, category, assignee, description, image, site)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

    let imagedata = null;
    if (req.files) {
        imagedata = req.files.image.data;
    }

    // this could (and should) be done using hidden fields but I am lazy
    data.status = "New";
    data.openDate = new Date().toLocaleDateString();

    const values = [data.status, data.openDate, data.priority,
        data.title, req.session.profile.id, data.category, data.assignee,
        data.description, imagedata, req.session.profile.site];

    pool.query(query, values, (err, result) => {
        if (err) throw err;
        // this causes the page to refresh. otherwise it is stuck loading
        res.status(200).redirect('back');
    });
});

// get all site names from db
app.get('/getnames', (req, res) => {
    const query = 'SELECT * FROM sites';  

    pool.query(query, (error, results) => { 
        if (error) throw error
        
        res.status(200).json(results.rows); 
    });
});

// Returns all users (except for 'deleted' ones)
app.get('/allUsers', authLogin, (req, res) => {
    const query = "SELECT id, name FROM users WHERE site = $1 AND name != 'deleted user'";
    const values = [req.session.profile.site];

    pool.query(query, values, (err, results) => {
        if (err) throw err;
        res.json(results.rows);
    });
});


app.post('/updateUserRole', authLogin, (req, res) => {
    if (req.session.profile.role !== 'admin') {
        res.json({ success: false, message: 'Only admin users can update roles' });
        return;
    }

    const { userId, newRole } = req.body;
    const query = 'UPDATE users SET role = $1 WHERE id = $2';
    const values = [newRole, userId];

    pool.query(query, values, (error, results) => {
        if (error) {
            res.json({ success: false, message: 'Failed to update user role' });
        } else {
            res.json({ success: true, message: 'User role updated successfully' });
        }
    });
});

app.post('/changePassword', authLogin, (req, res) => {
    if (!req.body.password || req.body.password == " ") {
        res.json({success: false, message: "Invalid password."});
        return;
    }
    const query = "UPDATE users SET password = $1 WHERE id = $2";
    const values = [req.body.password, req.session.profile.id];

    pool.query(query, values, (error, results) => {
        if (error) throw error;

        res.json({success: true});
    });
});

app.get('/currentUser', authLogin, (req, res) => {
    res.json(req.session.profile);
});
