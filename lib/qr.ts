import QRCode from 'qrcode';

/**
 * Generates a Base64 Data URL for a QR code representing the provided text.
 * @param text The string to embed in the QR code (typically the Visit ID).
 * @returns A promise that resolves to the Base64 Data URL string.
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e1b4b', // Deep indigo elements
        light: '#ffffff', // White background
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    throw err;
  }
}
