import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ShippingPolicyPage() {
    return (
        <PolicyLayout title="Shipping Policy (ढुवानी नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        Vanijay.com provides fast and reliable shipping across Nepal. We work with the best logistics partners to ensure your orders reach you on time.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (ढुवानी नीति)</h2>
                    <p>
                        Vanijay.com नेपालभर छिटो र भरपर्दो ढुवानी सेवा प्रदान गर्दछ। हामी तपाईँको अर्डर समयमै पुर्‍याउनका लागि उत्कृष्ट लजिस्टिक साझेदारहरूसँग काम गर्छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">१. डेलिभरी समय (Delivery Time)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>काठमाडौं उपत्यका भित्र: १-२ कार्य दिन।</li>
                        <li>काठमाडौं बाहिरका मुख्य सहरहरू: ३-५ कार्य दिन।</li>
                        <li>दुर्गम क्षेत्रहरू: ५-७ कार्य दिन।</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">२. ढुवानी शुल्क (Shipping Charges)</h3>
                    <p>
                        ढुवानी शुल्क सामानको तौल र डेलिभरी स्थानको आधारमा गणना गरिन्छ। निश्चित रकम भन्दा माथिको किनमेलमा हामी नि:शुल्क डेलिभरी पनि प्रदान गर्छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">३. अर्डर ट्र्याकिङ (Order Tracking)</h3>
                    <p>
                        तपाईँको अर्डर ढुवानी भएपछि हामी तपाईँलाई ट्र्याकिङ कोड पठाउनेछौँ, जसबाट तपाईँले आफ्नो सामानको अवस्था हेर्न सक्नुहुन्छ।
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
