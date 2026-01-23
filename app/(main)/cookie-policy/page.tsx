import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function CookiePolicyPage() {
    return (
        <PolicyLayout title="Cookie Policy (कुकिज नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">English Version</h2>
                    <p>
                        Welcome to Vanijay.com! This Cookies Policy explains how we use cookies and similar technologies on our website to improve your online shopping experience in Nepal. By continuing to browse or shop on Vanijay.com, you agree to our use of cookies as described here.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (कुकिज नीति)</h2>
                    <p>
                        Vanijay.com मा तपाईँलाई स्वागत छ! यो कुकिज नीतिले नेपालमा तपाईँको अनलाइन सपिङ अनुभवलाई अझ राम्रो बनाउन हामीले हाम्रो वेबसाइटमा कुकिज र समान प्रविधिहरू कसरी प्रयोग गर्छौँ भन्ने कुराको व्याख्या गर्छ। Vanijay.com मा ब्राउजिङ वा किनमेल जारी राखेर, तपाईँ यहाँ वर्णन गरिए अनुसार कुकिजको प्रयोगमा सहमत हुनुहुन्छ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">कुकिज (Cookies) भनेको के हो?</h3>
                    <p>
                        कुकिज साना टेक्स्ट फाइलहरू हुन् जुन तपाईँले कुनै वेबसाइट भ्रमण गर्दा तपाईँको उपकरण (कम्प्युटर, स्मार्टफोन, वा ट्याब्लेट) मा भण्डारण हुन्छन्। यसले वेबसाइटहरूलाई राम्रोसँग चल्न, छिटो लोड हुन र सहज अनुभव प्रदान गर्न मद्दत गर्दछ। कुकिजमा तपाईँको फोन नम्बर, ठेगाना, वा बैंक जानकारी जस्ता व्यक्तिगत विवरणहरू हुँदैनन् – यसले तपाईँको ब्राउजिङ सम्बन्धी अज्ञात डाटा मात्र भण्डारण गर्दछ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">हामी Vanijay.com मा कुकिज किन प्रयोग गर्छौँ?</h3>
                    <p>
                        हामी तपाईँको किनमेललाई सजिलो, छिटो र सुरक्षित बनाउन कुकिज प्रयोग गर्छौँ। यसको संक्षिप्त विवरण तल दिइएको छ:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border mt-4">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border border-border p-2 text-left">कुकीको प्रकार (Cookie Type)</th>
                                    <th className="border border-border p-2 text-left">उद्देश्य</th>
                                    <th className="border border-border p-2 text-left">उदाहरणहरू</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-border p-2">अत्यन्त आवश्यक (Strictly Necessary)</td>
                                    <td className="border border-border p-2">वेबसाइटलाई सही रूपमा चलाउन अपरिहार्य।</td>
                                    <td className="border border-border p-2">सपिङ कार्ट, सुरक्षित लग-इन, पेज नेभिगेसन</td>
                                </tr>
                                <tr>
                                    <td className="border border-border p-2">कार्यसम्पादन र विश्लेषण (Performance & Analytics)</td>
                                    <td className="border border-border p-2">आगन्तुकहरूले हाम्रो साइट कसरी प्रयोग गर्छन् भनी बुझ्न।</td>
                                    <td className="border border-border p-2">गुगल एनालिटिक्स (Google Analytics)</td>
                                </tr>
                                <tr>
                                    <td className="border border-border p-2">कार्यक्षमता (Functionality)</td>
                                    <td className="border border-border p-2">तपाईँका रोजाइहरू सम्झन मद्दत गर्छ।</td>
                                    <td className="border border-border p-2">सुरक्षित गरिएको लग-इन, भाषा प्राथमिकता</td>
                                </tr>
                                <tr>
                                    <td className="border border-border p-2">विज्ञापन र लक्षित विज्ञापन (Targeting & Advertising)</td>
                                    <td className="border border-border p-2">सान्दर्भिक अफर र विज्ञापनहरू देखाउन।</td>
                                    <td className="border border-border p-2">फेसबुक पिक्सेल (Facebook Pixel), गुगल एड्स (Google Ads)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">कुकिजलाई कसरी व्यवस्थापन वा असक्षम (Disable) गर्ने?</h3>
                    <p>
                        कुकिजमा तपाईँको पूर्ण नियन्त्रण हुन्छ। तपाईँ आफ्नो ब्राउजर सेटिङ्सबाट कुकिज ब्लक गर्न वा मेटाउन सक्नुहुन्छ। तर ध्यान दिनुहोस् कि आवश्यक कुकिजहरू बन्द गर्दा कार्टमा सामान थप्ने वा सुरक्षित चेकआउट (Checkout) जस्ता सुविधाहरूले काम नगर्न सक्छन्।
                    </p>
                </section>

                <section className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">हामीलाई सम्पर्क गर्नुहोस</h3>
                    <p>Vanijay Enterprises, कोशी, सुनसरी, इटहरी</p>
                    <p>ईमेल: vanijayenterprises@gmail.com</p>
                    <p>फोन: 9761012813</p>
                </section>
            </div>
        </PolicyLayout>
    );
}
