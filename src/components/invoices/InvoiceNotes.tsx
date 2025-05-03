
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceNotesProps {
  termsAndConditions: string;
  notes: string;
  onTermsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

const InvoiceNotes = ({
  termsAndConditions,
  notes,
  onTermsChange,
  onNotesChange
}: InvoiceNotesProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            rows={4}
            value={termsAndConditions}
            onChange={(e) => onTermsChange(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            rows={4}
            placeholder="Additional notes to be displayed on the invoice (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default InvoiceNotes;
