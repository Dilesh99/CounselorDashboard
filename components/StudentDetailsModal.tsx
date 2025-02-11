import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"

interface StudentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lead: any
}

export default function StudentDetailsModal({ isOpen, onClose, lead }: StudentDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Detailed information about {lead.name}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Name" value={lead.name} />
          <DetailItem label="Email" value={lead.email} />
          <DetailItem label="Phone" value={lead.phone} />
          <DetailItem label="Date of Birth" value={lead.dateOfBirth} />
          <DetailItem label="Gender" value={lead.gender} />
          <DetailItem label="Nationality" value={lead.nationality} />
          <DetailItem label="Street Address" value={lead.streetAddress} />
          <DetailItem label="Street Address Line 2" value={lead.streetAddress2} />
          <DetailItem label="City" value={lead.city} />
          <DetailItem label="State / Province" value={lead.state} />
          <DetailItem label="Postal / Zip Code" value={lead.postalCode} />
          <DetailItem label="Country" value={lead.country} />
          <DetailItem label="How did you hear about us?" value={lead.referralSource} />
          <DetailItem label="If referred, please include the name of the referee" value={lead.referrerName} />
          <DetailItem label="Consent and Declaration" value={lead.consentDeclaration} />
          <DetailItem label="Preferred Schedule" value={lead.preferredSchedule} />
          <DetailItem label="IP" value={lead.ip} />
          <DetailItem label="Edit Link" value={lead.editLink} />
          <DetailItem label="Submission ID" value={lead.submissionId} />
          <DetailItem label="Counselor" value={lead.counselor} />
          <DetailItem label="Intake" value={lead.intake} />
          <DetailItem label="New Approached Date" value={lead.newApproachedDate} />
          <DetailItem label="Payment Date" value={lead.paymentDate} />
          <DetailItem label="Course" value={lead.course} />
          <DetailItem label="Last Modified" value={format(new Date(lead.lastModified), "PPP")} />
          <DetailItem label="Current Status" value={lead.statusHistory[lead.statusHistory.length - 1].status} />
          <DetailItem
            label="Status History"
            value={lead.statusHistory
              .map((history: any) => `${history.status} (${format(new Date(history.date), "PPP")})`)
              .join(", ")}
          />
          <DetailItem label="Standardised Remark" value={lead.standardisedRemark} />
          <DetailItem label="Other Remarks" value={lead.otherRemarks} />
          <DetailItem label="Informed Inauguration" value={lead.informedInauguration} />
          <DetailItem label="Remarks" value={lead.remarks} />
          {lead.comments && lead.comments.length > 0 && (
            <div className="col-span-2">
              <h3 className="font-semibold mb-2">Comments:</h3>
              {lead.comments.map((comment: string, index: number) => (
                <p key={index} className="mb-1 text-sm">
                  {comment}
                </p>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value || "N/A"}</p>
    </div>
  )
}

