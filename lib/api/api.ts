import axios from 'axios';

export const nextServer = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const api = axios.create({
  baseURL: 'https://notehub-api.goit.study',
  withCredentials: true,
});

