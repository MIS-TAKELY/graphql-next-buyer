import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function TermsConditionsPage() {
    return (
        <PolicyLayout title="Terms and Conditions (शर्तहरू र नियमहरू)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        Welcome to Vanijay.com! These Terms and Conditions govern your use of our platform. By accessing or using the platform, you agree to be bound by these terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (शर्तहरू र नियमहरू)</h2>
                    <p>
                        वाणिजय (Vanijay.com) मा तपाईँलाई स्वागत छ! यी शर्तहरू र नियमहरूले तपाईँको यस प्लेटफर्मको प्रयोगलाई नियन्त्रित गर्दछ। प्लेटफर्म प्रयोग गरेर, तपाईँ यी शर्तहरूमा सहमत हुनुहुन्छ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">१. खाता र दर्ता (Account & Registration)</h3>
                    <p>
                        सेवाहरू प्रयोग गर्नका लागि तपाईँले खाता खोल्नुपर्ने हुन सक्छ। तपाईँ आफ्नो खाताको गोपनीयता र पासवर्ड सुरक्षित राख्न जिम्मेवार हुनुहुन्छ। गलत वा भ्रामक जानकारी उपलब्ध गराउनु हुँदैन।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">२. उत्पादन र मूल्य निर्धारण</h3>
                    <p>
                        प्लेटफर्ममा देखाइएका उत्पादनहरू र मूल्यहरू बिना सूचना परिवर्तन हुन सक्छन्। हामी कुनै पनि समयमा कुनै पनि उत्पादन बिक्री गर्न बन्द गर्न सक्छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">३. अर्डर र भुक्तानी</h3>
                    <p>
                        अर्डर गर्नु भनेको खरिद गर्ने प्रस्ताव हो। हामी कुनै पनि कारणले यसलाई स्वीकार वा अस्वीकार गर्न सक्छौँ। भुक्तानी अनलाइन बैंकिङ, कार्डहरू, डिजिटल वालेटहरू, वा डेलिभरीमा नगद (COD) मार्फत गर्न सकिन्छ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">४. निषेधित गतिविधिहरू</h3>
                    <p>तपाईँले प्लेटफर्मलाई निम्न कार्यका लागि प्रयोग गर्नु हुँदैन:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>कुनै पनि कानुनको उल्लंघन गर्न।</li>
                        <li>बौद्धिक सम्पत्ति अधिकारको उल्लंघन गर्न।</li>
                        <li>गलत वा हानिकारक सामग्री पोस्ट गर्न।</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">५. लागू हुने कानुन</h3>
                    <p>यी शर्तहरू नेपालको कानुनद्वारा शासित छन्। कुनै पनि विवादलाई पहिले आपसी छलफल मार्फत समाधान गर्ने प्रयास गरिनेछ।</p>
                </section>

                <section className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">सम्पर्क गर्नुहोस</h3>
                    <p>वाणिजय इन्टरप्राइजेज, कोशी, सुनसरी, इटहरी</p>
                    <p>इमेल: vanijayenterprises@gmail.com</p>
                    <p>फोन: ९७६१०१२८१३</p>
                </section>
            </div>
        </PolicyLayout>
    );
}
