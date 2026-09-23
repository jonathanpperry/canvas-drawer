import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;
  saveX: number = 0;
  saveY: number = 0;
  drawing = false;

  selectedColor = '#9e2956';
  colors = [
    '#9e2956',
    '#c2281d',
    '#de722f',
    '#edbf4c',
    '#5db37e',
    '#459cde',
    '#4250ad',
    '#802fa3',
  ];
  lineWidth = 7;

  constructor(
    private plt: Platform,
    // private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController,
  ) {}

  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  selectColor(color: any) {
    this.selectedColor = color;
  }

  startDrawing(ev: any) {
    this.drawing = true;
    const canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;
  }

  startDrawingMobile(ev: any) {
    this.drawing = true;
    const canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  moved(ev: any) {
    if (!this.drawing) return;
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    let currentX = ev.pageX - canvasPosition.x;
    let currentY = ev.pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  movedMobile(ev: any) {
    if (!this.drawing) return;
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  setBackground() {
    var background = new Image();
    background.src = './assets/coupon_pic_lg.png';
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      ctx.drawImage(
        background,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height,
      );
    };
  }

  clearCanvas() {
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async exportCanvasImage() {
    const dataUrl = this.canvasElement.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const fileName = `canvas-${timestamp}.png`;
    const filePath = `CanvasDrawer/${fileName}`;

    try {
      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: filePath,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        console.log('Canvas saved:', result.uri);

        const toast = await this.toastCtrl.create({
          message: `Saved ${fileName} to Documents/CanvasDrawer`,
          duration: 3000,
          position: 'bottom',
        });

        await toast.present();
      } else {
        const blob = this.b64toBlob(base64Data, 'image/png');
        const url = window.URL.createObjectURL(blob);

        const a = window.document.createElement('a');
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      }

      this.clearCanvas();
    } catch (error) {
      console.error('Could not export canvas image:', error);

      const toast = await this.toastCtrl.create({
        message: 'Could not save canvas image.',
        duration: 3000,
        position: 'bottom',
      });

      await toast.present();
    }
  }

  b64toBlob(b64Data: any, contentType: any) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
