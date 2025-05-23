
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dfgjccuvsggfrxwharkp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZ2pjY3V2c2dnZnJ4d2hhcmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTg2NzgsImV4cCI6MjA2MTc3NDY3OH0.7C7nV9HQ55OrVl0yNH7SpGnlLj3lY-s9edZ6aoMMDXY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add a function to directly get the next credit note number for a specific financial year
// The preview parameter allows getting the next number without incrementing the counter
export const getNextCreditNoteNumber = async (companyId: string, financialYear: string, prefix: string = 'CN', preview: boolean = false) => {
  try {
    if (!financialYear) {
      console.error("ERROR: No financial year provided to getNextCreditNoteNumber function");
      throw new Error("Financial year is required to generate credit note number");
    }
    
    if (!companyId) {
      console.error("ERROR: No company ID provided to getNextCreditNoteNumber function");
      throw new Error("Company ID is required to generate credit note number");
    }
    
    console.log(`Getting next credit note number for company ID: ${companyId}, financial year: ${financialYear}, prefix: ${prefix}, preview mode: ${preview}`);
    
    // If in preview mode, we'll query the counter and format a number without incrementing
    if (preview) {
      // Create a unique key for this company and financial year combination
      const company_fy_key = `${companyId}_credit_note_${financialYear}`;
      
      // Query the current counter value
      const { data: counterData, error: counterError } = await supabase
        .from('counters')
        .select('counter')
        .eq('key', company_fy_key)
        .maybeSingle();
      
      if (counterError) {
        console.error("Error querying counter:", counterError);
        throw counterError;
      }
      
      // If no counter exists yet, we'll start at 1
      // Fix: Changed from counterData.counter + 1 to start at 1 if no counter exists yet
      const nextCounter = counterData ? counterData.counter + 1 : 1;
      
      // Format the preview number
      const previewNumber = `${prefix}/${financialYear}/${nextCounter.toString().padStart(3, '0')}`;
      console.log(`Generated preview credit note number: ${previewNumber} (counter not incremented)`);
      
      return previewNumber;
    }
    
    // Call the database function to get the next credit note number with increment
    const { data, error } = await supabase.rpc('get_next_credit_note_number', {
      p_company_id: companyId,
      p_financial_year: financialYear,
      p_prefix: prefix
    });
    
    if (error) {
      console.error("Database RPC error:", error);
      throw error;
    }
    
    if (!data) {
      console.error("No credit note number returned from database function");
      throw new Error("Failed to generate credit note number");
    }
    
    console.log(`Generated credit note number: ${data} for financial year: ${financialYear}`);
    return data;
  } catch (error) {
    console.error("Error generating credit note number:", error);
    throw error;
  }
};
