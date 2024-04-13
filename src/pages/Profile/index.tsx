import React, { ChangeEvent, useCallback, useRef } from 'react';
import { FiMail, FiUser, FiLock, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import noAvatarImg from '../../assets/no-avatar.jpeg';

import { Container, Content, AvatarInput } from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();

  const { user, updateUser } = useAuth();

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Name required'),
          email: Yup.string()
            .required('E-mail required')
            .email('Invalid e-mail'),
          password: Yup.string(),
          password_confirmation: Yup.string().when('password', {
            is: val => !!val.length,
            then: Yup.string().equals(
              [Yup.ref('password')],
              'Passwords must match',
            ),
          }),
          old_password: Yup.string().when('password', {
            is: val => !!val.length,
            then: Yup.string().required('Current password required'),
          }),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          password,
          password_confirmation,
          old_password,
        } = data;

        const formData = {
          name,
          email,
          ...(password
            ? { password, password_confirmation, old_password }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        addToast({
          type: 'success',
          title: 'Profile updated!',
          description: 'Your profile information was successfully updated.',
        });

        history.push('/dashboard');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Profile update error',
          description: 'An error happend, try again.',
        });
      }
    },
    [addToast, history, updateUser],
  );

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.item(0);

      if (file) {
        const data = new FormData();

        data.append('avatar', file);
        api.patch('users/avatar', data).then(response => {
          updateUser(response.data);

          addToast({
            type: 'success',
            title: 'Avatar updated',
          });
        });
      }
    },
    [addToast, updateUser],
  );

  return (
    <Container>
      <header>
        <div>
          <Link to="dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>
      <Content>
        <Form
          ref={formRef}
          initialData={{
            name: user.name,
            email: user.email,
          }}
          onSubmit={handleSubmit}
        >
          <AvatarInput>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
                <img src={noAvatarImg} alt={user.name} />
              )}

            <label htmlFor="avatar">
              <FiCamera />
              <input
                type="file"
                id="avatar"
                data-testid="input-avatar"
                onChange={handleAvatarChange}
              />
            </label>
          </AvatarInput>

          <h1>My profile</h1>

          <Input name="name" icon={FiUser} placeholder="Name" />
          <Input name="email" icon={FiMail} placeholder="E-mail" />

          <Input
            name="password"
            containerStyle={{ marginTop: 24 }}
            icon={FiLock}
            type="password"
            placeholder="New password"
          />
          <Input
            name="password_confirmation"
            icon={FiLock}
            type="password"
            placeholder="Confirmation password"
          />
          <Input
            name="old_password"
            icon={FiLock}
            type="password"
            placeholder="Current password"
          />

          <Button type="submit">Confirm</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;
