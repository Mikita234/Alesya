// Astro API route
import type { APIContext } from 'astro';

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    console.log('🔧 Сервер: Получен POST запрос');
    console.log('🔧 Сервер: Content-Type:', request.headers.get('content-type'));
    
    const body = await request.json().catch((error) => {
      console.log('🔧 Сервер: Ошибка парсинга JSON:', error);
      return {};
    });
    
    console.log('🔧 Сервер: Получен запрос:', body);
    console.log('🔧 Сервер: Тип body:', typeof body);
    
    const { amount, orderNumber, returnUrl, failUrl } = body;

    console.log('🔧 Сервер: amount =', amount, 'тип:', typeof amount);
    console.log('🔧 Сервер: orderNumber =', orderNumber, 'тип:', typeof orderNumber);

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

    // Используем тестовые данные для разработки
    const ALFA_API_LOGIN = 'ALESYATAKUN-api';
    const ALFA_API_PASSWORD = 'Aupsawh%5+YesNP';

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

    console.log('🔧 Сервер: Отправляем запрос к Альфа-Банку с параметрами:', params.toString());

    // Попробуем GET запрос с параметрами в URL
    const url = `https://ecom.alfabank.by/payment/rest/register.do?${params.toString()}`;
    console.log('🔧 Сервер: URL для запроса:', url);
    
    const bankRes = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    console.log('🔧 Сервер: Статус ответа от Альфа-Банка:', bankRes.status);
    console.log('🔧 Сервер: Заголовки ответа:', Object.fromEntries(bankRes.headers.entries()));

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