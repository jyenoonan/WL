<template>
    <div v-if="isUrlValid" class="ww-calendly-embed" ref="calendlyElement" :class="{ editing: isEditing }"></div>
    <div v-else class="placeholder">
        <p class="message">Please provide a Calendly URL in the settings of this element</p>
    </div>
</template>

<script>
import { nextTick } from "vue";

export default {
    props: {
        content: { type: Object, required: true },

    },
    emits: ["trigger-event"],
    watch: {
        content: {
            deep: true,
            async handler() {
                if (window.__WW_IS_PRERENDER__) return;
                if (!this.isUrlValid) return;

                if (wwLib.getFrontWindow().Calendly) {
                    await nextTick();
                    this.$refs.calendlyElement.replaceChildren();
                    wwLib.getFrontWindow().Calendly.initInlineWidget(this.settings);
                }
            },
        },
    },
    computed: {
        isEditing() {

            // eslint-disable-next-line no-unreachable
            return false;
        },
        settings() {
            const settings = {
                url: `${this.content.url}?hide_landing_page_details=1&hide_gdpr_banner=1`,
                parentElement: this.$refs.calendlyElement,
            };

            const prefill = {
                name: this.content.prefillName,
                email: this.content.prefillMail,
            };

            return this.content.prefillOptions ? { ...settings, prefill } : settings;
        },
        isUrlValid() {
            const expression =
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
            const regex = new RegExp(expression);

            return this.content.url.match(regex);
        },
    },
    methods: {
        isCalendlyEvent(e) {
            return e.origin === "https://calendly.com" && e.data.event && e.data.event.indexOf("calendly.") === 0;
        },
        eventHandlers(e) {
            if (this.isCalendlyEvent(e)) {
                switch (e.data.event) {
                    case "calendly.date_and_time_selected":
                        this.$emit("trigger-event", { name: "dateAndTime" });
                        break;
                    case "calendly.event_scheduled":
                        this.$emit("trigger-event", { name: "booked" });
                        break;
                    default:
                        break;
                }
            }
        },
        async initCalendly() {
            if (!this.isUrlValid) return;

            await nextTick();
            wwLib.getFrontWindow().Calendly.initInlineWidget(this.settings);
        },
    },
    mounted() {
        if (window.__WW_IS_PRERENDER__) return;

        const doc = wwLib.getFrontDocument();
        let script = doc.querySelector("[data-name='calendly-script']");
        const isScript = !!script;

        if (!isScript) {
            script = doc.createElement("script");
            script.setAttribute("data-name", "calendly-script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", "https://assets.calendly.com/assets/external/widget.js");
            script.setAttribute("async", true);
            doc.body.appendChild(script);

            script.addEventListener("load", () => {
                this.initCalendly();
            });
        } else {
            this.initCalendly();
        }

        window.addEventListener("message", (e) => this.eventHandlers(e));
    },
    beforeUnmount() {
        window.removeEventListener("message", (e) => this.eventHandlers(e));
    },
};
</script>

<style lang="scss" scoped>
.ww-calendly-embed {
    position: relative;
    &.editing::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
    }
}
.placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);

    .message {
        padding: 2rem;
        margin: 2rem;
        border-radius: 1rem;
        background-color: white;
    }
}
</style>
