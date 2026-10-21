import { Env, StandardCheckoutClient, StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node";

const PROVIDER=(process.env.PAYMENT_PROVIDER||"phonepe").toLowerCase();
let phonePeClient;

export function getPaymentProvider(){return PROVIDER;}
export function isPaymentConfigured(){
 if(PROVIDER==="phonepe") return Boolean(process.env.PHONEPE_CLIENT_ID&&process.env.PHONEPE_CLIENT_SECRET&&process.env.PHONEPE_CLIENT_VERSION);
 if(PROVIDER==="razorpay") return Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET);
 return false;
}
export function getPaymentStatusMessage(){return isPaymentConfigured()?`Payment provider ${PROVIDER} is configured.`:"Online payment is not configured yet. Your enrollment remains pending until payment is completed.";}
export function getPhonePeClient(){
 if(PROVIDER!=="phonepe"||!isPaymentConfigured()) throw new Error("PhonePe is not configured.");
 if(!phonePeClient){
  const env=(process.env.PHONEPE_ENV||"SANDBOX").toUpperCase()==="PRODUCTION"?Env.PRODUCTION:Env.SANDBOX;
  phonePeClient=StandardCheckoutClient.getInstance(process.env.PHONEPE_CLIENT_ID,process.env.PHONEPE_CLIENT_SECRET,Number(process.env.PHONEPE_CLIENT_VERSION||1),env);
 }
 return phonePeClient;
}
export async function createPhonePeCheckout({merchantOrderId,amountPaise,redirectUrl}){
 const request=StandardCheckoutPayRequest.builder().merchantOrderId(merchantOrderId).amount(amountPaise).redirectUrl(redirectUrl).build();
 return getPhonePeClient().pay(request);
}
export function validatePhonePeCallback(authorization,responseBody){
 const username=process.env.PHONEPE_CALLBACK_USERNAME; const password=process.env.PHONEPE_CALLBACK_PASSWORD;
 if(!username||!password) throw new Error("PhonePe callback authentication is not configured.");
 return getPhonePeClient().validateCallback(username,password,authorization||"",responseBody);
}
