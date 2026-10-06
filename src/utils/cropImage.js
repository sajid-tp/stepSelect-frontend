const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image for cropping."));

    // Selected local files are blob URLs. They do not need CORS.
    if (!url.startsWith("blob:")) {
      image.crossOrigin = "anonymous";
    }

    image.src = url;
  });

const getCroppedImg = async (
  imageSrc,
  pixelCrop,
  outputWidth = 1000,
  outputHeight = 1000
) => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create canvas context.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputWidth, outputHeight);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Could not create cropped image."));
          return;
        }

        resolve(result);
      },
      "image/jpeg",
      0.9
    );
  });

  return new File([blob], `product-image-${Date.now()}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

export { getCroppedImg };
