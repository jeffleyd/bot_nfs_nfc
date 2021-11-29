import { Options } from './options';
export declare function shouldEmbed(string: string): boolean;
export declare function embedResources(cssString: string, baseUrl: string | null, options: Options): Promise<string>;
export declare function filterPreferredFontFormat(str: string, { preferredFontFormat }: Options): string;
export declare function parseURLs(str: string): string[];
export declare function embed(cssString: string, resourceURL: string, baseURL: string | null, options: Options, get?: (url: string) => Promise<string>): Promise<string>;
