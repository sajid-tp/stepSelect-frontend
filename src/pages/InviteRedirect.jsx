import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

export const REFERRAL_STORAGE_KEY = "stepselect_referral";

function InviteRedirect() {
  const { token } = useParams();

  useEffect(() => {
    try {
      if (token) sessionStorage.setItem(REFERRAL_STORAGE_KEY, token);
    } catch {
    }
  }, [token]);

  return <Navigate to={`/signup?ref=${encodeURIComponent(token || "")}`} replace />;
}

export default InviteRedirect;
