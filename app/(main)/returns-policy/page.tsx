import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ReturnsPolicyPage() {
    return (
        <PolicyLayout title="Return and Refund Policy (फिर्ता र रिफन्ड नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        At Vanijay.com, we strive for 100% customer satisfaction. If you are not happy with your purchase, we are here to help you with easy returns and refunds according to Nepal&apos;s Consumer Protection Act.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (फिर्ता र रिफन्ड नीति)</h2>
                    <p>
                        Vanijay.com मा, हामी १००% ग्राहक सन्तुष्टिको कामना गर्छौँ। यदि तपाईँ आफ्नो खरिदसँग सन्तुष्ट हुनुहुन्न भने, हामी उपभोक्ता संरक्षण ऐन बमोजिम सजिलो फिर्ता र रिफन्ड प्रक्रियामा मद्दत गर्न तयार छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">१. फिर्ताका लागि योग्यता (Eligibility for Return)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>सामान प्राप्त भएको ७ दिन भित्र फिर्ता अनुरोध गर्नुपर्नेछ।</li>
                        <li>सामान पुरानै अवस्थामा, प्रयोग नगरिएको र मौलिक ट्याग तथा प्याकेजिङ सहित हुनुपर्नेछ।</li>
                        <li>गलत सामान, बिग्रिएको सामान वा विवरणसँग मेल नखाएको सामान फिर्ता गर्न सकिन्छ।</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">२. फिर्ता नगरिने सामानहरू</h3>
                    <p>स्वास्थ्य र सरसफाइका कारणले केही सामानहरू (जस्तै भित्री लुगा, सौन्दर्य प्रसाधन, र सील खोलिएका सफ्टवेयर) फिर्ता गर्न मिल्दैन।</p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">३. रिफन्ड प्रक्रिया (Refund Process)</h3>
                    <p>
                        सामान फिर्ता प्राप्त भएको र जाँच गरिसकेपछि, हामी तपाइँको रिफन्ड प्रक्रिया सुरु गर्नेछौँ। रकम फिर्ता तपाइँको मौलिक भुक्तानी विधि वा डिजिटल वालेट (eSewa, Khalti) मार्फत ३-५ कार्य दिन भित्र गरिनेछ।
                    </p>
                </section>

                <section className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">सम्पर्क गर्नुहोस</h3>
                    <p>Vanijay Enterprises, कोशी, सुनसरी, इटहरी</p>
                    <p>ईमेल: vanijayenterprises@gmail.com</p>
                    <p>फोन: 9761012813</p>
                </section>
            </div>
        </PolicyLayout>
    );
}
