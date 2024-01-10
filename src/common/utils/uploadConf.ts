import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
export const storage = (subFolder: string) => {
  return {
    storage: diskStorage({
      destination: `./uploads/${subFolder}`,
      filename: (req, file, cb) => {
        const filename: string =
          file.originalname.split('.').pop().replace(/\s/g, '_') + uuidv4();
        const extension: string = file.originalname.split('.').pop();

        cb(null, `${filename}.${extension}`);
      },
    }),
  };
};
