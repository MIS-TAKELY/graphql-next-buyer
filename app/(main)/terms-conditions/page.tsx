// components/TermsAndConditions.tsx
import { Metadata } from 'next';
import React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vanijay.com';

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Read the terms and conditions for using the Vanijay e-commerce platform.",
    alternates: {
        canonical: `${baseUrl}/terms-conditions`,
    }
};

const TermsAndConditions = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 prose prose-slate dark:prose-invert">
            {/* English Version */}
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                Terms and Conditions - Vanijay.com Online Shopping Platform
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                Last Updated: December 22, 2025
            </p>

            <p>
                Welcome to Vanijay.com! This is Nepal's online shopping website where you can easily purchase products. By using this platform (website and related services) operated by Vanijay Enterprises, you agree to these Terms and Conditions, Privacy Policy, Return and Refund Policy, and Shipping Policy.
            </p>
            <p>
                If you do not agree to these terms, we kindly request that you avoid conducting business here. These terms form a legal agreement between you and Vanijay Enterprises.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">1. Eligibility for Use</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You must be at least 16 years old and capable of entering into a legally binding contract under Nepalese law.</li>
                <li>If you are under 16 years old, you may use the platform only under the supervision of a parent or legal guardian.</li>
                <li>By using the platform, you represent that you meet these eligibility requirements.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">2. Account Registration and Security</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You may need to create an account to access certain features. Provide accurate, complete, and up-to-date information during registration.</li>
                <li>Keeping your account password confidential is your responsibility. You are responsible for all activities on your account.</li>
                <li>Notify us immediately of any unauthorized use.</li>
                <li>We may suspend or terminate your account if any information provided is false or misleading.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">3. Products, Pricing, and Availability</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Products, descriptions, images, and prices shown on the platform may change without notice.</li>
                <li>We may discontinue any product at any time.</li>
                <li>Prices are in Nepalese Rupees and include VAT (as per Nepalese law).</li>
                <li>If there is a pricing error, we reserve the right to cancel the order.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">4. Orders and Payment</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Placing an order is an offer to purchase. We may accept or reject it for any reason.</li>
                <li>Payment Options: Online banking, cards, digital wallets (such as eSewa, Khalti), or Cash on Delivery (COD).</li>
                <li>All payments are processed through secure third-party gateways. We do not store your full card details.</li>
                <li>As per Nepal's e-commerce laws, you are entitled to a full refund if the product does not match the description.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">5. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Delivery times are estimates only and not guaranteed.</li>
                <li>We are not responsible for delays caused by shipping companies or other reasons.</li>
                <li>Our full Shipping Policy applies.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">6. Returns, Refunds, and Cancellations</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Returns and refunds are governed by our Return and Refund Policy.</li>
                <li>You can cancel an order free of charge before shipping. After shipping, the return policy applies.</li>
                <li>As per Nepalese law, we accept unconditional returns and provide full refunds if the product does not match the description.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">7. User Conduct and Prohibited Activities</h2>
            <p>You must not use the platform to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Violate any law.</li>
                <li>Infringe on our or others' intellectual property rights.</li>
                <li>Post false, misleading, or harmful content.</li>
                <li>Spread viruses or harmful technologies.</li>
                <li>Use robots or automated tools without permission.</li>
                <li>Compromise the platform's security.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">8. Intellectual Property</h2>
            <p>
                All content on the platform (logos, text, images, etc.) is the property of Vanijay Enterprises or its suppliers.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">9. Warranties and Limitation of Liability</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The platform and products are provided "as is" without any warranties.</li>
                <li>To the extent permitted by Nepalese law, we are not liable for indirect losses (such as lost profits).</li>
                <li>Our total liability is limited to the amount you paid in the last 6 months.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">10. Indemnification</h2>
            <p>
                You agree to protect Vanijay Enterprises from any claims, losses, or expenses arising from your use of the platform, breach of these terms, or violation of others' rights.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">11. Termination</h2>
            <p>
                We may immediately suspend or terminate your account or access for any reason.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">12. Governing Law and Dispute Resolution</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>These terms are governed by the laws of Nepal.</li>
                <li>Disputes will first be attempted to be resolved through mutual discussion. If unresolved, they will be settled by arbitration under Nepal's arbitration rules.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">13. Changes to Terms</h2>
            <p>
                We may change these terms at any time. Continued use after changes means you accept the new terms.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">14. Contact</h2>
            <p>
                For any questions:
            </p>
            <address className="not-italic">
                Vanijay Enterprises<br />
                Koshi, Sunsari, Itahari<br />
                Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
                Phone: 9761012813
            </address>

            <p className="mt-10 text-center italic">
                Vanijay.com is Nepal's best online shopping site, offering secure payments, fast delivery, and easy returns. Thank you!
            </p>

            {/* Simplified Nepali Translation */}
            <div className="mt-20 border-t pt-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                    नियम तथा शर्तहरू - Vanijay.com अनलाइन सपिङ प्लेटफर्म
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
                    अन्तिम परिमार्जन: डिसेम्बर २२, २०२५
                </p>

                <p>
                    Vanijay.com मा तपाईंलाई स्वागत छ! यो नेपालको एक अनलाइन सपिङ वेबसाइट हो जहाँ तपाईं सजिलैसँग सामानहरू खरिद गर्न सक्नुहुन्छ। वाणिज्य इन्टरप्राइजेज (Vanijay Enterprises) द्वारा सञ्चालित यस प्लेटफर्म (वेबसाइट र सम्बन्धित सेवाहरू) प्रयोग गरेर, तपाईं यी नियम तथा शर्तहरू, गोपनीयता नीति, फिर्ता र रिफन्ड नीति, र ढुवानी (Shipping) नीतिमा सहमत हुनुहुन्छ।
                </p>
                <p>
                    यदि तपाईं यी शर्तहरूसँग सहमत हुनुहुन्न भने, हामी तपाईंलाई यहाँबाट व्यवसाय नगर्नु हुन विनम्र अनुरोध गर्दछौं। यी शर्तहरू तपाईं र वाणिज्य इन्टरप्राइजेज बीचको कानुनी सम्झौता हुन्।
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">१. प्रयोगको लागि योग्यता</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>तपाईं कम्तिमा १६ वर्ष पूरा भएको र नेपाली कानुन बमोजिम कानुनी रूपमा बाध्यकारी सम्झौता गर्न सक्षम हुनुपर्छ।</li>
                    <li>यदि तपाईं १६ वर्षभन्दा कम उमेरको हुनुहुन्छ भने, तपाईंले आमाबाबु वा कानुनी अभिभावकको रेखदेखमा मात्र यो प्लेटफर्म प्रयोग गर्न सक्नुहुन्छ।</li>
                    <li>प्लेटफर्म प्रयोग गरेर, तपाईं यी योग्यताका आवश्यकताहरू पूरा गर्नुहुन्छ भनी पुष्टि गर्नुहुन्छ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">२. खाता दर्ता र सुरक्षा</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>केही सुविधाहरू प्रयोग गर्न तपाईंले खाता खोल्नु पर्ने हुन सक्छ। दर्ता गर्दा सही, पूर्ण र अद्यावधिक जानकारी उपलब्ध गराउनुहोस्।</li>
                    <li>आफ्नो खाताको पासवर्ड गोप्य राख्ने जिम्मेवारी तपाईंको हुनेछ। तपाईंको खातामा हुने सबै गतिविधिहरूको लागि तपाईं जिम्मेवार हुनुहुन्छ।</li>
                    <li>कुनै पनि अनाधिकृत प्रयोगको बारेमा हामीलाई तुरुन्त जानकारी दिनुहोस्।</li>
                    <li>यदि उपलब्ध गराइएको कुनै पनि जानकारी गलत वा भ्रामक पाइएमा हामी तपाईंको खाता निलम्बन वा बन्द गर्न सक्छौं।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">३. उत्पादन, मूल्य निर्धारण र उपलब्धता</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>प्लेटफर्ममा देखाइएका उत्पादनहरू, विवरणहरू, चित्रहरू र मूल्यहरू बिना सूचना परिवर्तन हुन सक्छन्।</li>
                    <li>हामीले कुनै पनि समयमा कुनै पनि उत्पादन बिक्री गर्न बन्द गर्न सक्छौं।</li>
                    <li>मूल्यहरू नेपाली रुपैयाँमा छन् र यसमा भ्याट (नेपाली कानुन अनुसार) समावेश छ।</li>
                    <li>यदि मूल्य निर्धारणमा कुनै त्रुटि भएमा, हामीसँग अर्डर रद्द गर्ने अधिकार सुरक्षित छ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">४. अर्डर र भुक्तानी</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>अर्डर गर्नु भनेको खरिद गर्ने प्रस्ताव हो। हामी कुनै पनि कारणले यसलाई स्वीकार वा अस्वीकार गर्न सक्छौं।</li>
                    <li>भुक्तानी विकल्पहरू: अनलाइन बैंकिङ, कार्डहरू, डिजिटल वालेटहरू (जस्तै eSewa, Khalti), वा डेलिभरीमा नगद (COD)।</li>
                    <li>सबै भुक्तानीहरू सुरक्षित तेस्रो-पक्ष गेटवेहरू मार्फत प्रक्रिया गरिन्छ। हामी तपाईंको कार्डको पूर्ण विवरणहरू भण्डारण गर्दैनौं।</li>
                    <li>नेपालको इ-कमर्स कानुन अनुसार, यदि उत्पादन विवरणसँग मेल खाँदैन भने तपाईं पूर्ण रिफन्ड (रकम फिर्ता) पाउन योग्य हुनुहुन्छ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">५. ढुवानी र डेलिभरी</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>डेलिभरी समय अनुमानित मात्र हो र यसको ग्यारेन्टी छैन।</li>
                    <li>ढुवानी कम्पनीहरू वा अन्य कारणहरूले गर्दा हुने ढिलाइको लागि हामी जिम्मेवार छैनौं।</li>
                    <li>हाम्रो पूर्ण ढुवानी नीति लागू हुनेछ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">६. फिर्ता, रिफन्ड र खारेजी</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>फिर्ता र रिफन्ड प्रक्रिया हाम्रो 'फिर्ता र रिफन्ड नीति' द्वारा शासित हुन्छन्।</li>
                    <li>तपाईंले सामान ढुवानी (Shipping) हुनु अघि नि:शुल्क अर्डर रद्द गर्न सक्नुहुन्छ। ढुवानी पछि भने फिर्ता नीति लागू हुनेछ।</li>
                    <li>नेपाली कानुन अनुसार, यदि उत्पादन विवरणसँग मेल खाँदैन भने हामी बिना शर्त फिर्ता स्वीकार गर्छौं र पूर्ण रिफन्ड प्रदान गर्छौं।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">७. प्रयोगकर्ताको आचरण र निषेधित गतिविधिहरू</h2>
                <p>तपाईंले प्लेटफर्मलाई निम्न कार्यका लागि प्रयोग गर्नु हुँदैन:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>कुनै पनि कानुनको उल्लंघन गर्न।</li>
                    <li>हाम्रो वा अरूको बौद्धिक सम्पत्ति अधिकारको उल्लंघन गर्न।</li>
                    <li>गलत, भ्रामक, वा हानिकारक सामग्री पोस्ट गर्न।</li>
                    <li>भाइरस वा हानिकारक प्रविधिहरू फैलाउन।</li>
                    <li>अनुमति बिना रोबोट वा स्वचालित उपकरणहरू प्रयोग गर्न।</li>
                    <li>प्लेटफर्मको सुरक्षामा खलल पुर्‍याउन।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">८. बौद्धिक सम्पत्ति</h2>
                <p>
                    यस प्लेटफर्ममा भएका सबै सामग्रीहरू (लोगो, पाठ, चित्र, आदि) वाणिज्य इन्टरप्राइजेज वा यसका आपूर्तिकर्ताहरूको सम्पत्ति हुन्।
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">९. वारेन्टी र दायित्वको सीमा</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>यो प्लेटफर्म र उत्पादनहरू कुनै पनि वारेन्टी बिना "जस्तो छ" (As is) आधारमा उपलब्ध गराइन्छ।</li>
                    <li>नेपाली कानुनले अनुमति दिएको हदसम्म, हामी अप्रत्यक्ष नोक्सानी (जस्तै नाफा नोक्सान) को लागि जिम्मेवार हुने छैनौं।</li>
                    <li>हाम्रो कुल दायित्व तपाईंले पछिल्लो ६ महिनामा तिर्नुभएको रकममा सीमित हुनेछ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">१०. क्षतिपूर्ति (Indemnification)</h2>
                <p>
                    तपाईं प्लेटफर्मको प्रयोग, यी शर्तहरूको उल्लंघन, वा अरूको अधिकारको उल्लंघनबाट उत्पन्न हुने कुनै पनि दावी, नोक्सानी वा खर्चहरूबाट वाणिज्य इन्टरप्राइजेजलाई सुरक्षित राख्न सहमत हुनुहुन्छ।
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">११. खारेजी (Termination)</h2>
                <p>
                    हामी कुनै पनि कारणले तपाईंको खाता वा पहुँच तुरुन्तै निलम्बन वा बन्द गर्न सक्छौं।
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">१२. लागू हुने कानुन र विवाद समाधान</h2>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>यी शर्तहरू नेपालको कानुनद्वारा शासित छन्।</li>
                    <li>विवादहरूलाई पहिले आपसी छलफल मार्फत समाधान गर्ने प्रयास गरिनेछ। यदि समाधान नभएमा, तिनीहरू नेपालको मध्यस्थता नियमहरू (Arbitration rules) अन्तर्गत समाधान गरिनेछ।</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">१३. शर्तहरूमा परिवर्तन</h2>
                <p>
                    हामी कुनै पनि समयमा यी शर्तहरू परिवर्तन गर्न सक्छौं। परिवर्तन पछि निरन्तर प्रयोग गर्नुको अर्थ तपाईं नयाँ शर्तहरूमा सहमत हुनुहुन्छ भन्ने हो।
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">१४. सम्पर्क</h2>
                <p>
                    कुनै पनि प्रश्नहरूको लागि:
                </p>
                <address className="not-italic">
                    वाणिजय इन्टरप्राइजेज<br />
                    कोशी, सुनसरी, इटहरी<br />
                    इमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
                    फोन: ९७६१०१२८१३
                </address>

                <p className="mt-10 text-center italic">
                    Vanijay.com सुरक्षित भुक्तानी, द्रुत डेलिभरी, र सजिलो फिर्ताको सुविधा दिने नेपालको उत्कृष्ट अनलाइन सपिङ साइट हो। धन्यवाद!
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;