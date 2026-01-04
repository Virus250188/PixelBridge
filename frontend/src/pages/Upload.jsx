/**
 * Upload Page
 */

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadApi } from '../api';
import toast from 'react-hot-toast';

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadApi.uploadRoms(acceptedFiles, null, setProgress);

      if (result.success.length > 0) {
        toast.success(`✅ Successfully uploaded ${result.success.length} ROM(s)!`);
      }

      if (result.failed.length > 0) {
        toast.error(`❌ Failed to upload ${result.failed.length} file(s)`);
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-nes-rom': ['.nes'],
      'application/octet-stream': ['.sfc', '.smc', '.gb', '.gbc', '.gba', '.bin', '.iso']
    },
    maxFiles: 10
  });

  return (
    <div className="container">
      <h1 className="pixel-text">Upload ROMs</h1>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />

        {uploading ? (
          <div className="upload-progress">
            <div className="pixel-spinner"></div>
            <p>Uploading... {progress}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="pixel-icon">📦</div>
            <h2>Drop ROM files here</h2>
            <p>or click to browse</p>
            <div className="supported-formats">
              <p>Supported: .zip, .nes, .sfc, .gb, .gba, .iso, .bin, etc.</p>
              <p>Max 10 files, 4GB each</p>
            </div>
          </div>
        )}
      </div>

      <div className="info-box pixel-border">
        <h3>ℹ️ Upload Info</h3>
        <ul>
          <li>✅ ZIP files are automatically extracted</li>
          <li>✅ Platform is auto-detected from file extension</li>
          <li>✅ Metadata is fetched automatically from IGDB</li>
          <li>✅ Cover images are downloaded</li>
          <li>✅ Duplicates are prevented (MD5 check)</li>
        </ul>
      </div>
    </div>
  );
}
