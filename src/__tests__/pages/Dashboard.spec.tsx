import React from 'react';
import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import Dashboard from '../../pages/Dashboard';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      signOut: jest.fn(),
      user: {
        id: 'user-id',
        name: 'Daniel B.',
        email: 'danielynx@example.com',
        avatar_url: 'image.jpg',
      },
    }),
  };
});

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

apiMock.onGet('/providers/user-id/month-availability').reply(200, []);

apiMock
  .onGet('/appointments/me', {
    yearn: '2020',
    month: '11',
    day: '26',
  })
  .reply(200, [
    {
      id: 'appointment-1',
      date: '2020-11-26T14:00:00.000Z',
      hourFormatted: '10:00',
      user: {
        name: 'John Doe',
        email: 'johndoe@mail.com',
      },
    },
    {
      id: 'appointment-2',
      date: '2020-11-26T15:00:00.000Z',
      hourFormatted: '11:00',
      user: {
        name: 'Baby Doe',
        email: 'babydoe@mail.com',
      },
    },
    {
      id: 'appointment-3',
      date: '2020-11-26T20:00:00.000Z',
      hourFormatted: '16:00',
      user: {
        name: 'Richard Roe',
        email: 'richardroe@mail.com',
      },
    },
  ]);

describe('Dashboard Page', () => {
  it('should be able see the next appointment', async () => {
    render(<Dashboard />);

    const container = await screen.findByTestId('next-appointment');

    expect(container).toHaveTextContent('John Doe');
    expect(container).toHaveTextContent('10:00');
    expect(container).not.toHaveTextContent('Baby Doe');
    expect(container).not.toHaveTextContent('11:00');
    expect(container).not.toHaveTextContent('Richard Roe');
    expect(container).not.toHaveTextContent('16:00');
  });

  it('should be able see the morning appointment', async () => {
    render(<Dashboard />);

    const container = await screen.findByTestId('morning-appointment');

    expect(container).toHaveTextContent('John Doe');
    expect(container).toHaveTextContent('10:00');
    expect(container).toHaveTextContent('Baby Doe');
    expect(container).toHaveTextContent('11:00');
    expect(container).not.toHaveTextContent('Richard Roe');
    expect(container).not.toHaveTextContent('16:00');
  });

  it('should be able see the morning appointment', async () => {
    render(<Dashboard />);

    const container = await screen.findByTestId('afternoon-appointment');

    expect(container).not.toHaveTextContent('John Doe');
    expect(container).not.toHaveTextContent('10:00');
    expect(container).not.toHaveTextContent('Baby Doe');
    expect(container).not.toHaveTextContent('11:00');
    expect(container).toHaveTextContent('Richard Roe');
    expect(container).toHaveTextContent('16:00');
  });
});
