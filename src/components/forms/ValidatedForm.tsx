
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import { UseFormReturn } from 'react-hook-form';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ValidatedFormProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  fields: FormFieldConfig[];
  validationRules: ValidationRule<T>[];
  onSubmit: (data: T) => Promise<void> | void;
  children?: React.ReactNode;
  className?: string;
}

export function ValidatedForm<T extends Record<string, any>>({
  form,
  fields,
  validationRules,
  onSubmit,
  children,
  className
}: ValidatedFormProps<T>) {
  const validation = useFormValidation(validationRules);

  const handleSubmit = async (data: T) => {
    const isValid = validation.validateAll(data);
    if (!isValid) {
      return;
    }
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === 'textarea' ? (
                <Textarea
                  {...formField}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  className="min-h-[80px] resize-none"
                  onBlur={() => validation.validateField(field.name as keyof T, formField.value)}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formField.value}
                  onValueChange={(value) => {
                    formField.onChange(value);
                    validation.validateField(field.name as keyof T, value);
                  }}
                  disabled={field.disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  onBlur={() => validation.validateField(field.name as keyof T, formField.value)}
                />
              )}
            </FormControl>
            <FormMessage>
              {validation.fieldErrors(field.name as keyof T)}
            </FormMessage>
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(renderField)}
        </div>
        {children}
      </form>
    </Form>
  );
}
