
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

import heic2any from "heic2any";

export const convertHeicToJpeg = async (file: any) => {
  if (file.type === "image/heic" || (file.name.endsWith(".heic") || file.name.endsWith(".HEIC"))) {

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.95,
    });

    console.log('convertedBlob .....', convertedBlob)

    return new File([convertedBlob], file.name.replace(".heic", ".jpg").replace(".HEIC", ".jpg"), {
      type: "image/jpeg",
    });
  }

  return file;
};

let secrets = import.meta.env

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: secrets.VITE_API_KEY,
  authDomain: secrets.VITE_AUTH_DOMAIN,
  projectId: secrets.VITE_PROJECT_ID,
  storageBucket: secrets.VITE_STORAGE_BUCKET,
  messagingSenderId: secrets.VITE_MESSAGING_SENDER_ID,
  appId: secrets.VITE_APP_ID
};

// Safely initialize app or retrieve existing instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize storage with the specific app instance
export const storage = getStorage(app);

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {

    const options = {
      maxSizeMB: 0.7, // compress to max 500KB
      maxWidthOrHeight: 1920, // Full HD quality
      useWebWorker: true,
      initialQuality: 0.70, // 95% quality (almost no loss)
    };

    let uploadFile = await convertHeicToJpeg(file);

    const compressedFile = await imageCompression(uploadFile, options);

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};


export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();