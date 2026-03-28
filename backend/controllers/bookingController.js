import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { sendPushNotification } from '../services/pushService.js';

// @desc    Create new booking (auto-extracts provider from service)
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  try {
    const { service: serviceId, date, time, address, notes, provider } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const resolvedProvider = provider || (service.providers && service.providers.length > 0 ? service.providers[0] : service.provider);
    
    if (!resolvedProvider) {
       return res.status(400).json({ message: 'No provider available for this service request' });
    }

    const booking = new Booking({
      user: req.user._id,
      provider: resolvedProvider,
      service: serviceId,
      date,
      time,
      address,
      notes,
    });

    const createdBooking = await booking.save();

    // Return populated booking so dashboard can display immediately
    const populated = await Booking.findById(createdBooking._id)
      .populate('service', 'title price category')
      .populate('provider', 'name profileImage phone pushSubscriptions')
      .populate('user', 'name email');

    // Silent Push Notification firing targeting mapped endpoints
    if (populated.provider.pushSubscriptions?.length > 0) {
      const pushTitle = 'New Booking Request!';
      const pushBody = `${populated.user.name} requested ${populated.service.title} on ${date} at ${time}.`;
      populated.provider.pushSubscriptions.forEach(sub => {
        sendPushNotification(sub, { title: pushTitle, body: pushBody, url: '/provider-dashboard' })
          .catch(e => console.log('Push failed:', e.message)); // Swallow errors to prevent blocking
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get bookings (filtered by role automatically)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user._id;
    }
    // admin gets all — no filter

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('provider', 'name profileImage phone')
      .populate('service', 'title price category');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('provider', 'name profileImage phone')
      .populate('service', 'title price category');

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider updates status; customer can cancel)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const allowed = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    const updated = await booking.save();

    // Return populated so frontend can re-render without refetch
    const populated = await Booking.findById(updated._id)
      .populate('user', 'name email phone pushSubscriptions')
      .populate('provider', 'name profileImage phone')
      .populate('service', 'title price category');

    // Notify the Customer that the state of their booking changed
    if (populated.user.pushSubscriptions?.length > 0) {
       const pushTitle = `Booking Status Update: ${status.toUpperCase()}`;
       const pushBody = `Your ${populated.service.title} booking has been marked as ${status} by ${populated.provider.name}.`;
       populated.user.pushSubscriptions.forEach(sub => {
         sendPushNotification(sub, { title: pushTitle, body: pushBody, url: '/dashboard' })
           .catch(e => console.log('Push failed:', e.message));
       });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get available slots for a provider on a specific date
// @route   GET /api/bookings/available-slots
// @access  Private (Customer & Provider)
export const getAvailableSlots = async (req, res) => {
  try {
    const { providerId, date } = req.query;

    if (!providerId || !date) {
      return res.status(400).json({ message: 'providerId and date are required' });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Determine the day of the week
    const targetDate = new Date(date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[targetDate.getDay()];

    // Get the base availability for that day
    const baseSlots = provider.availability?.get(dayOfWeek) || [];

    if (baseSlots.length === 0) {
      return res.json({ availableSlots: [] });
    }

    // Fetch active bookings for this provider on this specific date
    const activeBookings = await Booking.find({
      provider: providerId,
      date: date,
      status: { $in: ['pending', 'accepted', 'in-progress'] }
    });

    const bookedTimes = activeBookings.map(b => b.time);

    // Subtract booked times from base available slots
    const availableSlots = baseSlots.filter(time => !bookedTimes.includes(time));

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
