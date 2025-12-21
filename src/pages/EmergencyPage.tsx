import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// EmergencyPage now redirects to /carte?mode=emergency for unified map experience
const EmergencyPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/carte?mode=emergency', { replace: true });
  }, [navigate]);

  return null;
};

export default EmergencyPage;
