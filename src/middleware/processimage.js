import sharp from "sharp";

const compressImage = async (file) => {
  console.log("compressimage logged");
  return await sharp(file.buffer)
    .resize(800, 800, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();
};

const processImages = async (req, res, next) => {
  if (!req.files) return next();
  try {
    const fileKeys = Object.keys(req.files);
    const compressPromises = fileKeys.map(async (key) => {
      const fileArray = req.files[key];
      const compressArray = fileArray.map(async (file) => {
        file.buffer = await compressImage(file);
        return file;
      });
      await Promise.all(compressArray);
    });
    await Promise.all(compressPromises);
    next();
  } catch (err) {
    next(err);
  }
};

export default processImages;
