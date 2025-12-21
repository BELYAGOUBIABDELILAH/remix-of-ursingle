import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// MapPage now redirects to /carte for unified map experience
const MapPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/carte', { replace: true });
  }, [navigate]);

  return null;
};

export default MapPage;
