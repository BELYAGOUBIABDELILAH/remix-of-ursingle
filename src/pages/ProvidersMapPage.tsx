import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ProvidersMapPage now redirects to /carte for unified map experience
const ProvidersMapPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/carte', { replace: true });
  }, [navigate]);

  return null;
};

export default ProvidersMapPage;
