import api from './api';

export const getAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminServices = async () => {
  const response = await api.get('/admin/services');
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/admin/services/${id}`);
  return response.data;
};

export const getAdminBookings = async () => {
  const response = await api.get('/admin/bookings');
  return response.data;
};
