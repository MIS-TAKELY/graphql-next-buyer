import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="December 22, 2025">
            <div className="space-y-12">
                <section>
                    <div className="bg-muted/30 p-6 md:p-8 rounded-xl border">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">English Version</h2>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p className="mb-6">At Vanijay.com, we value your privacy and are committed to protecting your personal information. As Nepal's trusted online shopping platform, we handle your data responsibly and in full compliance with Nepal's Privacy Act, 2075 (2018) and other applicable laws.</p>
                            <p className="mb-6">By using Vanijay.com (our website and services), you agree to the practices described in this Privacy Policy.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">1. What Information We Collect</h3>
                            <p>We collect only the information needed to provide you with a secure and smooth shopping experience.</p>
                            <h4 className="text-lg font-medium text-foreground mt-4 mb-2">Information You Provide:</h4>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Name, email, phone number, delivery and billing address</li>
                                <li>Account details (username, password, preferences)</li>
                                <li>Order history and payment information (we use secure third-party processors and do not store full card details)</li>
                                <li>Messages, feedback, or reviews you send us</li>
                            </ul>
                            <h4 className="text-lg font-medium text-foreground mt-4 mb-2">Information Collected Automatically:</h4>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Device and browser details (IP address, device type, operating system)</li>
                                <li>Usage data (pages visited, time spent, clicks)</li>
                                <li>General location (from IP) to improve delivery estimates</li>
                                <li>Cookies and similar technologies (see our Cookies Policy for details)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h3>
                            <p>We use your data to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Process and deliver your orders safely</li>
                                <li>Manage your account and provide customer support</li>
                                <li>Send order updates and transactional messages</li>
                                <li>Improve our website, products, and services</li>
                                <li>Personalize your shopping experience</li>
                                <li>Prevent fraud and ensure platform security</li>
                                <li>Send promotional offers (only with your consent – you can opt out anytime)</li>
                                <li>Comply with Nepalese legal requirements</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">3. How We Share Your Information</h3>
                            <p>We <strong>never sell</strong> your personal data. We share it only when necessary with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Trusted service providers (payment gateways, hosting, analytics) who are bound by strict privacy agreements</li>
                                <li>Delivery partners to ship your orders across Nepal</li>
                                <li>Legal authorities if required by Nepalese law</li>
                                <li>In case of business transfers (like mergers or acquisitions)</li>
                                <li>With your explicit consent for any other purpose</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Cookies & Tracking</h3>
                            <p>We use cookies to make your experience better – remembering your cart, preferences, and showing relevant products. You can manage or disable cookies in your browser settings. Learn more in our <a href="/cookie-policy" className="text-primary hover:underline">Cookies Policy</a>.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Your Privacy Rights (Under Nepalese Law)</h3>
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Access & Update</strong> your information anytime via your account</li>
                                <li><strong>Opt Out</strong> of marketing emails (use the unsubscribe link or contact us)</li>
                                <li><strong>Withdraw Consent</strong> for data use (this may limit some services)</li>
                                <li><strong>Request Deletion</strong> of your data (we'll comply unless required to keep it for legal reasons)</li>
                            </ul>
                            <p className="mt-4">To exercise your rights, contact us at <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a>.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Data Security</h3>
                            <p>We use strong security measures – including encryption, secure servers, and regular audits – to protect your information from unauthorized access, loss, or misuse. While no online system is 100% secure, we take every reasonable step to keep your data safe.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">7. How Long We Keep Your Data</h3>
                            <p>We retain your information only as long as needed for orders, legal compliance, dispute resolution, or legitimate business purposes – in line with Nepalese data protection laws.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Children's Privacy</h3>
                            <p>Vanijay.com is not for children under 16. We do not knowingly collect data from minors. If you believe a child has shared information with us, please contact us immediately.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Third-Party Links</h3>
                            <p>Our site may link to external websites (like payment partners). Their privacy practices are not covered by this policy – please review theirs separately.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Changes to This Policy</h3>
                            <p>We may update this Privacy Policy occasionally. Changes will be posted here with a new “Last Updated” date. We recommend checking back from time to time.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Contact Us</h3>
                            <p>Have questions about your privacy or data? We're here to help.</p>
                            <address className="not-italic bg-muted p-4 rounded-lg mt-4">
                                Vanijay Enterprises<br />
                                Koshi, Sunsari, Itahari<br />
                                Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                Phone: 9761012813<br />
                                Support Hours: Sunday–Friday, 9 AM – 5 PM Nepal Time
                            </address>
                            <p className="mt-8 font-medium">Shop safely and securely at Vanijay.com – Nepal's reliable online store with protected privacy, fast delivery, easy returns, and secure payments nationwide. Thank you for trusting us!</p>
                        </div>
                    </div>

                    <div className="mt-12 bg-muted/30 p-6 md:p-8 rounded-xl border border-primary/20">
                        <h2 className="text-2xl font-bold mb-6 text-primary border-b border-primary/20 pb-2">Nepali Translation (गोपनीयता नीति)</h2>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed">
                            <p className="font-semibold mb-6">अन्तिम परिमार्जन: डिसेम्बर २२, २०२५</p>
                            <p>Vanijay.com मा, हामी तपाईँको गोपनीयताको कदर गर्छौँ र तपाईँको व्यक्तिगत जानकारी सुरक्षित राख्न प्रतिबद्ध छौँ। नेपालको भरपर्दो अनलाइन सपिङ प्लेटफर्मको रूपमा, हामी तपाईँको डाटालाई जिम्मेवारीपूर्वक र <strong>नेपालको वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५</strong> तथा अन्य प्रचलित कानुनहरूको पूर्ण पालना गर्दै व्यवस्थापन गर्छौँ।</p>
                            <p>Vanijay.com (हाम्रो वेबसाइट र सेवाहरू) प्रयोग गरेर, तपाईँ यस गोपनीयता नीतिमा वर्णन गरिएका अभ्यासहरूसँग सहमत हुनुहुन्छ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">१. हामीले संकलन गर्ने जानकारी</h3>
                            <p>हमले तपाईँलाई सुरक्षित र सहज किनमेल अनुभव प्रदान गर्न आवश्यक जानकारी मात्र संकलन गर्छौँ।</p>
                            <h4 className="text-lg font-semibold mt-4 mb-2">तपाईँले उपलब्ध गराउने जानकारी:</h4>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>नाम, ईमेल, फोन नम्बर, डेलिभरी र बिलिङ ठेगाना।</li>
                                <li>खाता विवरणहरू (युजरनेम, पासवर्ड, र प्राथमिकताहरू)।</li>
                                <li>अर्डरको इतिहास र भुक्तानी जानकारी (हामी सुरक्षित तेस्रो-पक्ष प्रोसेसरहरू प्रयोग गर्छौँ र तपाईँको कार्डको पूर्ण विवरण भण्डारण गर्दैनौँ)।</li>
                                <li>तपाईँले हामीलाई पठाउनुभएको सन्देश, प्रतिक्रिया वा समीक्षाहरू।</li>
                            </ul>
                            <h4 className="text-lg font-semibold mt-4 mb-2">स्वचालित रूपमा संकलन हुने जानकारी:</h4>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>उपकरण र ब्राउजर विवरणहरू (IP ठेगाना, उपकरणको प्रकार, अपरेटिङ सिस्टम)।</li>
                                <li>प्रयोग सम्बन्धी डाटा (भ्रमण गरिएका पृष्ठहरू, बिताएको समय, क्लिकहरू)।</li>
                                <li>डेलिभरी समयको अनुमान सुधार गर्न सामान्य स्थान (IP ठेगाना मार्फत)।</li>
                                <li>कुकिज र समान प्रविधिहरू (विस्तृत जानकारीका लागि हाम्रो <strong>कुकिज नीति</strong> हेर्नुहोस्)।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">२. तपाईँको जानकारीको प्रयोग</h3>
                            <p>हामी तपाईँको डाटा निम्न कार्यका लागि प्रयोग गर्छौँ:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>तपाईँको अर्डरहरू सुरक्षित रूपमा प्रशोधन र डेलिभरी गर्न।</li>
                                <li>तपाईँको खाता व्यवस्थापन गर्न र ग्राहक सहायता प्रदान गर्न।</li>
                                <li>अर्डर सम्बन्धी अपडेट र लेनदेनका सन्देशहरू पठाउन।</li>
                                <li>हाम्रो वेबसाइट, उत्पादन र सेवाहरूमा सुधार ल्याउन।</li>
                                <li>तपाईँको किनमेल अनुभवलाई व्यक्तिगत बनाउन।</li>
                                <li>जालसाजी (Fraud) रोक्न र प्लेटफर्मको सुरक्षा सुनिश्चित गर्न।</li>
                                <li>प्रवर्द्धनात्मक अफरहरू पठाउन (तपाईँको अनुमतिमा मात्र – तपाईँ जुनसुकै बेला यसबाट हट्न सक्नुहुन्छ)।</li>
                                <li>नेपाली कानुनी आवश्यकताहरूको पालना गर्न।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">३. जानकारीको साझेदारी</h3>
                            <p>हामी तपाईँको व्यक्तिगत डाटा कहिल्यै बिक्री गर्दैनौँ। हामी आवश्यक परेको खण्डमा मात्र निम्न पक्षहरूसँग जानकारी साझा गर्छौँ:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>विश्वसनीय सेवा प्रदायकहरू:</strong> (भुक्तानी गेटवे, होस्टिङ, एनालिटिक्स) जो कडा गोपनीयता सम्झौतामा बाँधिएका हुन्छन्।</li>
                                <li><strong>डेलिभरी साझेदारहरू:</strong> नेपालभर तपाईँको अर्डर पुर्‍याउनका लागि।</li>
                                <li><strong>कानुनी निकायहरू:</strong> यदि नेपाली कानुन बमोजिम आवश्यक परेमा।</li>
                                <li><strong>व्यवसाय हस्तान्तरण:</strong> (जस्तै मर्जर वा प्राप्ति) को अवस्थामा।</li>
                                <li>अन्य कुनै पनि उद्देश्यका लागि तपाईँको स्पष्ट सहमति भएमा।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">४. कुकिज र ट्र्याकिङ</h3>
                            <p>हामी तपाईँको अनुभव अझ राम्रो बनाउन – जस्तै तपाईँको कार्ट र प्राथमिकताहरू सम्झन र सान्दर्भिक उत्पादनहरू देखाउन कुकिज प्रयोग गर्छौँ। तपाईँले आफ्नो ब्राउजर सेटिङमा कुकिज व्यवस्थापन वा असक्षम गर्न सक्नुहुन्छ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">५. तपाईँको गोपनीयता अधिकार (नेपाली कानुन अन्तर्गत)</h3>
                            <p>तपाईँलाई निम्न अधिकारहरू छन्:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>पहुँच र अपडेट:</strong> आफ्नो खाता मार्फत जुनसुकै बेला जानकारी हेर्न र सच्याउन सक्नुहुन्छ।</li>
                                <li><strong>मार्केटिङबाट हट्ने:</strong> 'Unsubscribe' लिङ्क प्रयोग गरेर मार्केटिङ ईमेलहरू रोक्न सक्नुहुन्छ।</li>
                                <li><strong>सहमति फिर्ता लिने:</strong> डाटा प्रयोगको सहमति फिर्ता लिन सक्नुहुन्छ (यसले केही सेवाहरूमा सीमितता ल्याउन सक्छ)।</li>
                                <li><strong>डाटा मेटाउने अनुरोध:</strong> कानुनी कारणले राख्नुपर्ने बाहेक अन्य अवस्थामा तपाईँको डाटा मेटाउन अनुरोध गर्न सक्नुहुन्छ।</li>
                            </ul>
                            <p className="mt-4">यी अधिकारहरू प्रयोग गर्न <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a> मा सम्पर्क गर्नुहोस्।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">६. डाटा सुरक्षा</h3>
                            <p>हामी तपाईँको जानकारीलाई अनधिकृत पहुँच, क्षति वा दुरुपयोगबाट जोगाउन इन्क्रिप्सन, सुरक्षित सर्भर र नियमित अडिट जस्ता कडा सुरक्षा उपायहरू प्रयोग गर्छौँ। यद्यपि कुनै पनि अनलाइन प्रणाली १००% सुरक्षित हुँदैन, तर हामी तपाईँको डाटा सुरक्षित राख्न हरेक उचित कदम चाल्छौँ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">७. डाटा कति समयसम्म राख्छौँ?</h3>
                            <p>हामी तपाईँको जानकारी अर्डरहरू, कानुनी पालना, विवाद समाधान वा वैध व्यावसायिक उद्देश्यका लागि आवश्यक भएसम्म मात्र राख्छौँ – जुन नेपाली डाटा संरक्षण कानुन अनुरूप हुन्छ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">८. बालबालिकाको गोपनीयता</h3>
                            <p>Vanijay.com १६ वर्ष मुनिका बालबालिकाका लागि होइन। हामी जानीजानी नाबालिगहरूबाट डाटा संकलन गर्दैनौँ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">९. तेस्रो-पक्ष लिङ्कहरू</h3>
                            <p>हाम्रो साइटमा बाह्य वेबसाइटहरू (जस्तै भुक्तानी साझेदारहरू) का लिङ्कहरू हुन सक्छन्। उनीहरूको गोपनीयता अभ्यासहरू यस नीति अन्तर्गत पर्दैनन् – कृपया उनीहरूको नीति छुट्टै अध्ययन गर्नुहोस्।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">१०. यस नीतिमा परिवर्तन</h3>
                            <p>हामी समय-समयमा यो गोपनीयता नीति अपडेट गर्न सक्छौँ। परिवर्तनहरू नयाँ "अन्तिम परिमार्जन" मिति सहित यहाँ पोस्ट गरिनेछ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">११. सम्पर्क गर्नुहोस्</h3>
                            <p>तपाईँको गोपनीयता वा डाटाको बारेमा केही प्रश्नहरू छन्? हामी मद्दत गर्न तयार छौँ।</p>
                            <address className="not-italic bg-muted p-4 rounded-lg mt-4 border-l-4 border-primary">
                                <strong>Vanijay Enterprises</strong><br />
                                कोशी, सुनसरी, इटहरी<br />
                                ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                फोन: 9761012813<br />
                                सम्पर्क समय: आइतबार–शुक्रबार, बिहान ९ बजे देखि बेलुका ५ बजेसम्म (नेपाल समय)
                            </address>
                            <p className="mt-8 font-medium">Vanijay.com मा सुरक्षित रूपमा किनमेल गर्नुहोस् – सुरक्षित गोपनीयता, छिटो डेलिभरी, सजिलो फिर्ता र देशभर सुरक्षित भुक्तानीको साथ। हामीमाथि विश्वास गर्नुभएकोमा धन्यवाद!</p>
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
