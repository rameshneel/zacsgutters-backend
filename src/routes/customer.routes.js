
import express from 'express';
import { checkAvailability, getcustomerBooking } from '../controllers/customer.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
// import { validateCheckAvailability } from '../validators/bookingValidators.js';

const router = express.Router();

router.post('/check-availability', checkAvailability);
router.get('/',verifyJWT, getcustomerBooking);

export default router;