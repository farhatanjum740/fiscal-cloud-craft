
import React from "react";
import CreditNoteView from '../view/CreditNoteView';

const ZohoCreditNoteView = (props: any) => (
  <div style={{ border: "4px double #2563eb" }}>
    <CreditNoteView {...props} />
  </div>
);

export default ZohoCreditNoteView;
