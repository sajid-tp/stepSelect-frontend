import { useState } from "react";

/*
  A picture that lives in /public/images (a fixed image, not from the database).
  If the file is missing or fails to load, a plain panel with the label shows
  instead of the browser's broken-image icon.
*/
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
