import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us - Vanijay | Zero Seller Charges | Best Prices in Nepal",
    description: "Learn about Vanijay, Nepal's premier online shopping platform. We offer the best prices on electronics, fashion, and home goods with zero charges for sellers.",
    openGraph: {
        title: "About Vanijay - Revolutionizing E-Commerce in Nepal",
        description: "Zero seller fees, best prices for buyers. Join the Vanijay revolution today.",
    }
};

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <h1 className="text-4xl font-extrabold text-primary mb-8">About Vanijay</h1>

                    <p>
                        Vanijay is a digital commerce platform in Nepal to enable people across the country to buy and sell
                        products and services eliminating unnecessary barriers to trade. We are committed to make
                        commerce more accessible, affordable, and inclusive, empowering individuals and businesses to
                        elevate through fair participation in the digital economy.
                    </p>
                    <p>
                        We believe that meaningful economic growth happens when opportunity is not limited by location,
                        scale, or background. Vanijay exists to make that opportunity practical and reachable.
                    </p>
                    <p>
                        The commercial landscape in Nepal is currently constrained by structural inefficiencies that hinder
                        equitable growth. Key challenges include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Geographic Disparity: A significant gap in product availability between urban hubs and rural regions.</li>
                        <li>Inflated Cost Structures: Layered intermediary costs and high platform fees that drive up end-user prices.</li>
                        <li>Market Concentration: High barriers to entry that favor established entities while marginalizing smaller independent sellers.</li>
                        <li>Information Asymmetry: A lack of standardized product data, which undermines consumer confidence and complicates the decision-making process.</li>
                    </ul>
                    <p>
                        Vanijay is founded on the fundamental principle that commerce should be accessible to everyone .
                        We translate this belief into a robust operational framework designed to empower both sellers and
                        consumers:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Inclusive Entrepreneurship: Enabling individuals to list products and services without prohibitive entry costs.</li>
                        <li>Direct-to-Consumer Value: Facilitating transparent pricing by fostering direct participation between buyers and sellers.</li>
                        <li>Nationwide & Global Reach: Bridging geographic divides to enable trade from any corner of Nepal, including support for international orders.</li>
                        <li>Risk Mitigation: Enhancing consumer confidence through Cash on Delivery (COD) and a diverse suite of secure, flexible payment solutions.</li>
                    </ul>
                    <p>Our commitment is not merely a promise; it is the structural foundation of how we operate.</p>

                    <h2 className="text-2xl font-bold text-primary mt-8">Our Core Pillars</h2>

                    <h3 className="text-xl font-bold mt-6">1. Inclusive Accessibility</h3>
                    <p>We dismantle traditional gatekeeping and market exclusivity, ensuring that individual entrepreneurs and small-scale sellers can compete on a level playing field—regardless of their size or location.</p>

                    <h3 className="text-xl font-bold mt-6">2. Equitable Pricing Models</h3>
                    <p>We focus on lean operational costs to minimize platform overhead. This enables sellers to offer competitive pricing and ensures buyers pay for the inherent value of the product, rather than inflated margins.</p>

                    <h3 className="text-xl font-bold mt-6">3. Decentralized Nationwide Reach</h3>
                    <p>Our infrastructure is designed to bridge the urban-rural divide. By facilitating seamless transactions across Nepal and beyond, we expand market access and eliminate the limitations of geography.</p>

                    <h3 className="text-xl font-bold mt-6">4. Information Integrity & Transparency</h3>
                    <p>We prioritize comprehensive and standardized product data. By fostering clarity, we empower buyers to make informed decisions and help sellers cultivate long-term brand equity and trust.</p>

                    <h3 className="text-xl font-bold mt-6">5. Transactional Flexibility & Security</h3>
                    <p>By integrating Cash on Delivery (COD) alongside a diverse suite of digital payment options, we provide a secure, low-risk environment that prioritizes user choice and financial confidence.</p>

                    <h2 className="text-2xl font-bold text-primary mt-12">Trust and Credibility</h2>
                    <p>Vanijay builds confidence through systems designed for the Nepali market.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Built locally, for local realities: Developed by a Nepal-based team with a deep understanding of domestic commerce challenges.</li>
                        <li>Inclusive by design: Our platform serves both urban and rural users, regardless of location or level of digital familiarity.</li>
                        <li>Risk-mitigated transactions: COD and secure payment gateways lower entry barriers for first-time digital buyers.</li>
                        <li>User-driven evolution: We continuously refine our processes based on real user feedback and changing economic needs.</li>
                    </ul>
                    <p>At Vanijay, trust is not assumed—it is earned through consistent, transparent execution.</p>
                    <p>
                        Vanijay is built by local builders who have experienced firsthand the friction, inefficiencies, and
                        exclusions of traditional commerce in Nepal. The platform was created to serve the many—not just
                        the few—by ensuring technology acts as a bridge to opportunity rather than a barrier.
                    </p>
                    <p>
                        We are committed to empowering individual entrepreneurs and small businesses, helping them grow
                        with dignity, fairness, and access.
                    </p>
                    <p>Vanijay is designed to support you from your very first transaction.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Discover the marketplace: Explore products and services from across Nepal.</li>
                        <li>Start selling: List your products or services with low entry barriers.</li>
                        <li>Trade securely: Buy and sell in a transparent, reliable, and flexible environment.</li>
                    </ul>

                    <hr className="my-12" />

                    <h2 className="text-2xl font-bold text-primary">Nepali</h2>
                    <h1 className="text-3xl font-extrabold text-primary mb-8">वाणिजय (Vanijay) को बारेमा</h1>

                    <p>
                        वाणिजय नेपालको एउटा डिजिटल कमर्स प्लेटफर्म हो, जसले व्यापारका अनावश्यक बाधाहरूलाई हटाउँदै
                        देशभरका मानिसहरूलाई वस्तु तथा सेवाहरू खरिद-बिक्री गर्न सक्षम बनाउँछ। हामी डिजिटल अर्थतन्त्रमा निष्पक्ष
                        सहभागितामार्फत व्यक्ति र व्यवसायहरूलाई माथि उठाउन तथा वाणिजयलाई थप सुलभ, किफायती र समावेशी
                        बनाउन प्रतिबद्ध छौँ।
                    </p>
                    <p>
                        हाम्रो विश्वास छ कि वास्तविक आर्थिक वृद्धि तब मात्र सम्भव हुन्छ जब अवसरहरू स्थान, स्तर वा
                        पृष्ठभूमिका आधारमा सीमित हुँदैनन्। वाणिजय ती अवसरहरूलाई व्यवहारिक र पहुँचयोग्य बनाउनका लागि
                        अस्तित्वमा आएको हो।
                    </p>
                    <p>
                        नेपालको व्यापारिक क्षेत्र हाल संरचनागत असक्षमताहरूले घेरिएको छ, जसले समन्यायिक वृद्धिलाई रोकिरहेको
                        छ।
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>भौगोलिक असमानता: सहरी क्षेत्र र ग्रामीण भेगका बीचमा वस्तुको उपलब्धतामा ठुलो खाडल।</li>
                        <li>मूल्य संरचनामा भार: धेरै तहका बिचौलिया र उच्च प्लेटफर्म शुल्कका कारण उपभोक्ताले महँगो मूल्य तिर्नुपर्ने अवस्था।</li>
                        <li>बजारको केन्द्रीकरण: ठुला व्यापारीहरूलाई मात्र फाइदा हुने र साना स्वतन्त्र बिक्रेताहरूलाई पाखा लगाउने खालका कठिन प्रवेश द्वारहरू।</li>
                        <li>सूचनाको अस्पष्टता: उत्पादनको बारेमा स्पष्ट र आधिकारिक जानकारीको अभाव, जसले गर्दा खरिदकर्ताको विश्वास घट्ने र निर्णय लिन कठिन हुने गर्दछ।</li>
                    </ul>
                    <p>
                        वाणिजय "व्यापारमा सबैको पहुँच हुनुपर्छ" भन्ने आधारभूत सिद्धान्तमा स्थापना भएको हो। हामी यस
                        विश्वासलाई बिक्रेता र उपभोक्ता दुवैलाई सशक्त बनाउने एउटा बलियो कार्यढाँचामा उतार्छौं:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>समावेशी उद्यमशीलता: कुनै पनि व्यक्तिलाई उच्च प्रवेश शुल्क बिना आफ्ना वस्तु वा सेवाहरू सूचीकृत गर्न सक्षम बनाउने।</li>
                        <li>उपभोक्ताका लागि प्रत्यक्ष मूल्य: बिक्रेता र खरिदकर्ताबीच प्रत्यक्ष सहभागिता गराई पारदर्शी मूल्य निर्धारणमा सहयोग गर्ने।</li>
                        <li>देशव्यापी र विश्वव्यापी पहुँच: भौगोलिक दूरीलाई मेटाउँदै नेपालको कुनै पनि कुनाबाट व्यापार गर्न सम्भव बनाउने (अन्तर्राष्ट्रिय अर्डरहरूको सुविधासहित)।</li>
                        <li>जोखिम न्यूनीकरण: 'क्यास अन डेलिभरी' (COD) र सुरक्षित एवं लचिलो भुक्तानी विकल्पहरू मार्फत उपभोक्ताको विश्वास बढाउने।</li>
                    </ul>
                    <p>हाम्रो प्रतिबद्धता केवल आश्वासन मात्र होइन; यो हाम्रो कार्यप्रणालीको आधारभूत जग हो।</p>

                    <h2 className="text-2xl font-bold text-primary mt-8">हाम्रा मुख्य स्तम्भहरू</h2>

                    <h3 className="text-xl font-bold mt-6">१. समावेशी पहुँच</h3>
                    <p>हामी बजारको एकाधिकार र घेराबन्दीलाई अन्त्य गर्छौँ, ताकि साना बिक्रेता र नयाँ उद्यमीहरूले आफ्नो स्तर वा स्थानको पर्वाह नगरी समान रूपमा प्रतिस्पर्धा गर्न सकून्।</p>

                    <h3 className="text-xl font-bold mt-6">२. समान मूल्य निर्धारण मोडल</h3>
                    <p>हामी सञ्चालन खर्चलाई न्यून राख्छौँ, जसले गर्दा बिक्रेताले उचित मूल्य तोक्न सक्छन् र खरिदकर्ताले अनावश्यक अतिरिक्त शुल्क बिना वास्तविक मूल्यमा सामान पाउँछन्।</p>

                    <h3 className="text-xl font-bold mt-6">३. विकेन्द्रित राष्ट्रव्यापी पहुँच</h3>
                    <p>हाम्रो संरचना सहरी र ग्रामीण क्षेत्रलाई जोड्ने गरी डिजाइन गरिएको छ, जसले भौगोलिक सिमानालाई मेटाउँदै बजारको पहुँच विस्तार गर्दछ।</p>

                    <h3 className="text-xl font-bold mt-6">४. सूचनाको अखण्डता र पारदर्शिता</h3>
                    <p>हामी स्पष्ट र विस्तृत उत्पादन विवरणलाई प्राथमिकता दिन्छौँ, जसले गर्दा खरिदकर्ताले सही निर्णय लिन सकून् र बिक्रेताले दीर्घकालीन विश्वास कमाउन सकून्।</p>

                    <h3 className="text-xl font-bold mt-6">५. भुक्तानीमा लचिलोपन र सुरक्षा</h3>
                    <p>'क्यास अन डेलिभरी' र विभिन्न डिजिटल भुक्तानी विकल्पहरू मार्फत हामी एक सुरक्षित वातावरण प्रदान गर्छौँ, जहाँ प्रयोगकर्ताको छनौट र वित्तीय सुरक्षालाई प्राथमिकता दिइन्छ।</p>

                    <h2 className="text-2xl font-bold text-primary mt-12">विश्वास र विश्वसनीयता</h2>
                    <p>नेपाली बजारकै लागि डिजाइन गरिएको प्रणाली मार्फत वाणिजयले प्रयोगकर्ताको भरोसा जित्छ:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>स्थानीय वास्तविकतामा आधारित: नेपालकै चुनौतीहरूलाई नजिकबाट बुझेको स्थानीय टोलीद्वारा विकसित।</li>
                        <li>स्वभावैले समावेशी: स्थान वा डिजिटल साक्षरताको स्तर जस्तोसुकै भए पनि सहरी र ग्रामीण दुवै प्रयोगकर्ताहरूका लागि उपयोगी।</li>
                        <li>जोखिममुक्त कारोबार: पहिलो पटक अनलाइन सामान किन्नेहरूका लागि COD र सुरक्षित गेटवे मार्फत जोखिम कम गरिएको।</li>
                        <li>प्रयोगकर्तामा आधारित सुधार: प्रयोगकर्ताको प्रतिक्रिया र परिवर्तनशील आर्थिक आवश्यकता अनुसार हामी आफ्ना प्रक्रियाहरूलाई निरन्तर परिष्कृत गर्छौँ।</li>
                    </ul>
                    <p>वाणिजयमा, विश्वास मागिँदैन—यसलाई निरन्तर र पारदर्शी कार्यसम्पादन मार्फत आर्जन गरिन्छ।</p>
                    <p>
                        वाणिजय ती स्थानीय निर्माताहरूद्वारा बनाइएको हो जसले नेपालको परम्परागत व्यापारमा रहेका झन्झट र
                        विभेदहरूलाई आफैँले भोगेका छन्। यो प्लेटफर्म केही सीमित मानिसका लागि मात्र नभई धेरैका लागि बनाइएको
                        हो—जहाँ प्रविधिले बाधाको रूपमा होइन, अवसरको पुलका रूपमा काम गर्दछ।
                    </p>
                    <p>
                        हामी व्यक्तिगत उद्यमी र साना व्यवसायहरूलाई मर्यादा, निष्पक्षता र पहुँचका साथ अघि बढ्न सहयोग गर्न
                        प्रतिबद्ध छौँ।
                    </p>
                    <p>तपाईँको पहिलो कारोबारदेखि नै सहयोग गर्न वाणिजय तयार छ:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>बजार अन्वेषण गर्नुहोस्: देशभरका विभिन्न उत्पादन र सेवाहरू हेर्नुहोस्।</li>
                        <li>बिक्री सुरु गर्नुहोस्: न्यूनतम बाधाका साथ आफ्ना वस्तु वा सेवाहरू सूचीकृत गर्नुहोस्।</li>
                        <li>सुरक्षित व्यापार गर्नुहोस्: पारदर्शी, भरपर्दो र लचिलो वातावरणमा खरिद-बिक्री गर्नुहोस्।</li>
                    </ul>
                    <p className="font-bold text-primary text-center mt-8">वाणिजय—मानिसहरूका लागि काम गर्ने व्यापार।</p>
                </div>
            </div>
        </div>
    );
}
