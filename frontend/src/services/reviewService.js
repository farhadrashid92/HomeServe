import api from './api';

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const getServiceReviews = async (serviceId) => {
  const response = await api.get(`/reviews/service/${serviceId}`);
  return response.data;
};

export const getProviderReviews = async (providerId) => {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await api.get('/reviews/me');
  return response.data;
};
