
import React from "react";
import CreditNoteView from '../view/CreditNoteView';

const BusyCreditNoteView = (props: any) => (
  <div style={{ border: "4px dashed #f59e42" }}>
    <CreditNoteView {...props} />
  </div>
);

export default BusyCreditNoteView;
