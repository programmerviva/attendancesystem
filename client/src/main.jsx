import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Ensure BrowserRouter is outside AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </AuthProvider>
    </BrowserRouter>
);