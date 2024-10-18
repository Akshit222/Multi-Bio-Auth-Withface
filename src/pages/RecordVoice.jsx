// ./pages/RecordVoice.jsx
import React, { useState, useEffect, useRef } from 'react';

const RecordVoice = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const audioPlaybackRef = useRef(null);
    
    useEffect(() => {
        // Clean up the media stream when the component unmounts
        return () => {
            if (mediaRecorder) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaRecorder]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            
            recorder.ondataavailable = event => {
                setAudioChunks(prevChunks => [...prevChunks, event.data]);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlaybackRef.current.src = audioUrl;
                setAudioChunks([]); // Clear the chunks for the next recording
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            startTimer();

            // Automatically stop recording after 5 seconds
            setTimeout(stopRecording, 5000);
        } catch (err) {
            console.error('Failed to start recording:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            stopTimer();
        }
    };

    const startTimer = () => {
        setTimeElapsed(0);
        const intervalId = setInterval(() => {
            setTimeElapsed(prevTime => prevTime + 1);
        }, 1000);
        setTimerInterval(intervalId);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        setTimerInterval(null);
        setTimeElapsed(0);
    };

    const saveRecording = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = window.URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.wav';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={styles.container}>
            <h2>Record Your Voice</h2>
            <button id="recordButton" onClick={startRecording} disabled={isRecording}>
                {isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            <button id="saveButton" onClick={saveRecording} disabled={!audioChunks.length}>
                Save Recording
            </button>
            <p style={styles.timer}>Timer: {timeElapsed}s</p>
            <audio ref={audioPlaybackRef} controls></audio>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        display: 'inline-block',
        textAlign: 'center',
        marginTop: '50px'
    },
    timer: {
        fontSize: '18px',
        color: '#666'
    }
};

export default RecordVoice;
