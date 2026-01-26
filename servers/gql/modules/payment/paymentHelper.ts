import crypto from 'crypto';
import { NepPayments } from 'neppayments';

// Helper for EMVCo CRC-16 (CCITT-FALSE)
function crc16ccitt(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function generateFonepayEMVCoQR(amount: number, merchantCode: string, ref: string): string {
  const fields: Record<string, string> = {
    '00': '01', // Payload Format Indicator
    '01': '12', // Point of Initiation Method (12 for Dynamic)
    '29': `0012NP.FONEPAY.0101${merchantCode.length.toString().padStart(2, '0')}${merchantCode}`, // Merchant Account Information
    '52': '5411', // Merchant Category Code
    '53': '524', // Transaction Currency (NPR)
    '54': amount.toString(), // Transaction Amount
    '58': 'NP', // Country Code
    '59': 'Merchant', // Merchant Name
    '60': 'Kathmandu', // Merchant City
    '62': `01${ref.length.toString().padStart(2, '0')}${ref}`, // Additional Data (Reference)
  };

  let qrString = '';
  for (const [id, value] of Object.entries(fields)) {
    qrString += `${id}${value.length.toString().padStart(2, '0')}${value}`;
  }

  qrString += '6304'; // CRC-16 tag and length
  qrString += crc16ccitt(qrString);

  return qrString;
}

interface EsewaPaymentData {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

interface FonepayPaymentData {
  amount: string;
  transaction_uuid: string;
  merchant_code: string;
  signature: string;
}

export function generateTransactionUuid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function generateEsewaSignature(data: Record<string, string>): string {
  const secret = process.env.ESEWA_SECRET_KEY!;
  const signedFieldNames = data.signed_field_names || 'total_amount,transaction_uuid,product_code';

  const message = signedFieldNames
    .split(',')
    .map((field) => `${field}=${data[field] || ''}`)
    .join(',');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');

  return signature;
}

export function verifyEsewaSignature(data: Record<string, any>): boolean {
  const receivedSignature = data.signature;
  const signedFieldNames = data.signed_field_names;

  if (!receivedSignature || !signedFieldNames) return false;

  const message = signedFieldNames
    .split(',')
    .map((field: string) => `${field}=${data[field] || ''}`)
    .join(',');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.ESEWA_SECRET_KEY!)
    .update(message)
    .digest('base64');

  return receivedSignature === expectedSignature;
}

export function prepareEsewaPaymentData(
  amount: number,
  transactionId: string
): EsewaPaymentData {
  const data = {
    amount: amount.toString(),
    tax_amount: '0',
    total_amount: amount.toString(),
    transaction_uuid: transactionId,
    product_code: process.env.ESEWA_MERCHANT_CODE!,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/esewa/success`,
    failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/esewa/failure`,
    signed_field_names: 'total_amount,transaction_uuid,product_code'
  };

  const signature = generateEsewaSignature(data);

  console.log("signature", signature)
  console.log("data", data)

  return { ...data, signature };
}

export function generateFonepaySignature(data: Record<string, string>): string {
  const secret = process.env.FONEPAY_SECRET_KEY!;
  // Fonepay typically expects fields in a specific order for HMAC
  const message = `PRN=${data.transaction_uuid},PID=${data.merchant_code},AMT=${data.amount}`;

  return crypto
    .createHmac('sha512', secret) // Fonepay often uses SHA512
    .update(message)
    .digest('hex');
}

export function verifyFonepaySignature(data: Record<string, any>): boolean {
  const receivedSignature = data.signature;
  if (!receivedSignature) return false;

  const expectedSignature = generateFonepaySignature({
    transaction_uuid: data.transaction_uuid,
    merchant_code: process.env.FONEPAY_MERCHANT_CODE!,
    amount: data.amount
  });

  return receivedSignature.toLowerCase() === expectedSignature.toLowerCase();
}

export function prepareFonepayPaymentData(
  amount: number,
  transactionId: string,
  merchantCode: string
): FonepayPaymentData {
  const data = {
    amount: amount.toString(),
    transaction_uuid: transactionId,
    merchant_code: merchantCode
  };

  const signature = generateFonepaySignature(data);

  return { ...data, signature };
}