import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import logoImage from '../../assets/logo.svg';

import { Container } from './styles';

const ForgotPassword: React.FC = () => {
  return (
    <Container>
      <img src={logoImage} alt="GoBarber" />

      <h1>Whoops! Page not found.</h1>

      <Link to="/">
        <FiArrowLeft />
        Go to Home
      </Link>
    </Container>
  );
};
export default ForgotPassword;
