import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout title="Privacy Policy (गोपनीयता नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        At Vanijay.com, we value your privacy and are committed to protecting your personal information. As Nepal&apos;s trusted online shopping platform, we handle your data responsibly and in full compliance with Nepal&apos;s Privacy Act, 2075 (2018).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (गोपनीयता नीति)</h2>
                    <p>
                        Vanijay.com मा, हामी तपाईँको गोपनीयताको कदर गर्छौँ र तपाईँको व्यक्तिगत जानकारी सुरक्षित राख्न प्रतिबद्ध छौँ। नेपालको भरपर्दो अनलाइन सपिङ प्लेटफर्मको रूपमा, हामी तपाईँको डाटालाई जिम्मेवारीपूर्वक र नेपालको वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५ को पूर्ण पालना गर्दै व्यवस्थापन गर्छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">१. हामीले संकलन गर्ने जानकारी</h3>
                    <p>हामी तपाईँलाई सुरक्षित र सहज किनमेल अनुभव प्रदान गर्न आवश्यक जानकारी मात्र संकलन गर्छौँ:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>नाम, ईमेल, फोन नम्बर, र ठेगाना</li>
                        <li>अर्डरको इतिहास र भुक्तानी जानकारी</li>
                        <li>उपकरण र ब्राउजर विवरणहरू</li>
                        <li>कुकिज र समान प्रविधिहरू</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">२. तपाईँको जानकारीको प्रयोग</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>अर्डरहरू सुरक्षित रूपमा प्रशोधन र डेलिभरी गर्न।</li>
                        <li>खाता व्यवस्थापन र ग्राहक सहायता प्रदान गर्न।</li>
                        <li>वेबसाइट र सेवाहरूमा सुधार ल्याउन।</li>
                        <li>नेपाली कानुनी आवश्यकताहरूको पालना गर्न।</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">३. जानकारीको साझेदारी</h3>
                    <p>
                        हामी तपाईँको व्यक्तिगत डाटा कहिल्यै बिक्री गर्दैनौँ। हामी आवश्यक परेको खण्डमा मात्र विश्वसनीय सेवा प्रदायकहरू (जस्तै भुक्तानी गेटवे) र डेलिभरी साझेदारहरूसँग जानकारी साझा गर्छौँ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">४. डाटा सुरक्षा</h3>
                    <p>
                        हामी तपाईँको जानकारीलाई अनधिकृत पहुँचबाट जोगाउन इन्क्रिप्सन र सुरक्षित सर्भर जस्ता कडा सुरक्षा उपायहरू प्रयोग गर्छौँ।
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
