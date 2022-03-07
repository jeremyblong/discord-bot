const express = require('express');
const router = express.Router();
const { Connection } = require("../mongoUtil.js");
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')('pk_live_CUQtlpQUF0vufWpnpUmQvcdi');


router.get('/', async (req, res) => {

    const {} = req.query;

    const customers = await stripe.customers.list({
        limit: 100,
    });

    console.log("Customers", customers);
});

module.exports = router;