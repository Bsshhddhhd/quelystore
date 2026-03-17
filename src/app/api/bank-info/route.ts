import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    bankName: process.env.BANK_NAME || '',
    accountName: process.env.BANK_ACCOUNT_NAME || '',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
    iban: process.env.BANK_IBAN || '',
    whatsapp: process.env.BANK_WHATSAPP || '',
  });
}
