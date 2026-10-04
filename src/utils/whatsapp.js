// WhatsApp slip generator supporting Hindi, Gujarati, and English
import { calculateWorkerFinancials, formatCurrency } from "./calculations";
import { translations } from "../translations";

export const generateWhatsAppSlip = ({ worker, site, attendance = [], transactions = [], lang = "hi" }) => {
  const fin = calculateWorkerFinancials(worker, attendance, transactions);
  const t = translations[lang].whatsapp;
  const siteName = site?.name || "All Sites";

  const message = [
    `📋 ${t.title}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `👷 *${t.worker}*: ${worker.name}`,
    `🏗️ *${t.site}*: ${siteName}`,
    `📞 *मोबाइल*: ${worker.phone || "N/A"}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `✅ *${t.totalPresent}*: ${fin.presentCount} दिन`,
    `🌓 *${t.totalHalfDay}*: ${fin.halfDayCount} दिन`,
    `❌ *${t.totalAbsent}*: ${fin.absentCount} दिन`,
    fin.totalOtHours > 0 ? `⏱️ *${t.otHours}*: ${fin.totalOtHours} घंटे` : null,
    `━━━━━━━━━━━━━━━━━━━`,
    `💰 *${t.totalEarned}*: ${formatCurrency(fin.totalEarned)}`,
    `💸 *${t.totalAdvance}*: ${formatCurrency(fin.totalAdvance)}`,
    `💵 *${t.balanceDue}*: *${formatCurrency(fin.balanceDue)}*`,
    `━━━━━━━━━━━━━━━━━━━`,
    `🙏 *${translations[lang].appName}*`
  ]
    .filter(Boolean)
    .join("\n");

  const cleanPhone = worker.phone ? worker.phone.replace(/[^0-9]/g, "") : "";
  const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const url = phoneParam
    ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  return { message, url };
};
