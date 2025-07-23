import { readCsvUrls } from './csv-reader';
import { findContactFormUrl } from './scraper';
import { ScrapeResult } from './types';

export async function processUrls(csvPath: string, concurrency: number = 3): Promise<ScrapeResult[]> {
  try {
    const urls = await readCsvUrls(csvPath);
    const results: ScrapeResult[] = [];
    
    console.log(`🚀 ${urls.length}件のURL処理を開始（並行数: ${concurrency}）`);
    
    // 並行処理用のチャンクに分割
    for (let i = 0; i < urls.length; i += concurrency) {
      const chunk = urls.slice(i, i + concurrency);
      
      const chunkPromises = chunk.map(async (url, index) => {
        const globalIndex = i + index + 1;
        console.log(`📍 処理中 (${globalIndex}/${urls.length}): ${url}`);
        
        try {
          const contactUrl = await findContactFormUrl(url);
          const result: ScrapeResult = {
            url,
            contactUrl,
            status: 'success'
          };
          console.log(`✅ 完了 (${globalIndex}/${urls.length}): ${contactUrl ?? '見つかりませんでした'}`);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '不明なエラー';
          const result: ScrapeResult = {
            url,
            contactUrl: null,
            status: 'error',
            error: errorMessage
          };
          console.log(`❌ エラー (${globalIndex}/${urls.length}): ${errorMessage}`);
          return result;
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // レート制限対応（チャンク間の待機）
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    console.log(`🎉 処理完了: 成功${successCount}件、エラー${errorCount}件`);
    
    return results;
  } catch (error) {
    console.error('❌ 処理エラー:', error);
    throw error;
  }
}