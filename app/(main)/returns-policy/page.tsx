// components/ReturnRefundPolicy.tsx
import { Metadata } from 'next';
import React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vanijay.com';

export const metadata: Metadata = {
  title: "Return and Refund Policy",
  description: "Read our return and refund policy for shopping on Vanijay.com. We prioritize your satisfaction.",
  alternates: {
    canonical: `${baseUrl}/returns-policy`,
  }
};

const ReturnRefundPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 prose prose-slate dark:prose-invert">
      {/* English Version */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Return and Refund Policy - Vanijay.com Nepal Online Shopping
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
        Last Updated: 23 Jan, 2026
      </p>

      <p>
        At Vanijay.com, your satisfaction is our top priority. We want you to shop with confidence on Nepal's trusted online shopping platform.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-6">Quick Overview: Which Products Can Be Returned?</h2>

      <div className="overflow-x-auto mb-10">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Product Category</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Returnable?</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Key Conditions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Apparel & Clothing</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Unworn, unwashed, original tags and packaging intact</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Footwear</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Unused, original box, clean soles</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Electronics & Appliances</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Original sealed box; may have restocking fee if opened</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Home & Kitchen</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Unused with all parts and original packaging</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Books, Media & Music</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Original undamaged condition</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Toys & Baby Products</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Unused, all parts and safety seals intact</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Jewellery & Watches</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Original packaging, tags and certificates</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Sports & Fitness Equipment</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Only trial assembly allowed, all parts included</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Beauty & Cosmetics</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Hygiene reasons (return only if defective & sealed)</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Underwear, Lingerie & Socks</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Hygiene reasons (return only if defective)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Personal Care Items</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Hygiene reasons (return only if defective)</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Perishable Goods (Food, Flowers)</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Non-returnable</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Customized/Made-to-Order Items</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Non-returnable unless defective</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Digital Goods, Software & Gift Cards</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Non-refundable once activated</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Medical Devices</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Hygiene & safety reasons (return only if defective)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">1. When Can You Return a Product?</h2>
      <p>
        You can request a return within 5 days from the date you receive your order if:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>The product is unused, in original condition, with all tags, packaging, accessories, and free gifts.</li>
        <li>You have your order number or invoice.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">2. Valid Reasons for Return & Refund</h2>
      <p>We accept returns for:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Defective or Damaged Product</strong> – Faulty, broken, or not working.</li>
        <li><strong>Wrong Item Delivered</strong> – Different from what you ordered.</li>
        <li><strong>Missing Parts</strong> – Item is incomplete.</li>
        <li><strong>Change of Mind</strong> – You simply don’t want it anymore (only for returnable categories). <strong>Note:</strong> You will pay return shipping cost in this case.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">3. Non-Returnable Cases</h2>
      <p>Returns will not be accepted if:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Product is used, washed, altered, or damaged by customer.</li>
        <li>Original packaging, tags, or accessories are missing.</li>
        <li>Return request is made after 5 days.</li>
        <li>Item belongs to non-returnable categories listed above.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">4. How to Return a Product (Simple Steps)</h2>
      <ol className="list-decimal pl-6 mb-4 space-y-3">
        <li>
          <strong>Contact Us Quickly</strong> – Log in to your account → Go to “My Orders” or email/call us within 5 days.
        </li>
        <li>
          <strong>Get Approval</strong> – We will give you a Return Authorization Number (RAN) and return address.
        </li>
        <li>
          <strong>Pack & Ship</strong> – Pack the item securely in original packaging. Write the RAN clearly on the package. Send it back using a reliable courier (we recommend tracking). We are not responsible for lost returns.
        </li>
      </ol>
      <p>
        <strong>Contact Details:</strong><br />
        Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
        Phone: 9761012813<br />
        (Support available Sunday–Friday, 9 AM – 5 PM Nepal Time)
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">5. Inspection & Processing Time</h2>
      <p>
        After we receive your return:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Our team will check the item (takes 5–7 business days).</li>
        <li>You will get an email update on approval or rejection.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">6. Refunds</h2>
      <p>If approved:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Refund processed within 5–10 business days.</li>
        <li>Money returned to your original payment method (Digital (must preferred) or physical payment method).</li>
        <li>Bank or wallet may take extra time to show the refund.</li>
        <li>
          <strong>Deductions (if any):</strong>
          <ul className="list-disc pl-8 mt-2">
            <li>Return shipping cost (for Change of Mind).</li>
            <li>Restocking fee (only if mentioned on product page).</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">7. Exchanges</h2>
      <p>We offer exchanges for:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Defective, damaged, or wrong items.</li>
        <li>Size issues in clothing/footwear (if stock available).</li>
      </ul>
      <p>
        If the replacement is not in stock, we will give you a full refund instead.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">8. Order Cancellation</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>You can cancel free of charge before the order is shipped.</li>
        <li>Contact us immediately.</li>
        <li>Once shipped, follow the return process above.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Contact Us for Help</h2>
      <p>
        Have questions about returns, refunds, or your order?
      </p>
      <address className="not-italic">
        <strong>Vanijay Enterprises</strong><br />
        Koshi, Sunsari, Itahari<br />
        Email: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
        Phone: 9761012813
      </address>

      <p className="mt-10 text-center italic">
        Shop worry-free at Vanijay.com – Nepal’s reliable online store with easy returns, secure payment, and fast delivery across Nepal! Thank you for choosing us.
      </p>

      {/* Nepali Translation */}
      <div className="mt-20 border-t pt-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          फिर्ता र रिफन्ड नीति (Return and Refund Policy) - Vanijay.com नेपाल अनलाइन सपिङ
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          अन्तिम परिमार्जन: डिसेम्बर २२, २०२५
        </p>

        <p>
          Vanijay.com मा, तपाईँको सन्तुष्टि नै हाम्रो मुख्य प्राथमिकता हो। हामी चाहन्छौँ कि तपाईँ नेपालको यो भरपर्दो अनलाइन सपिङ प्लेटफर्ममा ढुक्क भएर किनमेल गर्नुहोस्।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-6">संक्षिप्त जानकारी: कुन सामानहरू फिर्ता गर्न सकिन्छ?</h2>

        <div className="overflow-x-auto mb-10">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">उत्पादनको विधा (Product Category)</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">फिर्ता गर्न मिल्ने, नमिल्ने?</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">मुख्य सर्तहरू</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">लुगाफाटा (Apparel & Clothing)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नलगाएको, नधोएको, ओरिजिनल ट्याग र प्याकेजिङ दुरुस्त भएको</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">जुत्ताचप्पल (Footwear)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">प्रयोग नगरिएको, ओरिजिनल बक्स भएको, पैताला सफा भएको</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">इलेक्ट्रोनिक्स र उपकरणहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">ओरिजिनल सिलबन्दी बक्स; बक्स खोलेको खण्डमा रिस्टोकिङ शुल्क लाग्न सक्छ</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">घर र भान्साका सामानहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">प्रयोग नगरिएको र सबै पार्टपुर्जाहरू ओरिजिनल प्याकेजिङमा भएको</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">किताब, मिडिया र संगीत</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">ओरिजिनल र कुनै क्षति नभएको अवस्थामा</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">खेलौना र बच्चाका सामानहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">प्रयोग नगरिएको, सबै पार्टपुर्जाहरू र सुरक्षा सिल (Safety Seals) दुरुस्त भएको</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">गहना र घडीहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">ओरिजिनल प्याकेजिङ, ट्याग र प्रमाणपत्रहरू सहित</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">खेलकुद र फिटनेस सामग्री</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">जडान गरेर परीक्षण मात्र गरिएको, सबै पार्टपुर्जाहरू भएको</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">सौन्दर्य र प्रसाधन (Beauty & Cosmetics)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">सरसफाइ र स्वास्थ्यको कारणले (त्रुटिपूर्ण र सिल नखोलिएको भए मात्र फिर्ता हुने)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">भित्री लुगा र मोजाहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">सरसफाइको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">व्यक्तिगत हेरचाहका सामानहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">सरसफाइको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">चाँडै बिग्रने सामान (खाना, फूल)</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">फिर्ता नहुने</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">अर्डर अनुसार बनाइएका सामानहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">त्रुटिपूर्ण बाहेक अन्य अवस्थामा फिर्ता नहुने</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">डिजिटल सामान, सफ्टवेयर र गिफ्ट कार्ड</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">एक्टिभेट (Activate) भइसकेपछि रिफन्ड नहुने</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">मेडिकल उपकरणहरू</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">नमिल्ने</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">स्वास्थ्य र सुरक्षाको कारणले (त्रुटिपूर्ण भए मात्र फिर्ता हुने)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4">१. तपाईँले उत्पादन कहिले फिर्ता गर्न सक्नुहुन्छ?</h2>
        <p>
          तपाईँले सामान प्राप्त गरेको ५ दिनभित्र फिर्ताको अनुरोध गर्न सक्नुहुन्छ यदि:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>उत्पादन प्रयोग नगरिएको, ओरिजिनल अवस्थामा, र सबै ट्याग, प्याकेजिङ, एसेसरिज र उपहारहरू (Free Gifts) सहित छ भने।</li>
          <li>तपाईँसँग अर्डर नम्बर वा बीजक (Invoice) छ भने।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">२. फिर्ता र रिफन्डका लागि मान्य कारणहरू</h2>
        <p>हामी निम्न अवस्थामा फिर्ता स्वीकार गर्छौँ:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>त्रुटिपूर्ण वा क्षतिग्रस्त उत्पादन:</strong> सामान बिग्रिएको, फुटेको वा नचल्ने भएमा।</li>
          <li><strong>गलत सामान डेलिभरी:</strong> तपाईँले अर्डर गरेको भन्दा फरक सामान आएमा।</li>
          <li><strong>सामान छुटेको भए:</strong> सामानका कुनै पार्टपुर्जाहरू अपुरो भएमा।</li>
          <li><strong>मन परिवर्तन भएमा (Change of Mind):</strong> यदि तपाईँलाई सामान मन परेन भने (फिर्ता गर्न मिल्ने विधाहरूमा मात्र)। <strong>द्रष्टव्य:</strong> यस अवस्थामा फिर्ता गर्दा लाग्ने ढुवानी खर्च तपाईँ आफैँले बेहोर्नुपर्नेछ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">३. फिर्ता स्वीकार नगरिने अवस्थाहरू</h2>
        <p>निम्न अवस्थामा सामान फिर्ता लिइने छैन:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>ग्राहकले प्रयोग गरेको, धोएको, परिवर्तन गरेको वा क्षति पुर्‍याएको सामान।</li>
          <li>ओरिजिनल प्याकेजिङ, ट्याग वा एसेसरिजहरू नभएको।</li>
          <li>सामान पाएको ५ दिनपछि फिर्ताको अनुरोध गरिएको।</li>
          <li>माथि उल्लेखित 'फिर्ता नहुने' विधाका सामानहरू।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">४. सामान फिर्ता गर्ने तरिका (सजिलो चरणहरू)</h2>
        <ol className="list-decimal pl-6 mb-4 space-y-3">
          <li>
            <strong>छिटो सम्पर्क गर्नुहोस्:</strong> आफ्नो अकाउन्टमा लग-इन गरी "My Orders" मा जानुहोस् वा ५ दिनभित्र हामीलाई ईमेल/फोन गर्नुहोस्।
          </li>
          <li>
            <strong>स्वीकृति लिनुहोस्:</strong> हामी तपाईँलाई 'रिटर्न अथोराइजेसन नम्बर' (RAN) र फिर्ता गर्ने ठेगाना उपलब्ध गराउनेछौँ।
          </li>
          <li>
            <strong>प्याक र पठाउनुहोस्:</strong> सामानलाई सुरक्षित रूपमा ओरिजिनल प्याकेजिङमा राख्नुहोस्। प्याकेजमा RAN नम्बर स्पष्टसँग लेख्नुहोस्। भरपर्दो कुरियर मार्फत पठाउनुहोस् (ट्र्याकिङ सुविधा भएको राम्रो)। हराएको सामानको लागि हामी जिम्मेवार हुने छैनौँ।
          </li>
        </ol>
        <p>
          <strong>सम्पर्क विवरण:</strong><br />
          ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
          फोन: 9761012813<br />
          (सम्पर्क समय: आइतबार–शुक्रबार, बिहान ९ बजे देखि बेलुका ५ बजेसम्म, नेपाल समय)
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">५. निरीक्षण र प्रक्रिया लाग्ने समय</h2>
        <p>हामीले फिर्ता आएको सामान प्राप्त गरेपछि:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>हाम्रो टोलीले सामानको जाँच गर्नेछ (यसका लागि ५-७ कार्यदिन लाग्न सक्छ)।</li>
          <li>सामान स्वीकृत वा अस्वीकृत भएको जानकारी तपाईँलाई ईमेल मार्फत दिइनेछ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">६. रिफन्ड (Refund)</h2>
        <p>यदि फिर्ता स्वीकृत भयो भने:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>5-10 कार्यदिन भित्र रिफन्ड प्रक्रिया अगाडि बढाइनेछ।</li>
          <li>रकम तपाईँको सुरुको भुक्तानी माध्यम (Digital or physical) मा फिर्ता गरिनेछ।</li>
          <li>बैंक वा वालेटमा रकम देखिन थप केही समय लाग्न सक्छ।</li>
          <li>
            <strong>कटौती (यदि भएमा):</strong>
            <ul className="list-disc pl-8 mt-2">
              <li>फिर्ता ढुवानी खर्च (मन परिवर्तन भएको खण्डमा)।</li>
              <li>रिस्टोकिङ शुल्क (यदि उत्पादनको पेजमा उल्लेख गरिएको छ भने)।</li>
            </ul>
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">७. साटफेर (Exchanges)</h2>
        <p>हामी निम्न अवस्थामा सामान साटफेर गरिदिन्छौँ:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>त्रुटिपूर्ण, क्षतिग्रस्त वा गलत सामान आएमा।</li>
          <li>लुगा वा जुत्तामा साइजको समस्या भएमा (स्टक उपलब्ध भएमा)।</li>
        </ul>
        <p>
          यदि साट्नका लागि सामान स्टकमा छैन भने, हामी तपाईँलाई पूर्ण रिफन्ड दिनेछौँ।
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">८. अर्डर रद्द गर्ने (Order Cancellation)</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>सामान पठाउनु (Ship) अघि तपाईँले नि:शुल्क अर्डर रद्द गर्न सक्नुहुन्छ।</li>
          <li>यसका लागि तुरुन्त हामीलाई सम्पर्क गर्नुहोस्।</li>
          <li>सामान पठाइसकिएको छ भने, माथि उल्लेखित फिर्ता प्रक्रिया पालना गर्नुपर्नेछ।</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">थप सहयोगका लागि सम्पर्क गर्नुहोस्</h2>
        <p>Vanijay Enterprises</p>
        <address className="not-italic">
          कोशी, सुनसरी, इटहरी<br />
          ईमेल: <a href="mailto:vanijayenterprises@gmail.com" className="text-blue-600 hover:underline">vanijayenterprises@gmail.com</a><br />
          फोन: 9761012813
        </address>

        <p className="mt-10 text-center italic">
          Vanijay.com मा ढुक्क भएर किनमेल गर्नुहोस् – सजिलो फिर्ता प्रक्रिया, सुरक्षित भुक्तानी र देशभर द्रुत डेलिभरीको साथ! हामीलाई रोज्नुभएकोमा धन्यवाद।
        </p>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;