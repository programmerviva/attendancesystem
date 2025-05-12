import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { token, loading } = useAuth();

    if (loading) {
        // You might want to render a loading spinner here
        return <div>Loading...</div>;
    }

    return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;