import api from './api';

export const getServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/services/categories');
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await api.post('/services', serviceData);
  return response.data;
};

export const updateService = async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
