declare namespace Express {
  interface Request {
    user?: {
      _id: string;
      email: string;
      name: string;
      role: string;
    };
    fileUrl?: string;
  }

  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer: Buffer;
    }
  }
} 