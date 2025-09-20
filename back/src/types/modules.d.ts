declare module 'qrcode' {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg';
    quality?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  export function toString(text: string, options?: QRCodeOptions): Promise<string>;
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdfParse(buffer: Buffer, options?: any): Promise<PDFData>;
  export = pdfParse;
}