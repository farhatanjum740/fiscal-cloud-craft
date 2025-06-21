
import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any, data: T) => string | null;
  dependencies?: (keyof T)[];
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  fieldErrors: (field: keyof T) => string | null;
  validateField: (field: keyof T, value: any, data?: T) => string | null;
  validateAll: (data: T) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
}

export const useFormValidation = <T extends Record<string, any>>(
  rules: ValidationRule<T>[]
): ValidationResult<T> => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback((field: keyof T, value: any, data?: T) => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return null;

    const error = rule.validator(value, data || {} as T);
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error;
  }, [rules]);

  const validateAll = useCallback((data: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    rules.forEach(rule => {
      const error = rule.validator(data[rule.field], data);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules]);

  const fieldErrors = useCallback((field: keyof T) => {
    return errors[field] || null;
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    fieldErrors,
    validateField,
    validateAll,
    clearErrors,
    clearFieldError
  };
};

// Common validation schemas
export const createValidationRules = {
  required: <T,>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return message || `${String(field)} is required`;
      }
      return null;
    }
  }),

  email: <T,>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return message || 'Invalid email format';
      }
      return null;
    }
  }),

  minLength: <T,>(field: keyof T, min: number, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (value && value.length < min) {
        return message || `${String(field)} must be at least ${min} characters`;
      }
      return null;
    }
  }),

  number: <T,>(field: keyof T, options?: { min?: number; max?: number }, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value);
        if (isNaN(num)) {
          return message || `${String(field)} must be a valid number`;
        }
        if (options?.min !== undefined && num < options.min) {
          return `${String(field)} must be at least ${options.min}`;
        }
        if (options?.max !== undefined && num > options.max) {
          return `${String(field)} must be at most ${options.max}`;
        }
      }
      return null;
    }
  }),

  gstin: <T,>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
        return message || 'Invalid GSTIN format';
      }
      return null;
    }
  }),

  pan: <T,>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => {
      if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
        return message || 'Invalid PAN format';
      }
      return null;
    }
  })
};
