const express = require("express");
const app = express();

let tickets = [];

/* 
    * Below calls to addTicket() were generated using ChatGPT 3.5.
    *
    * Prompt:
    * Create 12 calls to the function addTicket(status, openDate, priority, title, author, category, assignee), 
    * which creates a support ticket in an IT helpdesk for a retail store. Pick random, nearby dates. status can be either "New", 
    * "In Progress", or "Closed". priority can be either "Low", "Medium", or "High". The assignee should be one person.
*/

/*
addTicket("Closed", "2024-02-22", "High", "Network connectivity problem", "Alex Johnson", "Networking", "Charlie Brown")
addTicket("New", "2024-02-18", "Low", "Printer not working", "John Doe", "Hardware", "Alice Smith")
addTicket("In Progress", "2024-02-20", "Medium", "Software installation issue", "Jane Doe", "Software", "Bob Johnson")
addTicket("New", "2024-02-25", "Medium", "Email configuration problem", "Eva White", "Email", "David Green")
addTicket("In Progress", "2024-02-28", "Low", "Security software update required", "Frank Black", "Security", "Grace Davis")
addTicket("Closed", "2024-03-03", "High", "POS system error", "Henry Gray", "Point of Sale", "Isabel Martinez")
addTicket("In Progress", "2024-03-12", "Medium", "Account access issue", "Liam Brown", "Accounts", "Mary Robinson")
addTicket("New", "2024-03-08", "Low", "Monitor flickering", "Jack Wilson", "Hardware", "Kelly Thompson")
addTicket("Closed", "2024-03-16", "High", "Server outage", "Nina Taylor", "Infrastructure", "Oliver Miller")
addTicket("New", "2024-03-21", "Medium", "Software crash", "Paul Anderson", "Software", "Quinn Turner")
addTicket("In Progress", "2024-03-26", "Low", "Printer paper jam", "Rachel Baker", "Hardware", "Samuel Adams")
addTicket("Closed", "2024-04-01", "High", "Data backup failure", "Tina Campbell", "Backup", "Victor White")
*/

let names = ['walmart']

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.listen(3000, () => {
    console.log("Listening on port 3000");
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
    
});

