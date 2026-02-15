'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Briefcase, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CareersPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        salary: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setSelectedFile(file);
        toast.success("CV selected");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please upload your CV");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("email", formData.email);
            submitData.append("phone", formData.phone);
            submitData.append("salary", formData.salary);
            submitData.append("cv", selectedFile);

            const res = await axios.post('/api/career/apply', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                setIsSubmitted(true);
                toast.success("Application submitted successfully!");
            } else {
                toast.error(res.data.message || "Failed to submit application");
            }
        } catch (error) {
            console.error("Submission error", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-background min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl shadow-lg border border-border">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Application Received!</h1>
                        <p className="mt-4 text-muted-foreground">
                            Thank you for your interest in Vanijay. We have received your application and will get back to you soon.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            &larr; Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Briefcase className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-primary">Careers at Vanijay</h1>
                    <p className="text-xl text-muted-foreground">
                        Join us in building the future of commerce in Nepal.
                    </p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border border-border space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Apply for a Position</h2>
                        <p className="text-muted-foreground mt-2">
                            Fill out the form below and we'll be in touch.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number (Optional)</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+977 1234567890"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Expected Salary (Monthly)</Label>
                                <Input
                                    id="salary"
                                    name="salary"
                                    placeholder="e.g. NPR 50,000"
                                    required
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Upload CV (PDF or Image, max 5MB)</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-green-500 bg-green-50/10' : 'border-border hover:border-primary hover:bg-muted/50'
                                    }`}
                            >
                                {selectedFile ? (
                                    <>
                                        <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                                        <span className="text-sm font-medium text-green-600">{selectedFile.name} selected! Click to change.</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Click to upload your CV</span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </form>
                </div>

                <div className="text-center">
                    <Link
                        href="/"
                        className="text-primary hover:underline font-medium transition-colors"
                    >
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
