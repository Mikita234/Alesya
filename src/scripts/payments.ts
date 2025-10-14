// Скрипт обработки платежей на странице /payments
import { getPaymentConfig } from '../config/payment.js';

const paymentConfig = getPaymentConfig('test');

async function handlePaymentSubmit(event: Event) {
  console.log('🚀 Начинаем обработку платежа...');
  event.preventDefault();
  const amountInput = document.getElementById('amount-input') as HTMLInputElement | null;
  const amount = amountInput?.value;

  if (!amount || parseFloat(amount) < 1) {
    const help = document.getElementById('amount-help');
    if (help) help.textContent = 'Введите сумму от 1 до 10000 BYN';
    amountInput?.focus();
    return;
  }
  if (parseFloat(amount) > 10000) {
    const help = document.getElementById('amount-help');
    if (help) help.textContent = 'Максимальная сумма: 10000 BYN';
    amountInput?.focus();
    return;
  }

  const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const requestData = {
    amount: parseFloat(amount),
    orderNumber: orderId,
  };

  try {
    const response = await fetch('/api/register-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Bad JSON from server, status ${response.status}`);
    }

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    window.location.href = data.formUrl;
  } catch (error) {
    console.error('💥 Ошибка:', error);
    const help = document.getElementById('amount-help');
    if (help) help.textContent = `Ошибка оплаты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
  }
}

export function initPaymentsPage() {
  document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('amount-input') as HTMLInputElement | null;
    const quickButtons = document.querySelectorAll('.btn-quick');
    const paymentForm = document.getElementById('payment-form') as HTMLFormElement | null;

    if (paymentForm) {
      paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const amountFromUrl = urlParams.get('amount');
    if (amountFromUrl && amountInput) {
      amountInput.value = amountFromUrl;
    }

    quickButtons.forEach((button) => {
      button.addEventListener('click', function (this: HTMLElement) {
        const amount = this.dataset.amount;
        if (amountInput && amount) {
          amountInput.value = amount;
        }
        quickButtons.forEach((btn: Element) => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
}
