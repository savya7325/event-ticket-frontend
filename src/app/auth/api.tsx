
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api'; // backend URL

// // Register user/admin (same route, backend decides role)
// export const register = async (userData: any) => {
//   const response = await axios.post(`${API_URL}/users/register`, userData);
//   return response.data;
// };

// // Login user/admin
// export const login = async (credentials: any) => {
//   const response = await axios.post(`${API_URL}/users/login`, credentials);
//   return response.data;
// };

// // Logout (frontend just clears token)
// export const logout = () => {
//   localStorage.removeItem('user');
// };


// export const getEvents = async () => {
//   const response = await axios.get(`${API_URL}/events`);
//   return response.data;
// };

// // Create a new event (admin only, requires token)
// export const createEvent = async (eventData: any, token: string) => {
//   const response = await axios.post(`${API_URL}/events`, eventData, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };


import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // backend URL

// Configure axios to handle errors consistently
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass through the error for handling in components
    return Promise.reject(error);
  }
);

// Register user/admin (same route, backend decides role)
export const register = async (userData: any) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error: any) {
    // Re-throw with error structure intact for Formik
    throw error;
  }
};

// Login user/admin
export const login = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  } catch (error: any) {
    // Re-throw with error structure intact for Formik
    throw error;
  }
};

// Logout (frontend just clears token)
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get all events
export const getEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Get single event by ID
export const getEventById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Create a new event (admin only, requires token)
export const createEvent = async (eventData: any, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // For file uploads
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Update an event (admin only)
export const updateEvent = async (id: string, eventData: any, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Delete an event (admin only)
export const deleteEvent = async (id: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Book tickets for an event
export const bookTickets = async (eventId: string, bookingData: any, token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/events/${eventId}/book`, 
      bookingData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};