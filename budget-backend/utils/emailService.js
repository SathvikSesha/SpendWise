export const sendThresholdAlert = async (email, spaceName, threshold) => {
  console.log(`\n=========================================`);
  console.log(`📧 EMAIL MOCK SENT TO: ${email}`);
  console.log(
    `⚠️ ALERT: Your space "${spaceName}" has reached its ${threshold}% budget threshold!`,
  );
  console.log(`=========================================\n`);
};
