import React from 'react';
import { useParams } from 'react-router-dom';

export const LaptopForm: React.FC = () => {
  const { id } = useParams();
  return <div style={{ padding: '20px' }}><h1>{id ? 'Edit' : 'New'} Laptop</h1></div>;
};
