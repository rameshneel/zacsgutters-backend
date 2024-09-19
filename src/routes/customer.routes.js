
import express from 'express';
import { deleteCustomerById, getcustomerBooking, getCustomerById } from '../controllers/customer.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
// import { validateCheckAvailability } from '../validators/bookingValidators.js';

const router = express.Router();

router.get('/',verifyJWT, getcustomerBooking);
router.get('/:id', getCustomerById);
router.delete('/:id', deleteCustomerById);

export default router;