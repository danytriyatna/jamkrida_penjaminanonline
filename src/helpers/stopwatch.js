import { ref } from "vue";

export function useStopwatch() {
    const time = ref(0);
    const isRunning = ref(false);
    let timer = null;

    const start = () => {
        if (!isRunning.value) {
            isRunning.value = true;
            timer = setInterval(() => {
                time.value++;
            }, 1000);
        }
    };

    const pause = () => {
        isRunning.value = false;
        clearInterval(timer);
    };

    const reset = () => {
        pause();
        time.value = 0;
    };

    return { time, isRunning, start, pause, reset };
}
