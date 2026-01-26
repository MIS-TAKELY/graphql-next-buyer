// components/ShippingDeliveryPolicy.tsx
import React from 'react';

const ShippingDeliveryPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 prose prose-slate dark:prose-invert">
      {/* English Version */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Shipping & Delivery Policy - Vanijay.com Nepal Online Shopping
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
        Last Updated: December 22, 2025
      </p>

      <p>
        At Vanijay.com, we make sure your orders reach you quickly and safely across Nepal. This Shipping & Delivery Policy explains our process, timelines, costs, and what to expect. Shop with confidence knowing we partner with reliable couriers for fast and secure delivery nationwide.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">1. Order Processing Time</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>We process most orders within 1–2 business days (Sunday–Friday, excluding public holidays) after payment confirmation.</li>
        <li>Orders placed after 2:00 PM Nepal Time or on weekends/holidays will be processed the next business day.</li>
        <li>You’ll receive an email with your order confirmation and tracking details once it’s handed to our courier partner.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">2. Shipping Partners</h2>
      <p>
        We work with trusted logistics companies in Nepal to deliver your packages efficiently. The best courier for your location is selected automatically for reliable service.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-6">3. Delivery Areas & Estimated Timelines</h2>
      <p>We deliver to all parts of Nepal. Delivery time starts from the day your order leaves our warehouse:</p>

      <div className="overflow-x-auto mb-10">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Delivery Area</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Estimated Time (After Dispatch)</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Service Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Kathmandu Valley</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">2–4 business days</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Standard</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Major Cities (Pokhara, Biratnagar, Bharatpur, Lalitpur, etc.)</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">4–7 business days</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Standard</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Rest of Nepal (remote & hilly areas)</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">7–14 business days</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Standard</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="italic">
        Note: These are estimates. Delays can happen due to weather, road conditions, holidays, or other unexpected events.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">4. Shipping Costs</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Shipping fees are calculated at checkout based on your location, package weight, and size.</li>
        <li><strong>Free Shipping:</strong> We often provide free delivery on most orders – check at checkout for the latest offers!</li>
        <li>The exact shipping cost (if any) will be clearly shown before you complete payment.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">5. Track Your Order</h2>
      <p>
        As soon as your order ships, you’ll get an email with:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Tracking number</li>
        <li>Direct link to the courier’s tracking page</li>
      </ul>
      <p>
        You can also track it anytime by logging into your Vanijay.com account → “My Orders”.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">6. Delivery & Receiving Your Order</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Accurate Address:</strong> Please double-check your shipping address. We’re not responsible for delays or lost packages due to incorrect details.</li>
        <li><strong>Delivery Attempts:</strong> The courier will try to deliver to your address. If you’re not available, they’ll leave a notice for pickup or attempt again.</li>
        <li><strong>Failed Delivery:</strong> If delivery fails after attempts, the package returns to us. We’ll contact you to arrange redelivery (extra fee may apply) or issue a refund (minus original shipping cost).</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">7. International Shipping</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Currently, we only ship within Nepal.</li>
        <li>We’ll update this page and announce on the website if international delivery becomes available.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">8. Delays & Lost Packages</h2>
      <p>
        We do our best to deliver on time, but we cannot guarantee exact dates due to factors beyond our control (weather, strikes, etc.).
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Delayed in Transit?</strong> Contact us with your order number if tracking hasn’t updated for a long time.</li>
        <li><strong>Lost Package?</strong> If the courier confirms it’s lost, we’ll investigate and either resend the items (if in stock) or give you a full refund.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Contact Us for Shipping Help</h2>
      <p>
        Questions about delivery, tracking, or your order status? Our team is ready to assist!
      </p>
      <address className="not-italic">
        <strong>Vanijay Enterprises</strong><br />
        Koshi, Sunsari, Itahari<br />
        Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
        Phone: 9761012813<br />
        Support Hours: Sunday–Friday, 9 AM – 5 PM Nepal Time
      </address>

      <p className="mt-10 text-center italic">
        Enjoy fast, reliable, and often free shipping across Nepal with Vanijay.com – your trusted online shopping destination for secure payments, easy returns, and doorstep delivery! Thank you for shopping with us.
      </p>

      {/* Nepali Translation */}
      <div className="mt-20 border-t pt-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          ढुवानी र डेलिभरी नीति (Shipping & Delivery Policy) - Vanijay.com नेपाल
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          अन्तिम परिमार्जन: डिसेम्बर २२, २०२५
        </p>

        <p>
          Vanijay.com मा, हामी तपाईँको अर्डरहरू नेपालभर छिटो र सुरक्षित रूपमा पुग्ने कुरा सुनिश्चित गर्छौँ। यो ढुवानी र डेलिभरी नीतिले हाम्रो प्रक्रिया, समयसीमा, लागत र के अपेक्षा गर्ने भन्ने बारे व्याख्या गर्दछ। हामी देशभर छिटो र सुरक्षित डेलिभरीको लागि भरपर्दो कुरियरहरूसँग साझेदारी गर्छौँ, त्यसैले ढुक्क भएर किनमेल गर्नुहोस्।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">१. अर्डर प्रशोधन समय (Order Processing Time)</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>भुक्तानी पुष्टि भएपछि हामी प्रायः अर्डरहरू १-२ कार्यदिन भित्र (आइतबार-शुक्रबार, सार्वजनिक बिदा बाहेक) प्रशोधन गर्छौँ।</li>
          <li>नेपाल समय अनुसार दिउँसो २:०० बजेपछि वा सप्ताहान्त/बिदाको दिनमा गरिएका अर्डरहरू अर्को कार्यदिनमा प्रशोधन गरिनेछ।</li>
          <li>तपाईँको अर्डर कुरियर पार्टनरलाई हस्तान्तरण गरेपछि तपाईँले अर्डर पुष्टि र ट्र्याकिङ विवरणसहितको ईमेल प्राप्त गर्नुहुनेछ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">२. ढुवानी साझेदारहरू (Shipping Partners)</h2>
        <p>
          तपाईँका प्याकेजहरू कुशलतापूर्वक पुर्‍याउन हामी नेपालका भरपर्दो लजिस्टिक कम्पनीहरूसँग काम गर्छौँ। तपाईँको स्थानको लागि सबैभन्दा उपयुक्त कुरियर सेवा स्वचालित रूपमा चयन गरिन्छ।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-6">३. डेलिभरी क्षेत्र र अनुमानित समय</h2>
        <p>हामी नेपालका सबै भागहरूमा डेलिभरी गर्छौँ। डेलिभरी समय तपाईँको अर्डर हाम्रो गोदामबाट निस्किएको दिनदेखि गणना हुन्छ:</p>

        <div className="overflow-x-auto mb-10">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">डेलिभरी क्षेत्र</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">अनुमानित समय (पठाएपछि)</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">सेवाको प्रकार</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">काठमाडौँ उपत्यका</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">२-४ कार्यदिन</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">स्ट्यान्डर्ड (Standard)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">प्रमुख सहरहरू (पोखरा, विराटनगर, भरतपुर, ललितपुर, आदि)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">४-७ कार्यदिन</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">स्ट्यान्डर्ड (Standard)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नेपालका अन्य भागहरू (दुर्गम र पहाडी क्षेत्रहरू)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">७-१४ कार्यदिन</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">स्ट्यान्डर्ड (Standard)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="italic">
          द्रष्टव्य: यी अनुमानित समय मात्र हुन्। मौसम, सडकको अवस्था, सार्वजनिक बिदा वा अन्य अप्रत्याशित घटनाहरूले गर्दा ढिलाइ हुन सक्छ।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">४. ढुवानी शुल्क (Shipping Costs)</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>ढुवानी शुल्क चेकआउट (Checkout) को समयमा तपाईँको स्थान, प्याकेजको तौल र साइजको आधारमा गणना गरिन्छ।</li>
          <li><strong>नि:शुल्क ढुवानी:</strong> हामी प्रायः धेरैजसो अर्डरहरूमा नि:शुल्क डेलिभरी प्रदान गर्दछौँ – पछिल्लो अफरहरूको लागि चेकआउटमा जाँच गर्नुहोस्!</li>
          <li>तपाईँले भुक्तानी पूरा गर्नु अघि वास्तविक ढुवानी शुल्क (यदि लागेमा) स्पष्ट रूपमा देखाइनेछ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">५. अर्डर ट्र्याक गर्नुहोस् (Track Your Order)</h2>
        <p>
          तपाईँको अर्डर पठाइए लगत्तै तपाईँले निम्न विवरण सहितको ईमेल प्राप्त गर्नुहुनेछ:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>ट्र्याकिङ नम्बर</li>
          <li>कुरियरको ट्र्याकिङ पृष्ठको सिधा लिङ्क</li>
        </ul>
        <p>
          तपाईँले कुनै पनि समयमा आफ्नो Vanijay.com खातामा लग-इन गरी “My Orders” मा गएर पनि आफ्नो अर्डर ट्र्याक गर्न सक्नुहुन्छ।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">६. डेलिभरी र अर्डर प्राप्त गर्ने प्रक्रिया</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>सटीक ठेगाना:</strong> कृपया आफ्नो ढुवानी ठेगाना पुन: जाँच गर्नुहोस्। गलत विवरणका कारण हुने ढिलाइ वा हराएको प्याकेजको लागि हामी जिम्मेवार हुने छैनौँ।</li>
          <li><strong>डेलिभरी प्रयास:</strong> कुरियरले तपाईँको ठेगानामा डेलिभरी गर्ने प्रयास गर्नेछ। यदि तपाईँ उपलब्ध हुनुहुन्न भने, उनीहरूले सामान सङ्कलन गर्ने सूचना छोड्नेछन् वा पुन: प्रयास गर्नेछन्।</li>
          <li><strong>असफल डेलिभरी:</strong> प्रयासहरू गर्दा पनि डेलिभरी हुन नसकेमा, प्याकेज हामीकहाँ फिर्ता आउनेछ। हामी पुन: डेलिभरीको प्रबन्ध गर्न (थप शुल्क लाग्न सक्छ) वा रिफन्ड जारी गर्न (सुरुको ढुवानी शुल्क कटाएर) तपाईँलाई सम्पर्क गर्नेछौँ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">७. अन्तर्राष्ट्रिय ढुवानी</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>हाल हामी नेपालभित्र मात्र सामान पठाउँछौँ।</li>
          <li>यदि भविष्यमा अन्तर्राष्ट्रिय डेलिभरी उपलब्ध भयो भने हामी यो पृष्ठ अपडेट गर्नेछौँ र वेबसाइटमा घोषणा गर्नेछौँ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">८. ढिलाइ र हराएका प्याकेजहरू</h2>
        <p>
          हामी समयमै डेलिभरी गर्न सक्दो प्रयास गर्छौँ, तर हाम्रो नियन्त्रण बाहिरका कारकहरू (मौसम, हड्ताल, आदि) का कारण ठ्याक्कै मितिको ग्यारेन्टी गर्न सक्दैनौँ।
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>बाटोमा ढिलाइ:</strong> यदि लामो समयसम्म ट्र्याकिङ अपडेट भएको छैन भने, आफ्नो अर्डर नम्बर सहित हामीलाई सम्पर्क गर्नुहोस्।</li>
          <li><strong>हराएको प्याकेज:</strong> यदि कुरियरले प्याकेज हराएको पुष्टि गरेमा, हामी अनुसन्धान गर्नेछौँ र या त सामान पुन: पठाउनेछौँ (यदि स्टकमा भएमा) वा पूर्ण रिफन्ड दिनेछौँ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">ढुवानी सहयोगका लागि सम्पर्क गर्नुहोस्</h2>
        <p>
          डेलिभरी, ट्र्याकिङ वा तपाईँको अर्डरको अवस्था बारे केही प्रश्नहरू छन्? हाम्रो टोली सहयोग गर्न तयार छ!
        </p>
        <address className="not-italic">
          <strong>Vanijay Enterprises</strong><br />
          कोशी, सुनसरी, इटहरी<br />
          ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
          फोन: 9761012813<br />
          सम्पर्क समय: आइतबार–शुक्रबार, बिहान ९ बजे देखि बेलुका ५ बजेसम्म (नेपाल समय)
        </address>

        <p className="mt-10 text-center italic">
          Vanijay.com सँग नेपालभर छिटो, भरपर्दो र प्रायः नि:शुल्क ढुवानीको आनन्द लिनुहोस् – सुरक्षित भुक्तानी, सजिलो फिर्ता प्रक्रिया र घरदैलोमै डेलिभरीको लागि तपाईँको विश्वासिलो अनलाइन स्टोर! हामीसँग किनमेल गर्नुभएकोमा धन्यवाद।
        </p>
      </div>
    </div>
  );
};

export default ShippingDeliveryPolicy;