"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendContactEmail } from "@/app/actions/contact";
import { toast } from "sonner";

export default function ContactPage() {
    const [isPending, setIsPending] = useState(false);
    const [state, setState] = useState<{ success?: boolean; error?: string | any }>({});

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setState({});

        const formData = new FormData(event.currentTarget);
        const result = await sendContactEmail(formData);

        setIsPending(false);
        if (result.success) {
            setState({ success: true });
            toast.success("Message sent successfully!");
            (event.target as HTMLFormElement).reset();
        } else {
            setState({ error: result.error });
            toast.error(typeof result.error === "string" ? result.error : "Please check the form for errors.");
        }
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Header Section */}
            <div className="bg-primary/5 py-16 px-4 border-b">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Contact Us</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have a question, feedback, or need support? We're here to help.
                        Reach out to the Vanijay team and we'll get back to you as soon as possible.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                            <p className="text-muted-foreground mb-8">
                                Whether you're a buyer, seller, or just curious about Vanijay,
                                we'd love to hear from you.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Email Us</h3>
                                    <p className="text-muted-foreground">vanijayenterprises@gmail.com</p>
                                    <p className="text-xs text-muted-foreground mt-1 text-primary italic">Primary Support Channel</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Call Us</h3>
                                    <p className="text-muted-foreground">+977 9800000000</p>
                                    <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am - 6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Our Office</h3>
                                    <p className="text-muted-foreground">Kathmandu, Nepal</p>
                                    <p className="text-xs text-muted-foreground mt-1">Virtual Operations Center</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-card border rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 text-primary mb-3">
                                <MessageCircle className="w-5 h-5" />
                                <h3 className="font-bold">Live Support</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Need immediate assistance? Check our FAQ or chat with us during business hours.
                            </p>
                            <button className="text-sm font-semibold text-primary hover:underline">
                                Visit Help Center &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-primary px-8 py-6">
                                <h2 className="text-2xl font-bold text-primary-foreground">Send us a Message</h2>
                                <p className="text-primary-foreground/80 text-sm">Fill out the form below and we'll respond within 24 hours.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="John Doe"
                                        />
                                        {state.error?.name && <p className="text-xs text-destructive mt-1">{state.error.name[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="john@example.com"
                                        />
                                        {state.error?.email && <p className="text-xs text-destructive mt-1">{state.error.email[0]}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="Order Inquiry / Technical Issue / General Feedback"
                                    />
                                    {state.error?.subject && <p className="text-xs text-destructive mt-1">{state.error.subject[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-foreground">How can we help?</label>
                                    <textarea
                                        required
                                        id="message"
                                        name="message"
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                                        placeholder="Describe your query or problem in detail..."
                                    ></textarea>
                                    {state.error?.message && <p className="text-xs text-destructive mt-1">{state.error.message[0]}</p>}
                                </div>

                                <button
                                    disabled={isPending}
                                    type="submit"
                                    className={`w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                {state.success && (
                                    <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-lg border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <p className="text-sm font-semibold">Your message has been sent. We'll get back to you soon!</p>
                                    </div>
                                )}

                                {typeof state.error === "string" && (
                                    <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                                        <AlertCircle className="w-5 h-5" />
                                        <p className="text-sm font-semibold">{state.error}</p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
