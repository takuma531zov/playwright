import * as fs from 'fs';
import * as csv from 'csv-parser';
import { UrlData } from './types';

export async function readCsvUrls(csvPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const urls: string[] = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv.default())
      .on('data', (row: UrlData) => {
        if (row.url && row.url.trim()) {
          urls.push(row.url.trim());
        }
      })
      .on('end', () => {
        console.log(`📄 CSVから${urls.length}件のURLを読み込みました`);
        resolve(urls);
      })
      .on('error', (error: Error) => {
        console.error('❌ CSV読み込みエラー:', error);
        reject(error);
      });
  });
}