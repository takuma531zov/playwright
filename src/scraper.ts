import { chromium } from 'playwright';
import { CONTACT_KEYWORDS } from './constants';

export async function findContactFormUrl(baseUrl: string): Promise<string | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // URL形式チェック
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    await page.goto(baseUrl, { 
      timeout: 15000, 
      waitUntil: 'domcontentloaded' 
    });

    // すべての <a> タグ取得
    const links = await page.$$eval('a', (elements) =>
      elements.map((el) => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim() || '',
      }))
    );

    // 優先順位付きで問い合わせURLを探す
    for (const keyword of CONTACT_KEYWORDS) {
      const match = links.find((link) =>
        link.href &&
        (link.href.includes(keyword) || link.text.toLowerCase().includes(keyword))
      );

      if (match?.href) {
        try {
          // 絶対URL化（相対パス対応）
          const url = new URL(match.href, baseUrl).toString();
          return url;
        } catch (urlError) {
          console.warn(`⚠️ URL変換エラー: ${match.href}`);
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    console.error(`❌ エラー (${baseUrl}): ${errorMessage}`);
    throw new Error(`スクレイピングエラー: ${errorMessage}`);
  } finally {
    await browser.close();
  }
}