// Конфигурация платежной системы Альфа-Банк
export const paymentConfig = {
    // Данные мерчанта
    merchant: {
        id: 'ALESYATAKUN',
        name: 'ALESYATAKUN'
    },
    
    // API учетные данные
    api: {
        username: 'ALESYATAKUN-api',
        password: 'Aupsawh%5+YesNP'
    },
    
    // URL-адреса
    urls: {
        // Боевая среда
        live: {
            base: 'https://ecom.alfabank.by',
            payment: 'https://ecom.alfabank.by/payment/rest/',
            register: 'https://ecom.alfabank.by/payment/rest/register.do',
            login: 'https://ecom.alfabank.by/generalmp3/auth/login'
        },
        // Тестовая среда (для разработки)
        test: {
            base: 'https://sandbox.alfabank.by',
            payment: 'https://sandbox.alfabank.by/payment/rest/',
            register: 'https://sandbox.alfabank.by/payment/rest/register.do'
        }
    },
    
    // Настройки платежей
    payment: {
        currency: 'BYN',
        description: 'Консультация психолога',
        successUrl: '/thanks/',
        cancelUrl: '/?status=cancel',
        returnUrl: '/thanks/'
    },
    
    // Настройки подписи
    signature: {
        // Секретный ключ для генерации подписи (получить от банка)
        secretKey: 'Aupsawh%5+YesNP', // Используем пароль API как секретный ключ
        algorithm: 'MD5' // MD5 или SHA256
    }
};

// Функция для получения конфигурации в зависимости от окружения
export function getPaymentConfig(environment = 'live') {
    const config = { ...paymentConfig };
    
    if (environment === 'test') {
        config.urls = paymentConfig.urls.test;
    } else {
        config.urls = paymentConfig.urls.live;
    }
    
    return config;
}

// Импортируем crypto-js для генерации хешей
import CryptoJS from 'crypto-js';

// Функция для генерации MD5 хеша
function generateMD5(text) {
    return CryptoJS.MD5(text).toString();
}

// Функция для генерации SHA256 хеша
async function generateSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Функция для генерации подписи запроса
export async function generateSignature(params, secretKey, algorithm = 'MD5') {
    // Сортируем параметры по алфавиту
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    
    // Добавляем секретный ключ
    const stringToSign = sortedParams + secretKey;
    
    // Генерируем хеш
    if (algorithm === 'SHA256') {
        return await generateSHA256(stringToSign);
    } else {
        return generateMD5(stringToSign);
    }
}

// Функция для создания параметров платежа с подписью
export async function createPaymentParams(amount, orderId, config) {
    const baseParams = {
        amount: amount,
        currency: config.payment.currency,
        order_id: orderId,
        description: `${config.payment.description} - ${amount} ${config.payment.currency}`,
        merchant_id: config.merchant.id,
        // Добавляем другие необходимые параметры
        return_url: config.payment.returnUrl,
        success_url: config.payment.successUrl,
        cancel_url: config.payment.cancelUrl
    };
    
    // Генерируем подпись
    const signature = await generateSignature(
        baseParams, 
        config.signature.secretKey, 
        config.signature.algorithm
    );
    
    return {
        ...baseParams,
        signature: signature
    };
}

// Функция для регистрации заказа через REST API
export async function registerOrder(amount, orderId, config) {
    const params = new URLSearchParams({
        userName: config.api.username,
        password: config.api.password,
        orderNumber: orderId,
        amount: (parseFloat(amount) * 100).toString(), // Сумма в копейках
        currency: '933', // BYN код валюты
        returnUrl: `${window.location.origin}/thanks/`,
        failUrl: `${window.location.origin}/?status=fail`
    });
    
    try {
        const response = await fetch(config.urls.live.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('Ошибка регистрации заказа:', error);
        return null;
    }
}
