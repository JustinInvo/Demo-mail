<template>
  <div class="cutList">
    <div class="contentList">
      {{ listDownload }}
      <div v-if="listDownload" v-for="(item , index) in listDownload" :key="index" :id="'listItem'+index" class="list">
        <img :src="item" :alt="'imagencortada_'+index" :id="'IdImg'+index">
        <div class="itemDownload">
          Corte {{ index + 1 }}
          <button @click="downloadImage(item)">Download</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';
export default{
  props:{
    listDownload:{
      type: Array,
      required: true
    }
  },
  data(){
    return{
      modelMobilenet:null
    }
  },
  created(){
    this.initialMobilenet()
  },
  mounted() {
    console.log('listDownload:', this.listDownload);
  },
  watch: {
    listDownload(newListDownload, oldListDownload) {
      console.log('listDownload changed:', newListDownload);
    }
  },
  methods:{
    downloadImage(item) {
      const link = document.createElement('a');
      link.href = item;
      link.download = 'cropped_image.png';
      link.click();
    },
    async initialMobilenet(){
      const model = await mobilenet.load();
      this.modelMobilenet = model;
    },
    async analisisImg(){
      const image = document.getElementById('listItem'+id);
      const predictions = await this.modelMobilenet .classify(image);
      console.log(predictions);
    }
  }
}
</script>
<style lang="scss">
  .cutList{
    margin-top:50px;
    .contentList{
      .list{
        display: flex;
        flex-direction: column;
        position: relative;
        &:hover{
          .itemDownload{
            opacity: 1;
          }
        }
        .itemDownload{
          transition: 0.3s all ease;
          opacity: 0;
          background: #6125cf;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          left: 0;
          color: white;
          width: 150px;
          height: 60px;
          display: flex;
          flex-direction: column;
          padding: 15px;
          justify-content: space-between;
          border-radius: 8px;
          button{
            background: white;
            color: #6125cf;
            border: 1px solid white;
            border-radius: 6px;
            padding: 4px;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>