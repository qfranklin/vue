<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <section class="privacy-policy">
        <h1>Privacy Policy</h1>
        <p>Last updated: 11/17/24</p>

        <h2>Introduction</h2>
        <p>Welcome to our Privacy Policy page. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we handle your personal data when you visit our website and use our services.</p>

        <h2>Data Collection</h2>
        <p>We collect personal data that you provide to us directly, such as when you register for an account, make a purchase, or contact us for support. We also collect data automatically as you navigate through our site, such as your IP address, browser type, and usage data.</p>

        <h2>Use of Data</h2>
        <p>We use your personal data to provide and improve our services, process transactions, communicate with you, and comply with legal obligations. We may also use your data for marketing purposes, but you can opt out at any time.</p>

        <h2>Data Sharing</h2>
        <p>We do not sell your personal data. We may share your data with third-party service providers who assist us in providing our services, such as payment processors and hosting providers. We ensure that these providers comply with data protection laws.</p>

        <h2>Data Protection</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, disclosure, alteration, and destruction. However, no security measures are completely foolproof, and we cannot guarantee absolute security.</p>

        <h2>Your Rights</h2>
        <p>You have the right to access, correct, delete, and restrict the processing of your personal data. You also have the right to object to the processing of your data and to data portability. To exercise these rights, please contact us at [Contact Information].</p>

        <h2>Compliance with Laws</h2>
        <p>We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) in the EU, the California Consumer Privacy Act (CCPA) in California, and AWS data protection requirements. We may update this privacy policy to reflect changes in our practices or legal requirements.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about our privacy policy or data practices, please contact us at [Contact Information].</p>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

export default defineComponent({
  name: 'PrivacyPolicyPage',
  components: {
    HeaderComponent
  }
})
</script>

<style scoped>
.main-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}
.privacy-policy {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
}
h1, h2 {
  color: #333;
}
p {
  line-height: 1.6;
  margin-bottom: 1rem;
}
@media (min-width: 1024px) {
  .privacy-policy {
    padding: 4rem;
  }
}
</style>
