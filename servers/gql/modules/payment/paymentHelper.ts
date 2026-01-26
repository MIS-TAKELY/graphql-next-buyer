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
  const toTLV = (tag: string, value: string) => `${tag}${value.length.toString().padStart(2, '0')}${value}`;

  // Standard NepalQR / NCHL (Tag 26)
  const nepalQRId =
    toTLV('00', 'NP.QR') +
    toTLV('01', merchantCode);

  // Fonepay specific (Tag 30)
  const fonepayId =
    toTLV('00', 'NP.FONEPAY') +
    toTLV('01', merchantCode);

  const fields = [
    toTLV('00', '01'), // Payload Format Indicator
    toTLV('01', '12'), // Point of Initiation Method (12 for Dynamic)
    toTLV('26', nepalQRId), // Standard NepalQR
    toTLV('30', fonepayId), // Fonepay ID
    toTLV('52', '0000'), // Merchant Category Code (Generic)
    toTLV('53', '524'), // Transaction Currency (NPR)
    toTLV('54', amount.toFixed(2)), // Transaction Amount
    toTLV('58', 'NP'), // Country Code
    toTLV('59', 'DAI MULTI VENDOR'), // Merchant Name
    toTLV('60', 'KATHMANDU'), // Merchant City
    toTLV('62', toTLV('01', ref)), // Reference ID
  ];

  let qrString = fields.join('');
  qrString += '6304';

  const crc = crc16ccitt(qrString);
  return qrString + crc;
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