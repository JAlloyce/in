/**
 * OCR Service with Lazy Loading for Performance Optimization
 * Tesseract.js is only loaded when actually needed for text extraction
 */

let TesseractWorker = null;

const initializeTesseract = async () => {
  if (TesseractWorker) return TesseractWorker;
  
  try {
    // Dynamically import Tesseract.js only when needed
    const { createWorker } = await import('tesseract.js');
    
    TesseractWorker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    return TesseractWorker;
  } catch (error) {
    console.error('Failed to initialize Tesseract worker:', error);
    throw new Error('OCR initialization failed');
  }
};

const ocrService = {
  // Check if a file is an image that can be processed by OCR
  isImageFile(file) {
    if (!file || !file.type) return false;
    return file.type.startsWith('image/') && 
           ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'].includes(file.type);
  },

  // Extract text from image file with lazy loading
  async extractTextFromImage(file, options = {}) {
    if (!this.isImageFile(file)) {
      return {
        success: false,
        error: 'File is not a supported image format',
        text: ''
      };
    }

    try {
      // Initialize Tesseract worker only when needed
      const worker = await initializeTesseract();
      
      const { data: { text, confidence } } = await worker.recognize(file, {
        rectangles: options.rectangles,
        ...options
      });

      return {
        success: true,
        text: text.trim(),
        confidence: confidence,
        error: null
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to extract text from image',
        text: '',
        confidence: 0
      };
    }
  },

  // Extract text from multiple images in parallel
  async extractTextFromImages(files, options = {}) {
    const imageFiles = files.filter(file => this.isImageFile(file));
    
    if (imageFiles.length === 0) {
      return {
        success: false,
        error: 'No valid image files provided',
        results: []
      };
    }

    try {
      // Process all images in parallel for better performance
      const promises = imageFiles.map(async (file, index) => {
        const result = await this.extractTextFromImage(file, options);
        return {
          fileIndex: index,
          fileName: file.name,
          ...result
        };
      });

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      
      return {
        success: successful.length > 0,
        results: results,
        totalProcessed: results.length,
        successfulExtractions: successful.length,
        combinedText: successful.map(r => r.text).join('\n\n')
      };
    } catch (error) {
      console.error('Batch OCR extraction failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to process images',
        results: []
      };
    }
  },

  // Clean up resources when done
  async cleanup() {
    if (TesseractWorker) {
      try {
        await TesseractWorker.terminate();
        TesseractWorker = null;
        console.log('OCR worker terminated successfully');
      } catch (error) {
        console.error('Failed to terminate OCR worker:', error);
      }
    }
  },

  // Get supported image formats
  getSupportedFormats() {
    return [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
  },

  // Validate file size and type before processing
  validateFile(file, maxSizeMB = 10) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.isImageFile(file)) {
      return { valid: false, error: 'File must be an image' };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true, error: null };
  }
};

// Clean up when the page is unloaded to free memory
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    ocrService.cleanup();
  });
}

export default ocrService; 