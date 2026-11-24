import { Controller, Get, Header, Inject, Param, ParseUUIDPipe, Res, StreamableFile } from '@nestjs/common';
import { type Response } from 'express';
import { CurrentUser, Public } from '../../common/decorators/auth.decorators';
import { type AuthUser } from '../../common/types/auth-user';
import { APP_CONFIG, type AppConfig } from '../../config/app-config';
import { type CertificateView } from '../../domain/entities';
import { CertificatesService } from './certificates.service';

export interface CertificateResponseDto {
  id: string;
  serial: string;
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string | null;
  scorePercent: number;
  issuedAt: string;
  expiresAt: string | null;
}

export interface VerificationResponseDto {
  valid: boolean;
  certificate: Omit<CertificateResponseDto, 'id'> | null;
}

/** Public path of the certificate check, printed on each certificate. */
const VERIFY_PATH = '/verify';
const SERIAL_PATTERN = /^[A-Z]{2,5}-\d{4}-[0-9A-F]{12}$/;

const toResponse = (view: CertificateView): CertificateResponseDto => ({
  id: view.id,
  serial: view.serial,
  learnerName: view.learnerName,
  courseCode: view.courseCode,
  courseTitle: view.courseTitle,
  instructorName: view.instructorName,
  scorePercent: view.scorePercent,
  issuedAt: view.issuedAt.toISOString(),
  expiresAt: view.expiresAt?.toISOString() ?? null
});

@Controller()
export class CertificatesController {
  constructor(
    private readonly certificates: CertificatesService,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  @Get('me/certificates')
  async mine(@CurrentUser() user: AuthUser): Promise<CertificateResponseDto[]> {
    return (await this.certificates.listMine(user)).map(toResponse);
  }

  @Get('certificates/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async pdf(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    const { filename, pdf } = await this.certificates.renderPdf(user, id, `${this.config.publicAppUrl}${VERIFY_PATH}`);
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(pdf);
  }

  @Public()
  @Get('certificates/verify/:serial')
  async verify(@Param('serial') serial: string): Promise<VerificationResponseDto> {
    if (!SERIAL_PATTERN.test(serial)) return { valid: false, certificate: null };
    const result = await this.certificates.verify(serial, new Date());
    if (!result.certificate) return { valid: false, certificate: null };
    const { id: _id, ...rest } = toResponse(result.certificate);
    return { valid: result.valid, certificate: rest };
  }
}
