import { diskStorage } from 'multer';
import { resolve, extname } from 'path';
import { randomBytes } from 'crypto';

export const multerStorage = diskStorage({
  destination: resolve(__dirname, '..', '..', '..', '..', 'temp', 'avatar'),
  filename: (req, file, callback) => {
    randomBytes(16, (err, res) => {
      if (err) return callback(err, '');

      return callback(null, res.toString('hex') + extname(file.originalname));
    });
  },
});
