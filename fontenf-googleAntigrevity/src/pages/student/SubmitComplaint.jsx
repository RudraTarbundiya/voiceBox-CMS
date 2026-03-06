import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useNavigate } from 'react-router-dom';
import { Mic, UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitComplaint() {
    const { createComplaint, loading, error } = useComplaintStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'infrastructure',
    });

    const [files, setFiles] = useState([]);
    const [micActive, setMicActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedForms = Array.from(e.target.files);
            if (files.length + selectedForms.length > 3) {
                alert("Maximum 3 files allowed.");
                return;
            }
            const validFiles = selectedForms.filter(f => f.size <= 5 * 1024 * 1024);
            if (validFiles.length < selectedForms.length) {
                alert("Some files exceeded the 5MB limit.");
            }
            setFiles([...files, ...validFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        files.forEach(file => data.append('attachments', file));

        try {
            await createComplaint(data);
            navigate('/dashboard');
        } catch (err) {
            // Error is handled in store
        }
    };

    // Mock voice recognizer
    const toggleRecording = () => {
        setMicActive(!micActive);
        if (!micActive) {
            setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    description: prev.description + " The AC in lab 3 is not working properly and it's leaking water."
                }));
                setMicActive(false);
            }, 3000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Submit Complaint</h1>
                <p className="text-muted-foreground">Describe your issue in detail. You can use voice recording to transcribe it quickly.</p>
            </div>

            <Card className="border-border">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Issue Title</label>
                            <Input
                                placeholder="Brief summary (e.g., WiFi not working in Library)"
                                required
                                minLength={5}
                                maxLength={200}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="academic">Academic</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="hostel">Hostel</option>
                                    <option value="library">Library</option>
                                    <option value="it/portal">IT / Portal</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Detailed Description</label>
                                <Button
                                    type="button"
                                    variant={micActive ? "destructive" : "outline"}
                                    size="sm"
                                    className={`h-8 gap-2 transition-all duration-300 ${micActive ? "animate-pulse" : ""}`}
                                    onClick={toggleRecording}
                                >
                                    <Mic className="h-4 w-4" />
                                    {micActive ? "Recording..." : "Voice Input"}
                                </Button>
                            </div>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Explain the issue thoroughly..."
                                required
                                minLength={20}
                                maxLength={5000}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">Attachments (Max 3, 5MB each)</label>

                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, PDF, DOC, TXT</p>
                                    </div>
                                    <input type="file" className="hidden" multiple accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                                </label>
                            </div>

                            <AnimatePresence>
                                {files.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                        {files.map((file, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center justify-between p-2 text-sm border bg-card rounded-md"
                                            >
                                                <span className="truncate flex-1 max-w-[200px]">{file.name}</span>
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && <div className="text-sm text-destructive">{error}</div>}

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="button" variant="ghost" className="mr-2" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Complaint'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
