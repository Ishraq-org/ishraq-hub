export type UploadFolder = 'covers' | 'evidence' | 'inline';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = async (
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<UploadResult> => {
  // 1. Client-side validation before network request (Prompt 13 §53-55)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file type: Only JPG, PNG, and WebP images are allowed.');
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File size exceeds 10MB limit. Please choose a smaller image.');
  }

  // 2. Fetch signed upload permission slip from backend (Prompt 13 §56)
  const sigRes = await fetch('/api/uploads/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const errorData = await sigRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to acquire upload authorization signature');
  }

  const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

  // 3. Prepare FormData for direct Cloudinary upload (Prompt 13 §57-59)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  // 4. Perform direct browser-to-Cloudinary upload via XMLHttpRequest for real upload progress (Prompt 13 §60-64)
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    xhr.open('POST', uploadUrl);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url || response.url,
            publicId: response.public_id,
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response JSON'));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp.error?.message || `Cloudinary upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Cloudinary upload failed with HTTP status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during direct Cloudinary image upload'));
    };

    xhr.send(formData);
  });
};
