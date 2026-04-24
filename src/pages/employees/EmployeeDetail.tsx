import React from 'react';
import { useParams } from 'react-router-dom';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  return <div style={{ padding: '20px' }}><h1>Employee {id}</h1></div>;
};
