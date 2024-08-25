const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/money_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Define transaction schema
const transactionSchema = new mongoose.Schema({
    amount: Number,
    description: String
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Body parser middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Get all transactions
app.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching transactions');
    }
});

// Get balance
app.get('/balance', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        res.json(balance);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching balance');
    }
});

// Add transaction
app.post('/transaction', async (req, res) => {
    const { amount, description } = req.body;
    const newTransaction = new Transaction({ amount, description });
    try {
        await newTransaction.save();
        res.status(201).send('Transaction added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding transaction');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
