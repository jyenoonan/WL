import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"index":{"outputDir":"./","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/"}]},"home":{"outputDir":"./home","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/home/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/home/"}]},"client_app_final":{"outputDir":"./client_app_final","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/client_app_final/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/client_app_final/"}]},"login-clients":{"outputDir":"./login-clients","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/login-clients/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/login-clients/"}]},"signup-client_app":{"outputDir":"./signup-client_app","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/signup-client_app/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/signup-client_app/"}]},"test":{"outputDir":"./test","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/test/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/test/"}]},"signup-customer":{"outputDir":"./signup-customer","lang":"en","cacheVersion":110,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"<script>\r\n  document.addEventListener('click', function(event) {\r\n    const component = document.getElementById('325432532543524534654775');\r\n    if (component && !component.contains(event.target)) {\r\n      // Set the WeWeb variable to false\r\n      window.$weweb.setVariableValue('n8nconnect-display', false);\r\n    }\r\n  });\r\n</script>\r\n\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/signup-customer/"},{"rel":"alternate","hreflang":"en","href":"https://a91327e9-0bae-46f5-a5f8-42d56d15d3f7.weweb-preview.io/signup-customer/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});
