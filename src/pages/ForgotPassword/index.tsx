import React, { useCallback, useRef, useState } from 'react';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';

import logoImage from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import api from '../../services/api';

import { Container, Content, AnimationContainer, Background } from './styles';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const handleSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        setLoading(true);

        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail required')
            .email('Invalid e-mail'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/passwords/forgot', {
          email: data.email,
        });

        addToast({
          type: 'success',
          title: 'Recovery e-mail sended.',
          description:
            'We sent an e-mail to complete the password recovery process.',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Password recovery error',
          description: 'An error happened on the password recovery.',
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImage} alt="GoBarber" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Forgot password</h1>

            <Input name="email" icon={FiMail} placeholder="E-mail" />

            <Button loading={loading} type="submit">
              Confirm
            </Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
            Go back
          </Link>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
};

export default ForgotPassword;
