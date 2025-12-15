import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Vanijoy E-Commerce",
    description: "Get in touch with the Vanijoy team for any queries, support, or feedback. We appear clearly on search results.",
    openGraph: {
        title: "Contact Us | Vanijoy E-Commerce",
        description: "Get in touch with the Vanijoy team for any queries, support, or feedback.",
    },
};

export default function ContactPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-lg mb-6">
                        Have a question or improved suggestions? We'd love to hear from you.
                        Reach out to us using the contact details below.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg">Email</h3>
                            <p>support@Vanijoy-ecommerce.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Phone</h3>
                            <p>+977-9800000000</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Address</h3>
                            <p>Kathmandu, Nepal</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder for Contact Form */}
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" id="name" className="w-full p-2 border rounded-md bg-background" placeholder="Your Name" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" id="email" className="w-full p-2 border rounded-md bg-background" placeholder="your@email.com" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                            <textarea id="message" rows={4} className="w-full p-2 border rounded-md bg-background" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
