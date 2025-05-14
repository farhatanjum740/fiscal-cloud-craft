
import React from 'react';

interface CreditNoteCustomerInfoProps {
  customer: any;
}

const CreditNoteCustomerInfo: React.FC<CreditNoteCustomerInfoProps> = ({ customer }) => {
  if (!customer) return null;
  
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
        <p className="font-medium">{customer.name}</p>
        <p>{customer.billing_address_line1}</p>
        {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
        <p>{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
        {customer.gstin && <p>GSTIN: {customer.gstin}</p>}
        {customer.email && <p>Email: {customer.email}</p>}
        {customer.phone && <p>Phone: {customer.phone}</p>}
      </div>
      
      {(customer.shipping_address_line1 || customer.shipping_city) && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Ship To:</h3>
          <p className="font-medium">{customer.name}</p>
          <p>{customer.shipping_address_line1 || customer.billing_address_line1}</p>
          {customer.shipping_address_line2 && <p>{customer.shipping_address_line2}</p>}
          <p>
            {customer.shipping_city || customer.billing_city}, 
            {customer.shipping_state || customer.billing_state} 
            {customer.shipping_pincode || customer.billing_pincode}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditNoteCustomerInfo;
