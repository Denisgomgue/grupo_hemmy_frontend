import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let authToken: string | null = null;

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  } else {
    const cookieToken = Cookies.get('grupo_hemmy_auth');
    if (cookieToken) {
      authToken = cookieToken;
      config.headers['Authorization'] = `Bearer ${cookieToken}`;
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log("Responde 401")
      // Limpiar token y cookies
      authToken = null;
      Cookies.remove('grupo_hemmy_auth');

      // Redirigir al usuario a /login solo en el cliente
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    authToken = token;
    Cookies.set('grupo_hemmy_auth', token, { expires: 7, secure: true, sameSite: 'Strict', path: '/' });
  } else {
    authToken = null;
    Cookies.remove('grupo_hemmy_auth');
  }
};
  
export default api;
