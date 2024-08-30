const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// @route GET /customers
// @desc Get all customers
router.get('/', customerController.getCustomers);

// @route GET /customers/:id
// @desc Get a single customer by ID
router.get('/:id', customerController.getCustomerById);

// @route POST /customers
// @desc Create a new customer
router.post('/', customerController.createCustomer);

// @route PUT /customers/:id
// @desc Update an existing customer
router.put('/:id', customerController.updateCustomer);

// @route DELETE /customers/:id
// @desc Delete a customer
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
