import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UATList from '../Components/Testing/UAT/UATList';
import UATForm from '../Components/Testing/UAT/UATForm';
import UATDetail from '../Components/Testing/UAT/UATDetail';

const UATRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UATList />} />
      <Route path="/new" element={<UATForm />} />
      <Route path="/:id" element={<UATDetail />} />
      <Route path="/:id/edit" element={<UATForm />} />
    </Routes>
  );
};

export default UATRoutes;
