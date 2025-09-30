// src/services/api.js
const API_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("token") || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  async request(path, options = {}) {
    const url = API_URL + path;
    const headers = options.headers || {};
    // Default to JSON
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const opts = {
      credentials: 'include',
      ...options,
      headers,
    };

    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    try {
      if (text) data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    if (!res.ok) {
      const message = (data && data.message) || res.statusText || 'Error en la petición';
      throw new Error(message);
    }
    return data;
  }

  // Authentication
  async login({ username, password }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // Expecting { token, user }
    if (data.token) this.setToken(data.token);
    return data;
  }

  async register({ username, password, name, area }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, area }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      // Try to notify backend (optional)
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore backend errors on logout
    } finally {
      this.clearToken();
    }
  }

  // Expedientes
  async getExpedientes(filters = {}) {
    // filters can be string (query) or object
    let queryString = '';
    if (typeof filters === 'string') {
      queryString = filters;
    } else if (typeof filters === 'object' && Object.keys(filters).length) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, v);
      });
      queryString = params.toString();
    }
    if (queryString) queryString = '?' + queryString;
    return this.request(`/expedientes${queryString}`, { method: 'GET' });
  }

  async createExpediente(expediente) {
    return this.request('/expedientes', {
      method: 'POST',
      body: JSON.stringify(expediente),
    });
  }

  async transferExpediente(id, data) {
    return this.request(`/expedientes/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiService = new ApiService();
export default apiService;
