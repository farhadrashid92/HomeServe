import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const updateBookingStatus = async (id, statusData) => {
  const response = await api.put(`/bookings/${id}/status`, statusData);
  return response.data;
};

export const getAvailableSlots = async (providerId, date) => {
  const response = await api.get(`/bookings/available-slots?providerId=${providerId}&date=${date}`);
  return response.data;
};
