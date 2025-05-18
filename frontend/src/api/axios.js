import axios from 'axios';

// Используем публичный URL от Serveo вместо localhost
const API_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default axiosInstance; 