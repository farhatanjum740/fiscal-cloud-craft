
import React from "react";
import CreditNoteView from '../view/CreditNoteView';

const ClassicCreditNoteView = (props: any) => (
  <div style={{ border: "4px groove #111827" }}>
    <CreditNoteView {...props} />
  </div>
);

export default ClassicCreditNoteView;
