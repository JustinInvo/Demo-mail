<template>
  <div class="home">
    <ImageCropper/>
  </div>
</template>

<script>
// @ is an alias to /src
import ImageCropper from '@/components/ImageCropper.vue'

export default {
  name: 'App',
  components: {
    ImageCropper,
  }
}
</script>
