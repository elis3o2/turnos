import { useContext, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contex';

const PrivateRoute = ({ children }: { children: ReactElement }): ReactElement | null => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authTokens) {
      navigate('/login', { replace: true }); // ← se ejecuta post-mount, basename ya activo
    }
  }, [authTokens, navigate]);

  if (!authTokens) return null; // ← no renderiza nada mientras redirige

  return children;
};

export default PrivateRoute;