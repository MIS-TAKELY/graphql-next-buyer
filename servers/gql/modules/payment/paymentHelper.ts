import crypto from 'crypto';

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

  console.log("signature",signature)
  console.log("data",data)
  
  return { ...data, signature };
}