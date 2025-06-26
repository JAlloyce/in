/**
 * OCR Service for text extraction from images and documents
 * Uses Tesseract.js for client-side OCR processing
 */

// Dynamic import to avoid SSR issues
let Tesseract = null;

const initTesseract = async () => {
  if (!Tesseract) {
    try {
      const tesseractModule = await import('tesseract.js');
      Tesseract = tesseractModule.default;
    } catch (error) {
      console.error('Failed to load Tesseract.js:', error);
      throw new Error('OCR functionality not available');
    }
  }
  return Tesseract;
};

class OCRService {
  constructor() {
    this.isInitialized = false;
    this.workers = new Map();
  }

  /**
   * Initialize OCR service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await initTesseract();
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  /**
   * Extract text from image file
   */
  async extractTextFromImage(file, options = {}) {
    await this.initialize();
    
    if (!this.isImageFile(file)) {
      throw new Error('File must be an image (PNG, JPG, JPEG, BMP, GIF)');
    }

    const workerId = `worker_${Date.now()}`;
    
    try {
      console.log(`Starting OCR for file: ${file.name} (${file.size} bytes)`);
      
      // Create worker
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (options.onProgress) {
            options.onProgress({
              status: m.status,
              progress: m.progress || 0,
              message: m.status === 'recognizing text' ? 'Extracting text...' : m.status
            });
          }
        }
      });

      this.workers.set(workerId, worker);

      // Process image
      const result = await worker.recognize(file, {
        rectangle: options.rectangle || undefined,
        ppi: options.ppi || 300
      });

      // Clean up worker
      await worker.terminate();
      this.workers.delete(workerId);

      // Process and clean text
      const extractedText = this.cleanExtractedText(result.data.text);
      
      console.log(`OCR completed. Extracted ${extractedText.length} characters`);

      return {
        success: true,
        text: extractedText,
        confidence: result.data.confidence,
        blocks: result.data.blocks?.map(block => ({
          text: block.text,
          confidence: block.confidence,
          bbox: block.bbox
        })) || [],
        processingTime: result.data.time || 0
      };

    } catch (error) {
      console.error('OCR processing failed:', error);
      
      // Clean up worker on error
      if (this.workers.has(workerId)) {
        try {
          await this.workers.get(workerId).terminate();
        } catch (e) {
          console.error('Failed to terminate worker:', e);
        }
        this.workers.delete(workerId);
      }

      return {
        success: false,
        text: '',
        confidence: 0,
        blocks: [],
        error: error.message || 'OCR processing failed'
      };
    }
  }

  /**
   * Extract text from PDF (first few pages)
   */
  async extractTextFromPDF(file, options = {}) {
    try {
      // For PDFs, we'll convert first page to image and then OCR
      const canvas = await this.pdfToCanvas(file, options.pageNumber || 1);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.8);
      });

      // Create file from blob
      const imageFile = new File([blob], `${file.name}_page_${options.pageNumber || 1}.png`, {
        type: 'image/png'
      });

      return await this.extractTextFromImage(imageFile, options);

    } catch (error) {
      console.error('PDF OCR processing failed:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        blocks: [],
        error: 'PDF processing failed. Please convert to image first.'
      };
    }
  }

  /**
   * Convert PDF page to canvas (simplified version)
   */
  async pdfToCanvas(file, pageNumber = 1) {
    // This is a placeholder for PDF processing
    // In a real implementation, you'd use PDF.js
    throw new Error('PDF processing requires PDF.js library. Please upload images instead.');
  }

  /**
   * Check if file is a supported image format
   */
  isImageFile(file) {
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type.toLowerCase());
  }

  /**
   * Check if file is a PDF
   */
  isPDFFile(file) {
    return file.type === 'application/pdf';
  }

  /**
   * Clean and format extracted text
   */
  cleanExtractedText(rawText) {
    if (!rawText) return '';

    return rawText
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove strange characters
      .replace(/[^\w\s\.,!?;:()\-'"]/g, '')
      // Fix common OCR mistakes
      .replace(/\b0\b/g, 'O') // Zero to O
      .replace(/\b1\b/g, 'I') // One to I in some contexts
      // Trim and clean
      .trim();
  }

  /**
   * Get supported file types
   */
  getSupportedTypes() {
    return {
      images: ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif', 'image/webp'],
      documents: ['application/pdf']
    };
  }

  /**
   * Validate file for OCR processing
   */
  validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB default
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (!this.isImageFile(file) && !this.isPDFFile(file)) {
      errors.push('File must be an image (PNG, JPG, JPEG, BMP, GIF, WebP) or PDF');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if file is valid for OCR processing (alias for validateFile)
   */
  isValidFile(file, maxSize = 10 * 1024 * 1024) {
    const validation = this.validateFile(file, maxSize);
    return validation.valid;
  }

  /**
   * Cleanup all workers
   */
  async cleanup() {
    const cleanupPromises = Array.from(this.workers.values()).map(async worker => {
      try {
        await worker.terminate();
      } catch (error) {
        console.error('Error terminating worker:', error);
      }
    });

    await Promise.all(cleanupPromises);
    this.workers.clear();
    console.log('OCR Service cleaned up');
  }
}

// Export singleton instance
const ocrService = new OCRService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    ocrService.cleanup();
  });

  // Add test method to window
  window.testOCR = async (file) => {
    if (!file) {
      console.log('Usage: testOCR(imageFile)');
      return;
    }
    
    const result = await ocrService.extractTextFromImage(file, {
      onProgress: (progress) => console.log('OCR Progress:', progress)
    });
    
    console.log('OCR Result:', result);
    return result;
  };
}

export default ocrService; 