import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { type CertificateDocumentData, type ICertificateDocument } from './certificate-document';

/* Brand values for the printed certificate; the web UI takes the same values from its theme tokens. */
const BRAND = { primary: '#C2410C', accent: '#F59E0B', ink: '#1C1917', muted: '#57534E', paper: '#FFFBF5' } as const;
const PAGE = { size: 'A4', layout: 'landscape', margin: 48 } as const;
const FRAME_INSET = 24;
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

@Injectable()
export class PdfKitCertificateDocument implements ICertificateDocument {
  render(data: CertificateDocumentData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ ...PAGE, info: { Title: `Certificate ${data.serial}`, Author: 'Data Mine Labs' } });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      this.draw(doc, data);
      doc.end();
    });
  }

  private draw(doc: PDFKit.PDFDocument, data: CertificateDocumentData): void {
    const { width, height } = doc.page;
    doc.rect(0, 0, width, height).fill(BRAND.paper);
    doc
      .lineWidth(4)
      .rect(FRAME_INSET, FRAME_INSET, width - FRAME_INSET * 2, height - FRAME_INSET * 2)
      .stroke(BRAND.primary);
    doc
      .lineWidth(1)
      .rect(FRAME_INSET + 8, FRAME_INSET + 8, width - (FRAME_INSET + 8) * 2, height - (FRAME_INSET + 8) * 2)
      .stroke(BRAND.accent);

    const centre = { width: width - PAGE.margin * 2, align: 'center' as const };
    doc.moveDown(2).fillColor(BRAND.primary).font('Helvetica-Bold').fontSize(16).text('DATA MINE LABS', centre);
    doc.moveDown(1).fillColor(BRAND.ink).fontSize(34).text('Certificate of Completion', centre);
    doc.moveDown(1).font('Helvetica').fontSize(14).fillColor(BRAND.muted).text('This certifies that', centre);
    doc.moveDown(0.5).font('Helvetica-Bold').fontSize(28).fillColor(BRAND.ink).text(data.learnerName, centre);
    doc.moveDown(0.5).font('Helvetica').fontSize(14).fillColor(BRAND.muted).text('has successfully completed', centre);
    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor(BRAND.ink)
      .text(`${data.courseCode}: ${data.courseTitle}`, centre);
    doc
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(13)
      .fillColor(BRAND.muted)
      .text(`Final assessment score: ${data.scorePercent}%`, centre);

    const footer = [
      `Issued ${DATE_FORMAT.format(data.issuedAt)}`,
      data.expiresAt ? `Valid until ${DATE_FORMAT.format(data.expiresAt)}` : 'Does not expire',
      data.instructorName ? `Instructor: ${data.instructorName}` : null
    ].filter((part): part is string => part !== null);
    doc.moveDown(2).fontSize(12).fillColor(BRAND.ink).text(footer.join('   ·   '), centre);
    doc
      .moveDown(0.5)
      .fontSize(10)
      .fillColor(BRAND.muted)
      .text(`Certificate ID ${data.serial}  ·  Verify at ${data.verifyUrl}`, centre);
  }
}
