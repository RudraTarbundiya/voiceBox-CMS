import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, UploadCloud, X, Play, Pause, Square, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
    const { createComplaint, loading, error } = useComplaintStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'infrastructure',
    });

    const [files, setFiles] = useState([]);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedForms = Array.from(e.target.files);
            const totalFiles = files.length + selectedForms.length + (audioBlob ? 1 : 0);
            if (totalFiles > 3) {
                toast.error("Maximum 3 files allowed (including voice recording).");
                return;
            }
            const validFiles = selectedForms.filter(f => f.size <= 5 * 1024 * 1024);
            if (validFiles.length < selectedForms.length) {
                toast.error("Some files exceeded the 5MB limit.");
            }
            setFiles([...files, ...validFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    // ===== Voice Recording Functions =====
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100); // Capture in 100ms chunks
            setIsRecording(true);
            setRecordingTime(0);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            toast.success('Recording started...');
        } catch (err) {
            console.error('Microphone access error:', err);
            toast.error('Could not access microphone. Please allow microphone permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        clearInterval(timerRef.current);
        toast.success('Recording saved! It will be attached to your complaint.');
    };

    const removeRecording = () => {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        setPlaybackTime(0);
        setAudioDuration(0);
    };

    const togglePlayback = () => {
        const audio = audioPlayerRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        files.forEach(file => data.append('attachments', file));

        // Attach voice recording as a file
        if (audioBlob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const audioFile = new File([audioBlob], `voice-recording-${timestamp}.webm`, {
                type: 'audio/webm'
            });
            data.append('attachments', audioFile);
        }

        try {
            await createComplaint(data);
            toast.success('Complaint submitted successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Failed to submit complaint');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Submit Complaint</h1>
                <p className="text-muted-foreground">Describe your issue in detail. You can attach a voice recording as evidence.</p>
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
                            <label className="text-sm font-medium">Detailed Description</label>
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

                        {/* Voice Recording Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">🎙️ Voice Recording</label>

                            {!audioBlob && !isRecording && (
                                <div
                                    className="flex items-center justify-center w-full h-24 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-all duration-200 hover:border-primary/50"
                                    onClick={startRecording}
                                >
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mic className="h-6 w-6" />
                                        <div>
                                            <p className="text-sm font-medium">Click to start voice recording</p>
                                            <p className="text-xs">Records as WebM audio and attaches to your complaint</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isRecording && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between p-4 rounded-lg border-2 border-red-500/50 bg-red-500/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <MicOff className="h-6 w-6 text-red-500" />
                                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
                                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-red-500">Recording in progress...</p>
                                            <p className="text-lg font-mono font-bold text-red-400">{formatTime(recordingTime)}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        onClick={stopRecording}
                                    >
                                        <Square className="h-4 w-4" />
                                        Stop
                                    </Button>
                                </motion.div>
                            )}

                            {audioBlob && !isRecording && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Mic className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">Voice Recording</p>
                                            <p className="text-xs text-muted-foreground">
                                                {isPlaying
                                                    ? `${formatTime(Math.floor(playbackTime))} / ${formatTime(Math.floor(audioDuration))}`
                                                    : `Duration: ${formatTime(recordingTime)} • ${(audioBlob.size / 1024).toFixed(1)} KB`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <audio
                                            ref={audioPlayerRef}
                                            src={audioUrl}
                                            className="hidden"
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={() => { setIsPlaying(false); setPlaybackTime(0); }}
                                            onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                                            onTimeUpdate={(e) => setPlaybackTime(e.target.currentTime)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                            onClick={togglePlayback}
                                        >
                                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            {isPlaying ? 'Pause' : 'Play'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={removeRecording}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">Attachments (Max 3 total, 5MB each)</label>

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
                                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer">
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
