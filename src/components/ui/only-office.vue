<template>
    <DocumentEditor id="docEditor" :documentServerUrl="server" :config="config" :height="height" :width="width"
        :events_onDocumentReady="onDocumentReady" :onLoadComponentError="onLoadComponentError" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DocumentEditor } from "@onlyoffice/document-editor-vue";

export default defineComponent({
    name: 'OnlyOffice',
    components: {
        DocumentEditor
    },
    props: {
        config: {
            type: Object,
            required: false
        },
        server: {
            type: String,
            required: true
        },
        height: {
            type: String,
            default: '100%'
        },
        width: {
            type: String,
            default: '100%'
        }
    },
    data() {
        return {
            editor: null
        }
    },
    methods: {
        onDocumentReady() {
            // In Vue 3 DefineComponent, we can use window to reach internal onlyoffice api
            try {
                // @ts-ignore
                this.editor = window.DocsAPI?.DocEditor?.instances?.['docEditor'] || window.DocEditor?.instances?.['docEditor'];
                console.log("OnlyOffice: Document is ready, instance captured.");
            } catch (e) {
                console.error("OnlyOffice: Failed to capture instance on ready:", e);
            }
        },
        requestSave() {
            try {
                // Attempt to re-capture if null
                if (!this.editor) {
                    // @ts-ignore
                    this.editor = window.DocsAPI?.DocEditor?.instances?.['docEditor'] || window.DocEditor?.instances?.['docEditor'];
                }

                if (this.editor) {
                    console.log("OnlyOffice: Force saving...");
                    this.editor.serviceCommand("forceSave");
                } else {
                    console.warn("OnlyOffice: Editor instance NOT FOUND! Force Save failed.");
                }
            } catch (e) {
                console.error("OnlyOffice: Error during Force Save:", e);
            }
        },
        onLoadComponentError(errorCode, errorDescription) {
            switch (errorCode) {
                case -1: // Unknown error loading component
                    // console.log(errorDescription);
                    break;

                case -2: // Error load DocsAPI from http://documentserver/
                    // console.log(errorDescription);
                    break;

                case -3: // DocsAPI is not defined
                    // console.log(errorDescription);
                    break;
                default:
                    console.log("Error", errorDescription);
                    break;
            }
        },
        onEditorError(error) {
            console.error("❌ Document error:", error)
            // di sini biasanya error.description = "Document not found"
            // bisa kasih notif ke user misalnya pakai toast
        },
        onAppError(error) {
            console.error("❌ App error (kemungkinan download gagal):", error)
            this.$emit("error", { type: "app", ...error })
        }
    },
});
</script>