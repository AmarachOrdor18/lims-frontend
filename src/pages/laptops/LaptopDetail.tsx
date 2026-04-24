import React from 'react';
import { useParams } from 'react-router-dom';

export const LaptopDetail: React.FC = () => {
  const { id } = useParams();
  return <div style={{ padding: '20px' }}><h1>Laptop {id}</h1></div>;
};
