
-- Fix the can_perform_action function to resolve ambiguous month_year column reference
CREATE OR REPLACE FUNCTION public.can_perform_action(p_user_id uuid, p_company_id uuid, p_action_type text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  current_plan subscription_plan;
  limits JSON;
  current_usage JSON;
  month_year TEXT;
  company_exists BOOLEAN;
BEGIN
  -- Check if user owns the company (simplified ownership model)
  SELECT EXISTS(
    SELECT 1 FROM public.companies 
    WHERE id = p_company_id AND user_id = p_user_id
  ) INTO company_exists;
  
  -- Only proceed if user owns the company
  IF NOT company_exists THEN
    RETURN false;
  END IF;
  
  -- Get current month-year
  month_year := to_char(CURRENT_DATE, 'YYYY-MM');
  
  -- Get user's subscription plan
  SELECT s.plan INTO current_plan
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.active = true
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Default to freemium if no subscription
  IF current_plan IS NULL THEN
    current_plan := 'freemium';
  END IF;
  
  -- Get limits for the plan
  limits := get_subscription_limits(current_plan);
  
  -- Get current usage with qualified column reference
  SELECT json_build_object(
    'invoices', COALESCE(uu.invoices_count, 0),
    'customers', COALESCE(uu.customers_count, 0),
    'credit_notes', COALESCE(uu.credit_notes_count, 0),
    'products', COALESCE(uu.products_count, 0)
  ) INTO current_usage
  FROM user_usage uu
  WHERE uu.user_id = p_user_id 
    AND uu.company_id = p_company_id 
    AND uu.month_year = month_year;
  
  -- If no usage record, create one
  IF current_usage IS NULL THEN
    INSERT INTO user_usage (user_id, company_id, month_year)
    VALUES (p_user_id, p_company_id, month_year);
    current_usage := json_build_object('invoices', 0, 'customers', 0, 'credit_notes', 0, 'products', 0);
  END IF;
  
  -- Check limits based on action type
  CASE p_action_type
    WHEN 'invoice' THEN
      RETURN (limits->>'invoices')::int = -1 OR (current_usage->>'invoices')::int < (limits->>'invoices')::int;
    WHEN 'customer' THEN
      RETURN (limits->>'customers')::int = -1 OR (current_usage->>'customers')::int < (limits->>'customers')::int;
    WHEN 'credit_note' THEN
      RETURN (limits->>'credit_notes')::int = -1 OR (current_usage->>'credit_notes')::int < (limits->>'credit_notes')::int;
    WHEN 'product' THEN
      RETURN (limits->>'products')::int = -1 OR (current_usage->>'products')::int < (limits->>'products')::int;
    WHEN 'reports' THEN
      RETURN (limits->>'reports')::boolean;
    WHEN 'api_access' THEN
      RETURN (limits->>'api_access')::boolean;
    ELSE
      RETURN false;
  END CASE;
END;
$function$
