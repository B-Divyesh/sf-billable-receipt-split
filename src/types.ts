export type CostType = 'billable' | 'non-billable' | 'reimbursable';

export interface Allocation {
  id: string;
  job: string;
  amountCents: number;
  type: CostType;
}

export interface LineItem {
  id: string;
  description: string;
  amountCents: number;
  allocations: Allocation[];
}

export interface HistoryEvent {
  id: string;
  at: string;
  label: string;
}

export interface ReceiptImage {
  blob: Blob;
  filename: string;
  mime: string;
  sha256: string;
}

export interface Receipt {
  id: string;
  supplier: string;
  purchasedOn: string;
  currency: string;
  totalCents: number;
  note: string;
  image: ReceiptImage;
  lines: LineItem[];
  history: HistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export const COST_LABELS: Record<CostType, string> = {
  billable: 'Billable',
  'non-billable': 'Non-billable',
  reimbursable: 'Reimbursable',
};
