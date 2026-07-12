import ImageKit from 'imagekit';
import { config } from './env.js';

let imagekitInstance = null;

export const getImageKit = () => {
  if (imagekitInstance) return imagekitInstance;

  if (!config.imagekit.publicKey || !config.imagekit.privateKey || !config.imagekit.urlEndpoint) {
    console.warn('⚠️  ImageKit is not fully configured. File uploads might fail.');
    return null;
  }

  imagekitInstance = new ImageKit({
    publicKey: config.imagekit.publicKey,
    privateKey: config.imagekit.privateKey,
    urlEndpoint: config.imagekit.urlEndpoint
  });

  return imagekitInstance;
};
