import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

let authToken: string | null = null;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  config => {
    const token = authToken || Cookies.get('grupo_hemmy_auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  },
  error => {
  return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Error de autenticación
      if (error.response.status === 401) {
      authToken = null;
      Cookies.remove('grupo_hemmy_auth');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      }

      // Mostrar mensaje de error
      const errorMessage = error.response.data?.message || 'Ha ocurrido un error';
      toast.error(errorMessage);
    } else {
      toast.error('Error de conexión con el servidor');
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
