// 'use client';

// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext'; 

// export default function AuthPage() {
//   const { user, login, register, logout } = useAuth();
//   const [form, setForm] = useState({
//      username: '',
//     email: '',
//     password: '',
//     role: 'user',
//     adminSecret: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (user) {
//         logout();
//       } else {
//         if (form.role === 'admin') {
//           await register(form); // admin registration
//         } else {
//           await login({ email: form.email, password: form.password });
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       {user ? <p>Logged in as {user.username} ({user.role})</p> : <p>Not logged in</p>}
//       <form onSubmit={handleSubmit}>
//         {!user && form.role === 'user' && (
//           <>
//             <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
//             <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
//             <button type="submit">Login</button>
//           </>
//         )}
//         {!user && form.role === 'admin' && (
//           <>
//             <input name="username" placeholder="Name" value={form.username} onChange={handleChange} />
//             <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
//             <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
//             <input name="adminSecret" placeholder="Admin Secret" value={form.adminSecret} onChange={handleChange} />
//             <button type="submit">Register Admin</button>
//           </>
//         )}
//       </form>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

// Validation Schemas
const loginValidationSchema = Yup.object({
  email: Yup.string()
    .required('Please enter your email')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters')
});

const adminRegisterValidationSchema = Yup.object({
  username: Yup.string()
    .required('Please enter your name')
    .min(3, 'Name must be at least 3 characters'),
  email: Yup.string()
    .required('Please enter your email')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters'),
  adminSecret: Yup.string()
    .required('Please enter admin secret key')
});

export default function AuthPage() {
  const { user, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'user' | 'admin'>('user');

  const loginInitialValues = {
    email: '',
    password: ''
  };

  const adminRegisterInitialValues = {
    username: '',
    email: '',
    password: '',
    role: 'admin',
    adminSecret: ''
  };

  const handleLoginSubmit = async (values: any, { setSubmitting, setErrors }: any) => {
    try {
      await login({ email: values.email, password: values.password });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle backend validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const formikErrors: any = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.field) {
            formikErrors[error.field] = error.message;
          }
        });
        setErrors(formikErrors);
      } else {
        setErrors({ 
          email: err.response?.data?.message || 'Login failed. Please try again.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminRegisterSubmit = async (values: any, { setSubmitting, setErrors }: any) => {
    try {
      await register(values);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle backend validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const formikErrors: any = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.field) {
            formikErrors[error.field] = error.message;
          }
        });
        setErrors(formikErrors);
      } else {
        setErrors({ 
          email: err.response?.data?.message || 'Registration failed. Please try again.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-2">
            Logged in as <strong>{user.username}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-6">Role: {user.role}</p>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Toggle Buttons */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setAuthMode('user')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              authMode === 'user'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('admin')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              authMode === 'admin'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Register
          </button>
        </div>

        {/* User Login Form */}
        {authMode === 'user' && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">User Login</h2>
            <Formik
              initialValues={loginInitialValues}
              validationSchema={loginValidationSchema}
              onSubmit={handleLoginSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.password && touched.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}

        {/* Admin Registration Form */}
        {authMode === 'admin' && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Admin Registration</h2>
            <Formik
              initialValues={adminRegisterInitialValues}
              validationSchema={adminRegisterValidationSchema}
              onSubmit={handleAdminRegisterSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Field
                      name="username"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.username && touched.username
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your name"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.password && touched.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Admin Secret Field */}
                  <div>
                    <label htmlFor="adminSecret" className="block text-sm font-medium mb-1">
                      Admin Secret Key
                    </label>
                    <Field
                      name="adminSecret"
                      type="password"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.adminSecret && touched.adminSecret
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter admin secret key"
                    />
                    <ErrorMessage
                      name="adminSecret"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Admin'}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </div>
    </div>
  );
}