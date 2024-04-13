import styled from 'styled-components';
import { shade } from 'polished';

export const Container = styled.div`
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    margin-top: 150px;
    color: #ff9000;
  }

  a {
    color: #f4ede8;
    display: block;
    margin-top: 150px;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: ${shade(0.2, '#f4ede8')};
    }

    display: flex;
    align-items: center;

    svg {
      margin-right: 16px;
    }
  }
`;
