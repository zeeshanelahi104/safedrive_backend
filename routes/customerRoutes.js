const express = require('express');
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const router = express.Router();

// @route GET /customers
// @desc Get all customers
router.get('/', getCustomers);

// @route GET /customers/:id
// @desc Get a single customer by ID
router.get('/:id', getCustomerById);

// @route POST /customers
// @desc Create a new customer
router.post('/', createCustomer);

// @route PUT /customers/:id
// @desc Update an existing customer
router.put('/:id', updateCustomer);

// @route DELETE /customers/:id
// @desc Delete a customer
router.delete('/:id', deleteCustomer);

module.exports = router;
