// Astro API route
import type { APIContext } from 'astro';

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    // прод‑логирование сведено к минимуму; подробные логи включайте локально
    
    const body = await request.json().catch((error) => {
      console.log('🔧 Сервер: Ошибка парсинга JSON:', error);
      return {};
    });
    
    // Валидация входных данных
    
    const { amount, orderNumber } = body;

    

    if (typeof amount !== 'number' || amount <= 0) {
      console.log('🔧 Сервер: Ошибка валидации amount - не число или <= 0');
      return new Response(JSON.stringify({ success: false, error: 'Bad amount' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!orderNumber) {
      return new Response(JSON.stringify({ success: false, error: 'Missing orderNumber' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Читаем креды из ENV (на проде обязателены)
    const ALFA_API_LOGIN = process.env.ALFA_API_LOGIN;
    const ALFA_API_PASSWORD = process.env.ALFA_API_PASSWORD;

    if (!ALFA_API_LOGIN || !ALFA_API_PASSWORD) {
      return new Response(JSON.stringify({ success: false, error: 'Bank credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Альфа ждёт сумму в копейках BYN (minor units)
    const amountMinor = Math.round(amount * 100);

    const params = new URLSearchParams({
      userName: ALFA_API_LOGIN,
      password: ALFA_API_PASSWORD,
      orderNumber,
      amount: String(amountMinor),
      currency: '933',                  // BYN
      returnUrl: returnUrl || 'https://alesyatakun.by/thanks/',
      failUrl: failUrl || 'https://alesyatakun.by/?status=fail',
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