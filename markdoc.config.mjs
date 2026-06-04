import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    AmazonButton: {
      render: component('./src/components/AmazonButton.astro'),
      attributes: {
        link: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: false,
        },
      },
    },
  },
});
