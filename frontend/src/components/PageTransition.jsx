import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setShow(false);
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setShow(true);
    }, 80);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Show immediately on first render
  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {displayChildren}
    </div>
  );
}
