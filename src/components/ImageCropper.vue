<template>
  <div class="mainCropper">
    <div class="editCropper">
      {{count}}
      <img id="image" :src="imageSrc" alt="image" />
      <div class="">
        <!-- <cutList :listDownload="cutList"/> -->
        <div class="cutList">
          <div class="contentList"  v-if="cutList">
            <div v-for="(item , index) in cutList" :key="index" :id="'listItem'+item.id" class="list">
              <button @click="whatElement(item.id)">Predecir</button>
              <img :src="item.image" :alt="'imagencortada_'+index" :id="item.id">
              <div class="itemDownload">
                Corte {{ index + 1 }}
                <button @click="downloadImage(item)">Download</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="infoCropper">
      <div class="form">
        <label for="campX">Cordenada X</label>
        <input id="campX" type="number" v-model="coordinate.x" @input="updateCropperData">
      </div>
      <div class="form">
        <label for="campY">Cordenada Y</label>
        <input id="campY" type="number" v-model="coordinate.y" @input="updateCropperData">
      </div>
      <div class="form">
        <label for="campwidth">Width</label>
        <input id="campwidth" type="number" v-model="coordinate.width" @input="updateCropperData">
      </div>
      <div class="form">
        <label for="campHeight">Height</label>
        <input id="campHeight" type="number" v-model="coordinate.height" @input="updateCropperData">
      </div>
      <button @click="cropImage">Recortar imagen</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Cropper from "cropperjs";
import { storeToRefs } from "pinia";
import {useCounterCuts} from '@/store/index'

export default {
  setup() {
    const imageSrc = ref("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTjszT0k8iRHP8SrT_GlKBwfqbRGMgVMDNMYmv1R2GmXSgMIkNWOm2alNN9IXocYyKa4I&usqp=CAU");
    let cropper = null;
    let cropperData = null;
    const coordinate = ref({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
    let croppedImage = null;
    const cutList = ref([]);
    let modelMobilenet = null;
    let classifier = null;
    const useCounter = useCounterCuts()
    const { count } = storeToRefs(useCounter);
    const { increment } = useCounter;

    onMounted(() => {
      initialMobilenet()
      initializeCropper()
    });

    const initialMobilenet = async () => {
      modelMobilenet = await mobilenet.load();
      classifier = await knnClassifier.create();
      console.log({modelMobilenet},{classifier})
    };

    const initializeCropper = () => {
      if (cropper !== null) {
        cropper.destroy();
      }
      cropper = new Cropper(document.getElementById("image"), {
        viewMode: 1,
        preview: ".preview",
        responsive: true,
        background: false,
        ready: () => {
          cropperData = cropper.getData();
        },
        crop: (event) => {
          coordinate.value.x = Math.round(event.detail.x);
          coordinate.value.y = Math.round(event.detail.y);
          coordinate.value.width = Math.round(event.detail.width);
          coordinate.value.height = Math.round(event.detail.height);
        }
      });
    };

    const cropImage = async () => {
      //Genera el nuevo corte y lo envia al componente hijo cutList
      const croppedCanvas = cropper.getCroppedCanvas();
      croppedImage = new Image();
      croppedImage.src = croppedCanvas.toDataURL();

      // Generar un ID aleatorio
      const id = Math.random().toString(36).substr(2, 9);
      cutList.value.push({ id, image: croppedImage.src });
      console.log(cutList.value)
      cropperData = cropper.getData();
      setTimeout(()=>{
        analisisImg(id)
        increment()
      },500)
    };

    const updateCropperData = () => {
      // Actualizar las coordenadas del recorte
      cropperData.x = coordinate.value.x;
      cropperData.y = coordinate.value.y;
      cropperData.width = coordinate.value.width;
      cropperData.height = coordinate.value.height;

      // Actualizar la vista previa del recorte
      cropper.setData(cropperData);
    };

    const downloadImage = (item) => {
      const link = document.createElement('a');
      link.href = item.image;
      link.download = 'cropped_image.png';
      link.click();
    };

    const analisisImg = async (imagenId) => {
      const image = document.getElementById(imagenId);
      if (modelMobilenet) { // verificar que modelMobilenet esté definido
        const predictions = await modelMobilenet.classify(image);
        console.log(predictions);
        classifierImg(image)
      } else {
        console.error('modelMobilenet is null or undefined');
      }
    };
    const classifierImg = async (image) => {
      const imgPixels = await tf.browser.fromPixels(image);
      const activation = await modelMobilenet.infer(imgPixels, true);
      // Agrega un ejemplo con la etiqueta "boton"
      classifier.addExample(activation, 'boton')

      // Utiliza el modelo knn classifier para predecir la clase de la imagen
      const result = await classifier.predictClass(activation);

      console.log("La imagen es un " + result.label);

      imgPixels.dispose();
    };
    const whatElement = async (imagenId) =>{
      // Este metodo predice que tipo de elemento es la imagen
      const image = document.getElementById(imagenId)
      const imgPixels = await tf.browser.fromPixels(image)
      const activation = modelMobilenet.infer(imgPixels, 'conv_preds')
      var result2;
      try {
        result2 = await classifier.predictClass(activation);
        console.log('result2: ', result2)
      } catch (error) {
        console.log('modelo no configurado',error)
      }
    }
    return {
      cutList,
      imageSrc,
      cropper,
      cropperData,
      coordinate,
      croppedImage,
      initialMobilenet,
      modelMobilenet,
      classifier,
      cropImage,
      updateCropperData,
      downloadImage,
      whatElement,
      useCounter,
      count,
      increment
    }
  }
}
</script>
<style lang="scss">
.mainCropper{
  display: flex;
  .infoCropper{
    margin-left: 30px;
    text-align: left;
    .form{
      margin-bottom: 6px;
      &:last-child{
        margin-bottom: 0;
      }
      input{
        display: block;
      }
    }
    button{
      display: block;
      margin-bottom: 6px;
      &:last-child{margin-bottom: 0;}
    }
  }
  .editCropper{
    width:50%;
    height: 400px;
  }
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
}
</style>