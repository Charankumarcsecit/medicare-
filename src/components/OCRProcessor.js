import Tesseract from 'tesseract.js';

class OCRProcessor {
  constructor() {
    this.worker = null;
  }

  // Initialize Tesseract worker
  async initialize() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  // Process image and extract text
  async processImage(imageData) {
    try {
      await this.initialize();

      const { data: { text } } = await this.worker.recognize(imageData);
      console.log('OCR Raw Text:', text);

      return this.parseText(text);
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process image');
    }
  }

  // Parse extracted text
  parseText(text) {
    const result = {
      rawText: text,
      medicineName: null,
      expiryDate: null,
      dosage: null,
      manufacturer: null,
      batchNumber: null
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract medicine name (usually first significant line)
    result.medicineName = this.extractMedicineName(lines);

    // Extract expiry date
    result.expiryDate = this.extractExpiryDate(text);

    // Extract dosage
    result.dosage = this.extractDosage(text);

    // Extract manufacturer
    result.manufacturer = this.extractManufacturer(text);

    // Extract batch number
    result.batchNumber = this.extractBatchNumber(text);

    return result;
  }

  // Extract medicine name
  extractMedicineName(lines) {
    // Look for lines with common medicine name patterns
    const medicineKeywords = ['tablet', 'capsule', 'syrup', 'injection', 'mg', 'ml'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Skip common non-medicine text
      if (lowerLine.includes('expiry') || 
          lowerLine.includes('mfg') || 
          lowerLine.includes('batch') ||
          lowerLine.length < 3) {
        continue;
      }

      // Check if line contains medicine-related keywords
      const hasMedicineKeyword = medicineKeywords.some(keyword => 
        lowerLine.includes(keyword)
      );

      if (hasMedicineKeyword && line.length > 3) {
        // Clean up the name
        return line.replace(/[^\w\s-]/g, '').trim();
      }
    }

    // If no keyword found, return first substantial line
    return lines.find(line => line.length > 3) || null;
  }

  // Extract expiry date
  extractExpiryDate(text) {
    // Common expiry date patterns
    const patterns = [
      // MM/YYYY, MM-YYYY
      /(?:exp|expiry|exp\.|use before|best before)[\s:]*(\d{2}[\/\-]\d{4})/i,
      // MM/YY, MM-YY
      /(?:exp|expiry|exp\.|use before|best before)[\s:]*(\d{2}[\/\-]\d{2})/i,
      // Month YYYY
      /(?:exp|expiry|exp\.|use before|best before)[\s:]*([a-z]{3,}\s*\d{4})/i,
      // Standalone date formats
      /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/,
      /\b(\d{2}[\/\-]\d{4})\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Extract dosage
  extractDosage(text) {
    const dosagePatterns = [
      /(\d+\s*mg)/i,
      /(\d+\s*ml)/i,
      /(\d+\s*g)/i,
      /(\d+\s*mcg)/i,
      /(\d+\s*iu)/i
    ];

    for (const pattern of dosagePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].replace(/\s+/g, '');
      }
    }

    return null;
  }

  // Extract manufacturer
  extractManufacturer(text) {
    const mfgPatterns = [
      /(?:mfg|manufactured by|manufacturer)[\s:]*([a-z\s&.,]+)/i,
    ];

    for (const pattern of mfgPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Extract batch number
  extractBatchNumber(text) {
    const batchPatterns = [
      /(?:batch|lot|batch no|lot no)[\s:]*([a-z0-9]+)/i,
      /\b([a-z]{2}\d{6,})\b/i
    ];

    for (const pattern of batchPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Verify medicine against prescription
  verifyMedicine(ocrResult, prescription) {
    const verification = {
      isValid: false,
      errors: [],
      warnings: [],
      matches: {}
    };

    // Check medicine name
    if (ocrResult.medicineName && prescription.name) {
      const ocrName = ocrResult.medicineName.toLowerCase();
      const prescName = prescription.name.toLowerCase();
      
      const similarity = this.calculateSimilarity(ocrName, prescName);
      
      if (similarity > 0.7) {
        verification.matches.name = true;
      } else {
        verification.errors.push('Medicine name does not match prescription');
        verification.matches.name = false;
      }
    }

    // Check expiry date
    if (ocrResult.expiryDate) {
      const isExpired = this.checkIfExpired(ocrResult.expiryDate);
      if (isExpired) {
        verification.errors.push('Medicine is expired');
        verification.matches.expiry = false;
      } else {
        verification.matches.expiry = true;
        
        // Warn if expiring soon (within 30 days)
        const daysUntilExpiry = this.getDaysUntilExpiry(ocrResult.expiryDate);
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          verification.warnings.push(`Medicine expires in ${daysUntilExpiry} days`);
        }
      }
    }

    // Check dosage
    if (ocrResult.dosage && prescription.dosage) {
      const ocrDosage = ocrResult.dosage.toLowerCase();
      const prescDosage = prescription.dosage.toLowerCase();
      
      if (ocrDosage.includes(prescDosage) || prescDosage.includes(ocrDosage)) {
        verification.matches.dosage = true;
      } else {
        verification.warnings.push('Dosage may not match prescription');
        verification.matches.dosage = false;
      }
    }

    // Determine overall validity
    verification.isValid = verification.errors.length === 0;

    return verification;
  }

  // Calculate string similarity (simple implementation)
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance algorithm
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Check if medicine is expired
  checkIfExpired(expiryDateStr) {
    try {
      const expiryDate = this.parseExpiryDate(expiryDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing expiry date:', error);
      return false;
    }
  }

  // Get days until expiry
  getDaysUntilExpiry(expiryDateStr) {
    try {
      const expiryDate = this.parseExpiryDate(expiryDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until expiry:', error);
      return null;
    }
  }

  // Parse expiry date string to Date object
  parseExpiryDate(dateStr) {
    // Try different formats
    const formats = [
      /(\d{2})[\/\-](\d{4})/, // MM/YYYY or MM-YYYY
      /(\d{2})[\/\-](\d{2})/, // MM/YY or MM-YY
      /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/ // DD/MM/YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (match[3]) {
          // DD/MM/YYYY format
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        } else if (match[2].length === 4) {
          // MM/YYYY format
          return new Date(parseInt(match[2]), parseInt(match[1]) - 1, 1);
        } else {
          // MM/YY format
          const year = 2000 + parseInt(match[2]);
          return new Date(year, parseInt(match[1]) - 1, 1);
        }
      }
    }

    throw new Error('Unable to parse expiry date');
  }

  // Terminate worker
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default OCRProcessor;
