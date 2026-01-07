// Astro API route
import type { APIContext } from 'astro';
import { paymentConfig } from '../../config/payment.js';

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    // прод‑логирование сведено к минимуму; подробные логи включайте локально

    // Простая проверка источника запроса (Origin/Referer)
    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';
    const allowedHosts = new Set([
      'https://alesyatakun.by',
      'https://www.alesyatakun.by',
      'http://localhost:4321',
      'http://127.0.0.1:4321'
    ]);
    const isAllowedOrigin = Array.from(allowedHosts).some((h) => origin.startsWith(h) || referer.startsWith(h));
    if (!isAllowedOrigin) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Наивный rate-limit по IP (10 запросов в минуту)
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const now = Date.now();
    // @ts-ignore - используем глобальную карту между инстансами в рамках одного процесса
    globalThis.__rate = (globalThis.__rate || new Map());
    // @ts-ignore
    const store: Map<string, { count: number; ts: number }> = globalThis.__rate;
    const rec = store.get(ip);
    if (rec && now - rec.ts < 60_000 && rec.count >= 10) {
      return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    store.set(ip, rec && now - rec.ts < 60_000 ? { count: rec.count + 1, ts: rec.ts } : { count: 1, ts: now });
    
    const body = await request.json().catch((error) => {
      console.log('🔧 Сервер: Ошибка парсинга JSON:', error);
      return {};
    });
    
    // Валидация входных данных
    
    const { amount, orderNumber } = body;

    

    if (typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      console.log('🔧 Сервер: Ошибка валидации amount - не число или <= 0');
      return new Response(JSON.stringify({ success: false, error: 'Bad amount' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!orderNumber || !/^[A-Z0-9_-]{8,64}$/i.test(orderNumber)) {
      return new Response(JSON.stringify({ success: false, error: 'Missing orderNumber' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Читаем креды из ENV (приоритет) или из конфига (fallback для локальной разработки)
    const ALFA_API_LOGIN = process.env.ALFA_API_LOGIN || paymentConfig.api.username;
    const ALFA_API_PASSWORD = process.env.ALFA_API_PASSWORD || paymentConfig.api.password;

    if (!ALFA_API_LOGIN || !ALFA_API_PASSWORD) {
      return new Response(JSON.stringify({ success: false, error: 'Bank credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Альфа ждёт сумму в копейках BYN (minor units)
    const amountMinor = Math.round(amount * 100);

    const siteOrigin = 'https://alesyatakun.by';
    const params = new URLSearchParams({
      userName: ALFA_API_LOGIN,
      password: ALFA_API_PASSWORD,
      orderNumber,
      amount: String(amountMinor),
      currency: '933',                  // BYN
      returnUrl: `${siteOrigin}/thanks/`,
      failUrl: `${siteOrigin}/?status=fail`,
      description: `Order ${orderNumber}`
    });

    // Используем POST, не передаем креды в URL
    const bankRes = await fetch('https://ecom.alfabank.by/payment/rest/register.do', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    // Минимальная диагностика без утечки параметров

    // Читаем ответ как текст сначала, чтобы избежать ошибки "Body is unusable"
    const responseText = await bankRes.text();
    console.log('🔧 Сервер: Ответ от Альфа-Банка (текст, первые 500 символов):', responseText.slice(0, 500));

    let bankJson;
    try {
      bankJson = JSON.parse(responseText);
    } catch (jsonError) {
      console.log('🔧 Сервер: Не-JSON ответ от Альфа-Банка:', responseText);
      throw new Error(`Bank non-JSON response: ${responseText.slice(0, 500)}`);
    }

    console.log('🔧 Сервер: Ответ от Альфа-Банка (JSON):', bankJson);

    // Ответ Альфы: {orderId, formUrl} или {errorCode, errorMessage}
    if (bankJson.errorCode) {
      return new Response(JSON.stringify({
        success: false,
        error: `Bank error ${bankJson.errorCode}: ${bankJson.errorMessage || 'unknown'}`,
        details: bankJson
      }), { 
        status: 502, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: bankJson.orderId,
      formUrl: bankJson.formUrl
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('🔧 Сервер: Ошибка:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Internal error'
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}