
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number for currency display 
 */
export function formatCurrency(amount: number | null | undefined): string {
  // Ensure we have a valid number
  const safeAmount = Number(amount) || 0;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formats a number with 2 decimal places
 */
export function formatAmount(amount: number | null | undefined): string {
  // Ensure we have a valid number
  const safeAmount = Number(amount) || 0;
  return safeAmount.toFixed(2);
}

/**
 * Convert a number to words for Indian currency
 */
export function amountToWords(amount: number | null | undefined): string {
  // Ensure we have a valid number
  const safeAmount = Number(amount) || 0;
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  // Round to 2 decimal places and separate rupees and paise
  const roundedAmount = Math.round(safeAmount * 100) / 100;
  const rupees = Math.floor(roundedAmount);
  const paise = Math.round((roundedAmount - rupees) * 100);
  
  if (rupees === 0) return "Zero Rupees";
  
  function convertLessThanOneThousand(num: number): string {
    if (num === 0) return "";
    
    if (num < 20) return ones[num];
    
    const digit = num % 10;
    if (num < 100) return tens[Math.floor(num / 10)] + (digit ? ' ' + ones[digit] : '');
    
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertLessThanOneThousand(num % 100) : '');
  }
  
  function convert(num: number): string {
    if (num === 0) return "";
    
    // Indian numbering system: lakhs and crores
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remaining = num % 1000;
    
    let result = "";
    
    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + " Crore ";
    }
    
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + " Lakh ";
    }
    
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + " Thousand ";
    }
    
    if (remaining > 0) {
      result += convertLessThanOneThousand(remaining);
    }
    
    return result.trim();
  }
  
  let result = convert(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + convert(paise) + " Paise";
  }
  
  return result + " Only";
}
