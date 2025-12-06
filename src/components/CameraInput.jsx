import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import OCRProcessor from './OCRProcessor';
import { FiCamera, FiX, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const CameraInput = ({ prescription, onVerificationComplete }) => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);

  const ocrProcessor = useRef(new OCRProcessor()).current;

  // Capture image from webcam
  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setCapturing(false);
    processImage(imageSrc);
  }, [webcamRef]);

  // Process captured image
  const processImage = async (imageSrc) => {
    setProcessing(true);
    setError(null);
    setOcrResult(null);
    setVerification(null);

    try {
      // Extract text using OCR
      const result = await ocrProcessor.processImage(imageSrc);
      setOcrResult(result);

      // Verify against prescription if provided
      if (prescription) {
        const verificationResult = ocrProcessor.verifyMedicine(result, prescription);
        setVerification(verificationResult);

        // Call callback with results
        if (onVerificationComplete) {
          onVerificationComplete({
            ocrResult: result,
            verification: verificationResult,
            image: imageSrc
          });
        }
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Retry capture
  const retryCapture = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setVerification(null);
    setError(null);
    setCapturing(true);
  };

  // Start capturing
  const startCapturing = () => {
    setCapturing(true);
    setCapturedImage(null);
    setOcrResult(null);
    setVerification(null);
    setError(null);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FiCamera className="mr-2 text-accent-purple" />
        Medicine Verification
      </h3>

      {!capturing && !capturedImage && (
        <div className="text-center">
          <div className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-2xl p-12 mb-6">
            <FiCamera className="text-6xl text-accent-purple mx-auto mb-4" />
            <p className="text-gray-300 mb-6">
              Capture your medicine packaging to verify it matches your prescription
            </p>
            <button onClick={startCapturing} className="btn-primary">
              <FiCamera className="inline mr-2" />
              Open Camera
            </button>
          </div>
        </div>
      )}

      {capturing && (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-xl"
            videoConstraints={{
              facingMode: 'environment'
            }}
          />
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={captureImage} className="btn-primary">
              <FiCamera className="inline mr-2" />
              Capture
            </button>
            <button onClick={() => setCapturing(false)} className="btn-secondary">
              <FiX className="inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div>
          <img src={capturedImage} alt="Captured medicine" className="w-full rounded-xl mb-4 border border-dark-border" />

          {processing && (
            <div className="alert-info">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-accent-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing image with OCR...
              </div>
            </div>
          )}

          {error && (
            <div className="alert-danger">
              <FiAlertTriangle className="inline mr-2" />
              {error}
            </div>
          )}

          {ocrResult && (
            <div className="mb-4">
              <h4 className="font-semibold text-white mb-3">Extracted Information:</h4>
              <div className="bg-dark-bg rounded-xl p-4 space-y-2 border border-dark-border">
                {ocrResult.medicineName && (
                  <p className="text-gray-300"><span className="font-semibold text-white">Medicine:</span> {ocrResult.medicineName}</p>
                )}
                {ocrResult.dosage && (
                  <p><span className="font-semibold">Dosage:</span> {ocrResult.dosage}</p>
                )}
                {ocrResult.expiryDate && (
                  <p><span className="font-semibold">Expiry Date:</span> {ocrResult.expiryDate}</p>
                )}
                {ocrResult.batchNumber && (
                  <p><span className="font-semibold">Batch:</span> {ocrResult.batchNumber}</p>
                )}
              </div>
            </div>
          )}

          {verification && (
            <div>
              {verification.isValid ? (
                <div className="alert-success">
                  <FiCheckCircle className="inline mr-2" />
                  Medicine verified successfully!
                </div>
              ) : (
                <div className="alert-danger">
                  <FiAlertTriangle className="inline mr-2" />
                  <div>
                    <p className="font-semibold mb-2">Verification Failed:</p>
                    <ul className="list-disc list-inside">
                      {verification.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {verification.warnings.length > 0 && (
                <div className="alert-warning mt-3">
                  <FiAlertTriangle className="inline mr-2" />
                  <div>
                    <p className="font-semibold mb-2">Warnings:</p>
                    <ul className="list-disc list-inside">
                      {verification.warnings.map((warn, idx) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-4">
            <button onClick={retryCapture} className="btn-secondary">
              <FiRefreshCw className="inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraInput;
