export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) return cb(new Error('File is empty'), false);

  const fileExtension: string = file.mimetype.split('/')[1];
  const validExtensions: string[] = ['jpg', 'jpeg', 'png', 'webp'];

  if (validExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(null, false);
};
