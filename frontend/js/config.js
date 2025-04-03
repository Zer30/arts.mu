export const API_BASE_URL = 'http://localhost:5000/api';

export const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
      ...options,
      headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
      }
  });
}