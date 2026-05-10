export async function sendOrderConfirmationEmail(email: string, orderId: string) {
  console.info(`Order confirmation queued for ${email} on order ${orderId}.`);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  console.info(`Password reset requested for ${email}: ${resetUrl}`);
}
