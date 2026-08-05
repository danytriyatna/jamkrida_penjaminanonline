<template>
    <div class="jamkrida-loader-overlay">
        <div class="loader-card">

            <!-- Core Animation Container -->
            <div class="animation-stage">
                <div class="pulse-ring"></div>
                <div class="pulse-ring delay"></div>

                <!-- Animated Logo inside the circle -->
                <div class="logo-wrapper">
                    <img src="@/assets/logo.png" alt="Jamkrida Logo" class="brand-logo" />
                </div>
            </div>

            <div class="text-content">
                <h2 class="title">Memuat Sistem...</h2>
                <p class="subtitle">Harap tunggu sebentar, sistem sedang merekonsiliasi data Anda</p>
            </div>

            <div class="modern-progress">
                <div class="progress-indicator"></div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    // Logic if needed
});
</script>

<style scoped>
.jamkrida-loader-overlay {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999999;
    /* Light professional gradient background */
    background: radial-gradient(circle at 60% 40%, #ffffff 0%, #f1f5f9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    overflow: hidden;
}

/* Subtle light flares for corporate depth in light mode */
.jamkrida-loader-overlay::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, rgba(13, 150, 72, 0.05) 0%, transparent 60%);
    border-radius: 50%;
    filter: blur(60px);
    animation: drift 12s infinite alternate;
}

.jamkrida-loader-overlay::after {
    content: '';
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, rgba(44, 54, 145, 0.05) 0%, transparent 60%);
    border-radius: 50%;
    filter: blur(60px);
    animation: drift 15s infinite alternate-reverse;
}

.loader-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.85);
    /* Slightly transparent white */
    padding: 50px 40px;
    border-radius: 20px;
    /* Soft, elegant drop shadow */
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    max-width: 420px;
    width: 90%;
    text-align: center;
    z-index: 2;
    animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-stage {
    position: relative;
    width: 130px;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
}

.pulse-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    /* Using Jamkrida's brand colors */
    border: 2px solid rgba(13, 150, 72, 0.2);
    animation: ripple 2s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite;
}

.pulse-ring.delay {
    animation-delay: 1s;
    border-color: rgba(44, 54, 145, 0.2);
}

.logo-wrapper {
    background: #ffffff;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.02);
    z-index: 2;
    padding: 15px;
    animation: gentleFloat 3s ease-in-out infinite;
}

.brand-logo {
    max-width: 100%;
    height: auto;
    max-height: 38px;
}

.text-content {
    margin-bottom: 36px;
}

.title {
    font-size: 1.45rem;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1e293b;
    /* Dark slate for elegance */
    letter-spacing: -0.01em;
}

.subtitle {
    font-size: 0.95rem;
    color: #64748b;
    /* Medium slate */
    line-height: 1.5;
    margin: 0;
    padding: 0 10px;
}

.modern-progress {
    width: 100%;
    height: 4px;
    /* Thinner, more elegant */
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-indicator {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 30%;
    border-radius: 4px;
    background: linear-gradient(90deg, #0d9648, #2c3691);
    /* Green to Blue */
    box-shadow: 0 0 8px rgba(44, 54, 145, 0.4);
    animation: scanning 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Base Animations */
@keyframes scanning {
    0% {
        left: -30%;
        width: 30%;
    }

    50% {
        width: 50%;
    }

    100% {
        left: 100%;
        width: 30%;
    }
}

@keyframes ripple {
    0% {
        transform: scale(0.8);
        opacity: 1;
        border-width: 3px;
    }

    100% {
        transform: scale(1.6);
        opacity: 0;
        border-width: 1px;
    }
}

@keyframes gentleFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-6px);
    }
}

@keyframes slideUpFade {
    0% {
        transform: translateY(20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes drift {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(3%, -3%);
    }
}
</style>
