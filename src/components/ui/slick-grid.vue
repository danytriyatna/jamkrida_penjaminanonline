<template>
    <div ref="slickGridContainer" style="width:100%; height: 100vh;"></div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { SlickGrid } from 'slickgrid';

export default {
    name: 'SlickGridComponent',
    setup() {
        const slickGridContainer = ref(null);

        onMounted(() => {
            const gridOptions = {
                enableCellNavigation: true,
                enableColumnReorder: false,
            };

            const columns = [
                { id: "id", name: "ID", field: "id", width: 60 },
                { id: "name", name: "Name", field: "name", width: 150 },
                { id: "age", name: "Age", field: "age", width: 100 },
            ];

            const data = [
                { id: 1, name: "John", age: 28 },
                { id: 2, name: "Jane", age: 34 },
                { id: 3, name: "Sam", age: 40 },
                { id: 4, name: "Sara", age: 25 },
            ];

            // Initialize SlickGrid
            new SlickGrid(slickGridContainer.value, data, columns, gridOptions);
        });

        return {
            slickGridContainer,
        };
    },
};
</script>

<style scoped>
/* Optional: Add custom styles for your grid container */
</style>