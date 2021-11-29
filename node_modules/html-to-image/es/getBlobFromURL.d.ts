import { Options } from './options';
export declare function getBlobFromURL(url: string, options: Options): Promise<{
    blob: string;
    contentType: string;
} | null>;
