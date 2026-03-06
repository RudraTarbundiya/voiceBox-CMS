import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Cylinder, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { Button } from "../frontend/src/components/ui/button";

// 3D Microphone Model (Procedural)
function Microphone() {
    const micRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        micRef.current.rotation.y = t * 0.2;
        micRef.current.position.y = Math.sin(t) * 0.1;
    });

    return (
        <group position={[0, -1.5, 0]} rotation={[0.4, 0, 0]}>
            <group ref={micRef} scale={1.5}>
                {/* Mic Head */}
                <Sphere args={[1, 32, 32]} position={[0, 2, 0]}>
                    <MeshDistortMaterial
                        color="#3b82f6"
                        emissive="#2563eb"
                        emissiveIntensity={2}
                        wireframe
                        speed={2}
                        distort={0.3}
                        roughness={0.2}
                    />
                </Sphere>

                {/* Mic Body/Handle */}
                <Cylinder args={[0.3, 0.3, 2, 16]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                </Cylinder>

                {/* Glowing Rings (Sound Waves) */}
                {[1, 2, 3].map((i) => (
                    <mesh key={i} position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[1 + i * 0.8, 0.02, 16, 100]} />
                        <meshBasicMaterial
                            color="#60a5fa"
                            transparent
                            opacity={0.3 / i}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export function Hero() {
    const buttonRef1 = useRef(null);
    const buttonRef2 = useRef(null);

    useEffect(() => {
        // GSAP Hover Animations
        const btn1 = buttonRef1.current;
        const btn2 = buttonRef2.current;

        if (btn1) {
            btn1.addEventListener("mouseenter", () => gsap.to(btn1, { scale: 1.05, duration: 0.2 }));
            btn1.addEventListener("mouseleave", () => gsap.to(btn1, { scale: 1, duration: 0.2 }));
        }
        if (btn2) {
            btn2.addEventListener("mouseenter", () => gsap.to(btn2, { scale: 1.05, duration: 0.2 }));
            btn2.addEventListener("mouseleave", () => gsap.to(btn2, { scale: 1, duration: 0.2 }));
        }
    }, []);

    return (
        <div className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center">

            {/* 3D Background Canvas */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <pointLight position={[-10, -10, -5]} color="#3b82f6" intensity={2} />

                    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                        <Microphone />
                    </Float>

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2 + 0.2}
                        minPolarAngle={Math.PI / 2 - 0.2}
                    />
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 drop-shadow-lg">
                        Your Voice Can <span className="text-primary glow-text">Fix the System.</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Submit complaints instantly using voice recognition. A modern, transparent, and seamless way to be heard.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link to="/login">
                        <Button ref={buttonRef1} size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            Start Complaint
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button ref={buttonRef2} variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-background/50 backdrop-blur-md">
                            Explore System
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* CSS Effects */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .glow-text {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
      `}} />
        </div>
    );
}
