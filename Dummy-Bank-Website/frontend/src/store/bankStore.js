import { create } from 'zustand';
import api from '../api/axios';

const useBankStore = create((set, get) => ({
  user: (() => {
    const _s = localStorage.getItem('user');
    if (!_s) return null;
    try {
      return JSON.parse(_s);
    } catch (e) {
      console.warn('Invalid user in localStorage, clearing it', e);
      localStorage.removeItem('user');
      return null;
    }
  })(),
  balance: 0,
  transactions: [],
  contacts: [],
  isLoading: false,
  error: null,

  // Auth Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      set({ user: userData, isLoading: false });

      // Fetch initial data after login
      get().fetchInitialData();
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false
      });
      return { success: false, error: err.response?.data?.message };
    }
  },

  signup: async (name, email, password, pin) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/signup', { name, email, password, pin });
      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      set({ user: userData, isLoading: false });

      get().fetchInitialData();
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Signup failed',
        isLoading: false
      });
      return { success: false, error: err.response?.data?.message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, balance: 0, transactions: [], contacts: [] });
  },

  // Data Fetching
  fetchInitialData: async () => {
    try {
      // 1. Fetch Fresh User Data (Persistence Fix)
      const userRes = await api.get('/auth/me');
      const userData = userRes.data;

      // Update store and local storage
      set({ user: userData, contacts: userData.contacts });
      localStorage.setItem('user', JSON.stringify(userData));

      // 2. Fetch Transactions
      get().fetchTransactions();

      // 3. Fetch Contacts (redundant if /me returns them, but safe to keep or remove. /me populates them, so we are good)
      // We can rely on /me for contacts now.
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      // Fallback: If /me fails (e.g., token expired), maybe logout?
      // For now, quiet failure or use local storage data if available
    }
  },

  searchUser: async (query) => {
    try {
      const res = await api.get(`/users/search?q=${query}`);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addContact: async (contactId) => {
    try {
      await api.post('/users/add-contact', { contactId });
      // Refresh data to get updated contacts list
      get().fetchInitialData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  fetchContacts: async () => {
    try {
      const res = await api.get('/users/contacts');
      set({ contacts: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  // Note: Backend endpoint was transactions/history
  fetchTransactions: async () => {
    try {
      const res = await api.get('/transactions/history');
      set({ transactions: res.data });

      // OPTIONAL: Recalculate or fetch balance if the backend had a balance endpoint
      // For this hackathon, we used the balance from login. 
      // If we want accurate balance after refresh, we might need a dedicated endpoint or update it manually.
      // Let's rely on the user object in localStorage for now, but really we should have made a /me endpoint.
      // I'll stick to the spec.
    } catch (err) {
      console.error(err);
    }
  },

  transfer: async (recipientUpi, amount, note, pin) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/transactions/transfer', { recipientUpi, amount, note, pin });

      // Update local state
      const { balance, transaction } = res.data;
      const newBalance = balance !== undefined ? balance : transaction.balance;

      // Update user balance in store and localStorage
      const updatedUser = { ...get().user, balance: newBalance };
      set({ user: updatedUser, isLoading: false });
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Refresh transactions
      get().fetchTransactions();

      return { success: true, transaction };
    } catch (err) {
      const msg = err.response?.data?.message || 'Transfer failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  }
}));

export default useBankStore;
