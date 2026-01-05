import { OrderStatus } from "src/types/order";

export const availableMoves: {
  [K in OrderStatus]: Array<{
    admin: boolean;
    newState: OrderStatus;
    label: string;
  }>;
} = {
  reviewing: [
    {
      admin: true,
      newState: "approved",
      label: "Approve order",
    },
  ],
  approved: [
    {
      admin: true,
      newState: "kit-sent",
      label: "Update to Kit Sent",
    },
    {
      admin: true,
      newState: "reviewing",
      label: "Return to Reviewing",
    },
  ],
  "kit-sent": [
    {
      admin: false,
      newState: "kit-arrived",
      label: "Mark as Kit Arrived",
    },
    {
      admin: true,
      newState: "approved",
      label: "Return to Approved",
    },
  ],
  "kit-arrived": [
    {
      admin: true,
      newState: "kit-sent",
      label: "Return to Kit Sent",
    },
  ],
};
