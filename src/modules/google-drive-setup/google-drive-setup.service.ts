import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleDriveSetupService {
  constructor(private readonly configService: ConfigService) {}

  getGoogleDrive(): drive_v3.Drive {
    const oauth2Client = this.createOAuth2Client();

    return google.drive({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  private createOAuth2Client(): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_API_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_API_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_API_REDIRECT_URL'),
    );

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GOOGLE_API_REFRESH_TOKEN'),
    });

    return oauth2Client;
  }
}
