import multer from "multer";

const storage = multer.memoryStorage();

console.log("multer storage logged");

export const Singleupload = multer({ storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "Pimage", maxCount: 1 },
]);
