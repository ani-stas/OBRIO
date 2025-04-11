import { ContentType, UserFriendlyFileType } from '../enums';

export const fileTypeMapper: Record<string, string> = {
  [ContentType.IMAGE_JPG]: UserFriendlyFileType.JPG,
  [ContentType.IMAGE_PNG]: UserFriendlyFileType.PNG,
  [ContentType.APPLICATION_PDF]: UserFriendlyFileType.PDF,
  [ContentType.APPLICATION_MSWORD]: UserFriendlyFileType.DOC,
  [ContentType.APPLICATION_DOCX]: UserFriendlyFileType.DOCX,
  [ContentType.VIDEO_MP4]: UserFriendlyFileType.MP4,
  [ContentType.AUDIO_MPEG]: UserFriendlyFileType.MP3,
  [ContentType.APPLICATION_ZIP]: UserFriendlyFileType.ZIP,
  [ContentType.APPLICATION_RAR]: UserFriendlyFileType.RAR,
};
