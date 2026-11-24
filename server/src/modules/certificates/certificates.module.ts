import { Module } from '@nestjs/common';
import { CERTIFICATE_DOCUMENT } from '../../integrations/documents/certificate-document';
import { PdfKitCertificateDocument } from '../../integrations/documents/pdfkit-certificate.document';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, { provide: CERTIFICATE_DOCUMENT, useClass: PdfKitCertificateDocument }],
  exports: [CertificatesService]
})
export class CertificatesModule {}
