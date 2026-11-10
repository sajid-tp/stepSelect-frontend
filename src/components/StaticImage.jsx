import { useState } from "react";

function StaticImage({ src, alt = "", label, className = "", fallbackClassName = "bg-[#f2f2f2]" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt || label}
        className={`flex items-center justify-center text-sm font-semibold text-gray-400 ${fallbackClassName} ${className}`}
      >
        {label}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export default StaticImage;
