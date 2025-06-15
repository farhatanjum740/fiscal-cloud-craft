
import React from "react";
import CreditNoteView from '../view/CreditNoteView';

// Placeholder: You can further differentiate the visual style as needed.
const TallyCreditNoteView = (props: any) => (
  <div style={{ border: "4px solid #84cc16" }}>
    <CreditNoteView {...props} />
  </div>
);

export default TallyCreditNoteView;
