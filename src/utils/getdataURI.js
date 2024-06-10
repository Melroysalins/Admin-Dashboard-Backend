import Datauriparser from "datauri/parser.js";
import path from "path";

const getdataURI = (file) => {
  const parser = new Datauriparser();

  const extensionName = path.extname(file?.originalname);

  return parser.format(extensionName, file.buffer).content;
};

export default getdataURI;
