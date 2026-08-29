import type { Receipt } from './types';
import { COST_LABELS } from './types';
import { imageToJpegDataUrl, money, safeFilename } from './utils';

export async function exportJobPdf(receipt: Receipt, job: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  // Keep the source label and tamper-check value inspectable in the local PDF.
  // This is evidence a contractor can verify without a server or proprietary reader.
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: false });
  const margin = 44;
  let y = 48;
  doc.setFillColor(11, 13, 12);
  doc.rect(0, 0, 595, 74, 'F');
  doc.setTextColor(141, 245, 178);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text('BILLABLE SPLIT / JOB COST PACKET', margin, y);
  y = 104;
  doc.setTextColor(21, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(job, margin, y);
  y += 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${receipt.supplier}  •  ${receipt.purchasedOn}  •  Source total ${money(receipt.totalCents, receipt.currency)}`, margin, y);
  y += 20;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(`SOURCE IMAGE SHA-256: ${receipt.image.sha256}`, margin, y, { maxWidth: 500 });
  y += 28;

  const image = await imageToJpegDataUrl(receipt.image.blob);
  if (image) {
    doc.addImage(image, 'JPEG', margin, y, 160, 120, undefined, 'FAST');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Source receipt image (preview)', margin, y + 132);
    y += 156;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('LINE', margin, y);
  doc.text('STATUS', 340, y);
  doc.text('AMOUNT', 495, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(21, 25, 23);
  doc.line(margin, y, 551, y);
  y += 18;
  let total = 0;
  for (const line of receipt.lines) {
    for (const allocation of line.allocations.filter((item) => item.job === job)) {
      if (y > 750) { doc.addPage(); y = 48; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(line.description, margin, y, { maxWidth: 275 });
      doc.text(COST_LABELS[allocation.type], 340, y);
      doc.setFont('courier', 'bold');
      doc.text(money(allocation.amountCents, receipt.currency), 495, y, { align: 'right' });
      total += allocation.amountCents;
      y += 24;
    }
  }
  doc.setDrawColor(21, 25, 23);
  doc.line(340, y, 495, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Job total', 340, y);
  doc.setFont('courier', 'bold');
  doc.text(money(total, receipt.currency), 495, y, { align: 'right' });
  y += 36;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(89, 97, 89);
  doc.text(`Created locally by Billable Split on ${new Date().toLocaleString()}. Verify the source image against the SHA-256 fingerprint above.`, margin, y, { maxWidth: 500 });
  doc.save(`${safeFilename(job)}-${receipt.purchasedOn}-cost-packet.pdf`);
}
