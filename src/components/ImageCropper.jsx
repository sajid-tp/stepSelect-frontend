import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";

const ImageCropper = ({
  image,
  onCancel,
  onApply,
  loading = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || processing || loading) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const croppedFile = await getCroppedImg(
        image,
        croppedAreaPixels,
        1000,
        1000
      );

      await onApply(croppedFile);
    } catch (error) {
      console.error("IMAGE CROP ERROR:", error);
      setError("Failed to crop this image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = loading || processing;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Crop Image
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Adjust the image before uploading. The final image will be 1000 × 1000 px.
          </p>
        </div>

        <div className="relative h-[500px] bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              Zoom
            </span>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              disabled={isLoading}
              className="flex-1 accent-[#ff5722]"
            />

            <span className="w-12 text-right text-sm text-slate-500">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!croppedAreaPixels || isLoading}
              className="rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#f4511e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Applying..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
