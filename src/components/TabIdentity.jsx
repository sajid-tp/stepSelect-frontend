import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function TabIdentity() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

    document.title = isAdmin ? "Step Select Admin" : "Step Select";

    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      document.head.appendChild(icon);
    }
    icon.setAttribute("href", isAdmin ? "/favicon-admin.svg" : "/favicon.svg");
  }, [pathname]);

  return null;
}

export default TabIdentity;
