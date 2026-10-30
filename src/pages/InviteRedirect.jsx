import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

export const REFERRAL_STORAGE_KEY = "stepselect_referral";

// /invite/:token  ->  remembers the token, then opens the signup page.
function InviteRedirect() {
  const { token } = useParams();

  useEffect(() => {
    try {
      if (token) sessionStorage.setItem(REFERRAL_STORAGE_KEY, token);
    } catch {
      /* storage blocked: the ?ref= in the URL still carries the token */
    }
  }, [token]);

  return <Navigate to={`/signup?ref=${encodeURIComponent(token || "")}`} replace />;
}

export default InviteRedirect;
