import { NextApiRequest, NextApiResponse } from 'next';
import { handleFileUpload, validateFileMetadata } from '../fileUpload';
import { security } from '../../config/security';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('File Upload Middleware', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('validateFileMetadata', () => {
    it('should reject request without filename', () => {
      mockReq.body = {
        contentType: 'image/jpeg',
      };

      validateFileMetadata(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing file metadata',
      });
    });

    it('should reject request without content type', () => {
      mockReq.body = {
        filename: 'test.jpg',
      };

      validateFileMetadata(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing file metadata',
      });
    });

    it('should reject invalid filename', () => {
      mockReq.body = {
        filename: 'test<script>.jpg',
        contentType: 'image/jpeg',
      };

      validateFileMetadata(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid filename',
      });
    });

    it('should reject invalid content type', () => {
      mockReq.body = {
        filename: 'test.jpg',
        contentType: 'application/javascript',
      };

      validateFileMetadata(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid content type',
      });
    });

    it('should accept valid metadata', () => {
      mockReq.body = {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      };

      validateFileMetadata(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleFileUpload', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 4,
    };

    it('should reject request without file', async () => {
      await handleFileUpload(
        mockReq as any,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No file uploaded',
      });
    });

    it('should reject request without authenticated user', async () => {
      mockReq.file = mockFile;

      await handleFileUpload(
        mockReq as any,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not authenticated',
      });
    });

    it('should handle file upload successfully', async () => {
      mockReq.file = mockFile;
      mockReq.user = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      await handleFileUpload(
        mockReq as any,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.fileUrl).toBeDefined();
    });

    it('should respect file size limits', async () => {
      mockReq.file = {
        ...mockFile,
        size: security.fileUpload.maxSize + 1,
      };
      mockReq.user = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      await handleFileUpload(
        mockReq as any,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('File too large'),
      });
    });

    it('should respect file type restrictions', async () => {
      mockReq.file = {
        ...mockFile,
        mimetype: 'application/javascript',
      };
      mockReq.user = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      await handleFileUpload(
        mockReq as any,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('File type not allowed'),
      });
    });
  });
}); 