
import { InvoiceTemplate, TEMPLATE_OPTIONS } from '@/types/invoice-templates';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';

export const useTemplatesByPlan = () => {
  const { subscription, limits } = useSubscriptionContext();
  
  const getAvailableTemplates = (): InvoiceTemplate[] => {
    const plan = subscription?.plan || 'freemium';
    
    switch (plan) {
      case 'freemium':
        return ['standard']; // Only standard template
      case 'starter':
        return ['standard', 'tally', 'busy', 'zoho', 'classic']; // 5 templates
      case 'professional':
        return ['standard', 'tally', 'busy', 'zoho', 'classic']; // All 10 templates (when we have more)
      default:
        return ['standard'];
    }
  };

  const getAvailableTemplateOptions = () => {
    const availableTemplates = getAvailableTemplates();
    return TEMPLATE_OPTIONS.filter(template => 
      availableTemplates.includes(template.value)
    );
  };

  const canUseTemplate = (template: InvoiceTemplate): boolean => {
    const availableTemplates = getAvailableTemplates();
    return availableTemplates.includes(template);
  };

  const getTemplateCount = (): number => {
    const plan = subscription?.plan || 'freemium';
    switch (plan) {
      case 'freemium':
        return 1;
      case 'starter':
        return 5;
      case 'professional':
        return 10;
      default:
        return 1;
    }
  };

  return {
    getAvailableTemplates,
    getAvailableTemplateOptions,
    canUseTemplate,
    getTemplateCount,
    currentPlan: subscription?.plan || 'freemium'
  };
};
