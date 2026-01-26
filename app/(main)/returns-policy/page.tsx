import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ReturnsPolicyPage() {
    return (
        <PolicyLayout title="Return and Refund Policy" lastUpdated="January 23, 2026">
            <div className="space-y-12">
                <section>
                    <div className="bg-muted/30 p-6 md:p-8 rounded-xl border">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">English Version</h2>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p className="mb-6">At Vanijay.com, your satisfaction is our top priority. We want you to shop with confidence on Nepal's trusted online shopping platform.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Quick Overview: Which Products Can Be Returned?</h3>
                            <div className="overflow-x-auto my-6">
                                <table className="min-w-full border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-border p-3 text-left">Product Category</th>
                                            <th className="border border-border p-3 text-left">Returnable?</th>
                                            <th className="border border-border p-3 text-left">Key Conditions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ["Apparel & Clothing", "Yes", "Unworn, unwashed, original tags and packaging intact"],
                                            ["Footwear", "Yes", "Unused, original box, clean soles"],
                                            ["Electronics & Appliances", "Yes", "Original sealed box; may have restocking fee if opened"],
                                            ["Home & Kitchen", "Yes", "Unused with all parts and original packaging"],
                                            ["Books, Media & Music", "Yes", "Original undamaged condition"],
                                            ["Toys & Baby Products", "Yes", "Unused, all parts and safety seals intact"],
                                            ["Jewellery & Watches", "Yes", "Original packaging, tags and certificates"],
                                            ["Sports & Fitness Equipment", "Yes", "Only trial assembly allowed, all parts included"],
                                            ["Beauty & Cosmetics", "No", "Hygiene reasons (return only if defective & sealed)"],
                                            ["Underwear, Lingerie & Socks", "No", "Hygiene reasons (return only if defective)"],
                                            ["Personal Care Items", "No", "Hygiene reasons (return only if defective)"],
                                            ["Perishable Goods (Food, Flowers)", "No", "Non-returnable"],
                                            ["Customized/Made-to-Order Items", "No", "Non-returnable unless defective"],
                                            ["Digital Goods, Software & Gift Cards", "No", "Non-refundable once activated"],
                                            ["Medical Devices", "No", "Hygiene & safety reasons (return only if defective)"],
                                        ].map(([category, returnable, conditions], idx) => (
                                            <tr key={idx} className={idx % 2 === 1 ? "bg-muted/50" : ""}>
                                                <td className="border border-border p-3 font-medium">{category}</td>
                                                <td className={`border border-border p-3 font-bold ${returnable === "Yes" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{returnable}</td>
                                                <td className="border border-border p-3 text-sm">{conditions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">1. When Can You Return a Product?</h3>
                            <p>You can request a return within <strong>5 days</strong> from the date you receive your order if:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The product is unused, in original condition, with all tags, packaging, accessories, and free gifts.</li>
                                <li>You have your order number or invoice.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Valid Reasons for Return & Refund</h3>
                            <p>We accept returns for:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Defective or Damaged Product</strong> – Faulty, broken, or not working.</li>
                                <li><strong>Wrong Item Delivered</strong> – Different from what you ordered.</li>
                                <li><strong>Missing Parts</strong> – Item is incomplete.</li>
                                <li><strong>Change of Mind</strong> – You simply don't want it anymore (only for returnable categories). Note: You will pay return shipping cost in this case.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Non-Returnable Cases</h3>
                            <p>Returns will not be accepted if:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Product is used, washed, altered, or damaged by customer.</li>
                                <li>Original packaging, tags, or accessories are missing.</li>
                                <li>Return request is made after 5 days.</li>
                                <li>Item belongs to non-returnable categories listed above.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">4. How to Return a Product (Simple Steps)</h3>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li><strong>Contact Us Quickly</strong> – Log in to your account → Go to “My Orders” or email/call us within 5 days.</li>
                                <li><strong>Get Approval</strong> – We will give you a Return Authorization Number (RAN) and return address.</li>
                                <li><strong>Pack & Ship</strong> – Pack the item securely in original packaging. Write the RAN clearly on the package. Send it back using a reliable courier (we recommend tracking). We are not responsible for lost returns.</li>
                            </ol>
                            <address className="not-italic bg-muted p-4 rounded-lg mt-4">
                                <strong>Contact Details:</strong><br />
                                Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                Phone: 9761012813<br />
                                (Support available Sunday–Friday, 9 AM – 5 PM Nepal Time)
                            </address>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Inspection & Processing Time</h3>
                            <p>After we receive your return:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Our team will check the item (takes 5–7 business days).</li>
                                <li>You will get an email update on approval or rejection.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Refunds</h3>
                            <p>If approved:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Refund processed within <strong>5–10 business days</strong>.</li>
                                <li>Money returned to your original payment method (Digital (most preferred) or physical payment method).</li>
                                <li>Bank or wallet may take extra time to show the refund.</li>
                            </ul>
                            <p className="mt-4"><strong>Deductions (if any):</strong></p>
                            <ul className="list-disc pl-6 space-y-2 text-sm italic">
                                <li>Return shipping cost (for Change of Mind).</li>
                                <li>Restocking fee (only if mentioned on product page).</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Exchanges</h3>
                            <p>We offer exchanges for:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Defective, damaged, or wrong items.</li>
                                <li>Size issues in clothing/footwear (if stock available).</li>
                            </ul>
                            <p>If the replacement is not in stock, we will give you a full refund instead.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Order Cancellation</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You can cancel free of charge before the order is shipped.</li>
                                <li>Contact us immediately.</li>
                                <li>Once shipped, follow the return process above.</li>
                            </ul>

                            <address className="not-italic bg-muted p-4 rounded-lg mt-8">
                                <strong>Vanijay Enterprises</strong><br />
                                Koshi, Sunsari, Itahari<br />
                                Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                Phone: 9761012813
                            </address>
                            <p className="mt-8 font-medium">Shop worry-free at Vanijay.com – Nepal's reliable online store with easy returns, secure payment, and fast delivery across Nepal! Thank you for choosing us.</p>
                        </div>
                    </div>

                    <div className="mt-12 bg-muted/30 p-6 md:p-8 rounded-xl border border-primary/20">
                        <h2 className="text-2xl font-bold mb-6 text-primary border-b border-primary/20 pb-2">Nepali Translation (फिर्ता र रिफन्ड नीति)</h2>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed">
                            <p className="font-semibold mb-6">अन्तिम परिमार्जन: डिसेम्बर २२, २०२५</p>
                            <p>Vanijay.com मा, तपाईँको सन्तुष्टि नै हाम्रो मुख्य प्राथमिकता हो। हामी चाहन्छौँ कि तपाईँ नेपालको यो भरपर्दो अनलाइन सपिङ प्लेटफर्ममा ढुक्क भएर किनमेल गर्नुहोस्।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">संक्षिप्त जानकारी: कुन सामानहरू फिर्ता गर्न सकिन्छ?</h3>
                            <div className="overflow-x-auto my-6">
                                <table className="min-w-full border-collapse border border-primary/20">
                                    <thead>
                                        <tr className="bg-primary/10">
                                            <th className="border border-primary/20 p-3 text-left">उत्पादनको विधा (Product Category)</th>
                                            <th className="border border-primary/20 p-3 text-left">फिर्ता गर्न मिल्ने, नमिल्ने?</th>
                                            <th className="border border-primary/20 p-3 text-left">मुख्य सर्तहरू</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ["लुगाफाटा (Apparel & Clothing)", "मिल्ने", "नलगाएको, नधोएको, ओरिजिनल ट्याग र प्याकेजिङ दुरुस्त भएको"],
                                            ["जुत्ताचप्पल (Footwear)", "मिल्ने", "प्रयोग नगरिएको, ओरिजिनल बक्स भएको, पैताला सफा भएको"],
                                            ["इलेक्ट्रोनिक्स र उपकरणहरू", "मिल्ने", "ओरिजिनल सिलबन्दी बक्स; बक्स खोलेको खण्डमा रिस्टोकिङ शुल्क लाग्न सक्छ"],
                                            ["घर र भान्साका सामानहरू", "मिल्ने", "प्रयोग नगरिएको र सबै पार्टपुर्जाहरू ओरिजिनल प्याकेजिङमा भएको"],
                                            ["किताब, मिडिया र संगीत", "मिल्ने", "ओरिजिनल र कुनै क्षति नभएको अवस्थामा"],
                                            ["खेलौना र बच्चाका सामानहरू", "मिल्ने", "प्रयोग नगरिएको, सबै पार्टपुर्जाहरू र सुरक्षा सिल (Safety Seals) दुरुस्त भएको"],
                                            ["गहना र घडीहरू", "मिल्ने", "ओरिजिनल प्याकेजिङ, ट्याग र प्रमाणपत्रहरू सहित"],
                                            ["खेलकुद र फिटनेस सामग्री", "मिल्ने", "जडान गरेर परीक्षण मात्र गरिएको, सबै पार्टपुर्जाहरू भएको"],
                                            ["सौन्दर्य र प्रसाधन (Beauty & Cosmetics)", "नमिल्ने", "सरसफाइ र स्वास्थ्यको कारणले (त्रुटिपूर्ण र सिल नखोलिएको भए मात्र फिर्ता हुने)"],
                                            ["भित्री लुगा र मोजाहरू", "नमिल्ने", "सरसफाइको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)"],
                                            ["व्यक्तिगत हेरचाहका सामानहरू", "नमिल्ने", "सरसफाइको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)"],
                                            ["चाँडै बिग्रने सामान (खाना, फूल)", "नमिल्ने", "फिर्ता नहुने"],
                                            ["अर्डर अनुसार बनाइएका सामानहरू", "नमिल्ने", "त्रुटिपूर्ण बाहेक अन्य अवस्थामा फिर्ता नहुने"],
                                            ["डिजिटल सामान, सफ्टवेयर र गिफ्ट कार्ड", "नमिल्ने", "एक्टिभेट (Activate) भइसकेपछि रिफन्ड नहुने"],
                                            ["मेडिकल उपकरणहरू", "नमिल्ने", "स्वास्थ्य र सुरक्षाको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)"],
                                        ].map(([category, returnable, conditions], idx) => (
                                            <tr key={idx} className={idx % 2 === 1 ? "bg-primary/5" : ""}>
                                                <td className="border border-primary/20 p-3 font-semibold">{category}</td>
                                                <td className={`border border-primary/20 p-3 font-bold ${returnable === "मिल्ने" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{returnable}</td>
                                                <td className="border border-primary/20 p-3 text-sm">{conditions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-bold mt-8 mb-4">१. तपाईँले उत्पादन कहिले फिर्ता गर्न सक्नुहुन्छ?</h3>
                            <p>तपाईँले सामान प्राप्त गरेको <strong>५ दिनभित्र</strong> फिर्ताको अनुरोध गर्न सक्नुहुन्छ यदि:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>उत्पादन प्रयोग नगरिएको, ओरिजिनल अवस्थामा, र सबै ट्याग, प्याकेजिङ, एसेसरिज र उपहारहरू (Free Gifts) सहित छ भने।</li>
                                <li>तपाईँसँग अर्डर नम्बर वा बीजक (Invoice) छ भने।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">२. फिर्ता र रिफन्डका लागि मान्य कारणहरू</h3>
                            <p>हामी निम्न अवस्थामा फिर्ता स्वीकार गर्छौँ:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>त्रुटिपूर्ण वा क्षतिग्रस्त उत्पादन:</strong> सामान बिग्रिएको, फुटेको वा नचल्ने भएमा।</li>
                                <li><strong>गलत सामान डेलिभरी:</strong> तपाईँले अर्डर गरेको भन्दा फरक सामान आएमा।</li>
                                <li><strong>सामान छुटेको भए:</strong> सामानका कुनै पार्टपुर्जाहरू अपुरो भएमा।</li>
                                <li><strong>मन परिवर्तन भएमा (Change of Mind):</strong> यदि तपाईँलाई सामान मन परेन भने (फिर्ता गर्न मिल्ने विधाहरूमा मात्र)। <em>द्रष्टव्य: यस अवस्थामा फिर्ता गर्दा लाग्ने ढुवानी खर्च तपाईँ आफैँले बेहोर्नुपर्नेछ।</em></li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">३. फिर्ता स्वीकार नगरिने अवस्थाहरू</h3>
                            <p>निम्न अवस्थामा सामान फिर्ता लिइने छैन:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ग्राहकले प्रयोग गरेको, धोएको, परिवर्तन गरेको वा क्षति पुर्‍याएको सामान।</li>
                                <li>ओरिजिनल प्याकेजिङ, ट्याग वा एसेसरिजहरू नभएको।</li>
                                <li>सामान पाएको ५ दिनपछि फिर्ताको अनुरोध गरिएको।</li>
                                <li>माथि उल्लेखित 'फिर्ता नहुने' विधाका सामानहरू।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">४. सामान फिर्ता गर्ने तरिका (सजिलो चरणहरू)</h3>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li><strong>छिटो सम्पर्क गर्नुहोस्</strong>: आफ्नो अकाउन्टमा लग-इन गरी "My Orders" मा जानुहोस् वा ५ दिनभित्र हामीलाई ईमेल/फोन गर्नुहोस्।</li>
                                <li><strong>स्वीकृति लिनुहोस्</strong>: हामी तपाईँलाई 'रिटर्न अथोराइजेसन नम्बर' (RAN) र फिर्ता गर्ने ठेगाना उपलब्ध गराउनेछौँ।</li>
                                <li><strong>प्याक र पठाउनुहोस्</strong>: सामानलाई सुरक्षित रूपमा ओरिजिनल प्याकेजिङमा राख्नुहोस्। प्याकेजमा RAN नम्बर स्पष्टसँग लेख्नुहोस्। भरपर्दो कुरियर मार्फत पठाउनुहोस् (ट्र्याकिङ सुविधा भएको राम्रो)। हराएको सामानको लागि हामी जिम्मेवार हुने छैनौँ।</li>
                            </ol>
                            <address className="not-italic bg-muted p-4 rounded-lg mt-4 border-l-4 border-primary">
                                <strong>सम्पर्क विवरण:</strong><br />
                                ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                फोन: 9761012813<br />
                                (सम्पर्क समय: आइतबार–शुक्रबार, बिहान ९ बजे देखि बेलुका ५ बजेसम्म, नेपाल समय)
                            </address>

                            <h3 className="text-xl font-bold mt-8 mb-4">५. निरीक्षण र प्रक्रिया लाग्ने समय</h3>
                            <p>हामीले फिर्ता आएको सामान प्राप्त गरेपछि:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>हाम्रो टोलीले सामानको जाँच गर्नेछ (यसका लागि ५-७ कार्यदिन लाग्न सक्छ)।</li>
                                <li>सामान स्वीकृत वा अस्वीकृत भएको जानकारी तपाईँलाई ईमेल मार्फत दिइनेछ।</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4">६. रिफन्ड (Refund)</h3>
                            <p>यदि फिर्ता स्वीकृत भयो भने:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>५-१० कार्यदिन भित्र रिफन्ड प्रक्रिया अगाडि बढाइनेछ।</li>
                                <li>रकम तपाईँको सुरुको भुक्तानी माध्यम (Digital or physical) मा फिर्ता गरिनेछ।</li>
                                <li>बैंक वा वालेटमा रकम देखिन थप केही समय लाग्न सक्छ।</li>
                            </ul>
                            <p className="mt-4"><strong>कटौती (यदि भएमा):</strong></p>
                            <p className="text-sm italic">
                                - फिर्ता ढुवानी खर्च (मन परिवर्तन भएको खण्डमा)।<br />
                                - रिस्टोकिङ शुल्क (यदि उत्पादनको पेजमा उल्लेख गरिएको छ भने)।
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4">७. साटफेर (Exchanges)</h3>
                            <p>हामी निम्न अवस्थामा सामान साटफेर गरिदिन्छौँ:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>त्रुटिपूर्ण, क्षतिग्रस्त वा गलत सामान आएमा।</li>
                                <li>लुगा वा जुत्तामा साइजको समस्या भएमा (स्टक उपलब्ध भएमा)।</li>
                            </ul>
                            <p>यदि साट्नका लागि सामान स्टकमा छैन भने, हामी तपाईँलाई पूर्ण रिफन्ड दिनेछौँ।</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">८. अर्डर रद्द गर्ने (Order Cancellation)</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>सामान पठाउनु (Ship) अघि तपाईँले नि:शुल्क अर्डर रद्द गर्न सक्नुहुन्छ।</li>
                                <li>यसका लागि तुरुन्त हामीलाई सम्पर्क गर्नुहोस्।</li>
                                <li>सामान पठाइसकिएको छ भने, माथि उल्लेखित फिर्ता प्रक्रिया पालना गर्नुपर्नेछ।</li>
                            </ul>

                            <address className="not-italic bg-muted p-4 rounded-lg mt-8 border-l-4 border-primary">
                                <strong>Vanijay Enterprises</strong><br />
                                कोशी, सुनसरी, इटहरी<br />
                                ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-primary hover:underline">vanijayenterprises@gmail.com</a><br />
                                फोन: 9761012813
                            </address>
                            <p className="mt-8 font-medium">Vanijay.com मा ढुक्क भएर किनमेल गर्नुहोस् – सजिलो फिर्ता प्रक्रिया, सुरक्षित भुक्तानी र देशभर द्रुत डेलिभरीको साथ! हामीलाई रोज्नुभएकोमा धन्यवाद।</p>
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
